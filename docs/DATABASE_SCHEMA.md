# Merock Real Estate — Database Schema (v2, Right-Sized)

**Target RDBMS:** PostgreSQL 15+ · **18 tables** · Replaces the 63-table reference design (kept at `DATABASE_ARCHITECTURE.md` as the future-growth reference).

---

## 1. Design Philosophy — what 15+ years teaches you

The previous design was "everything a real estate platform could ever need." Real products die under that weight. The rules applied here:

1. **Model the product you have, not the company you might become.** Merock = single brokerage, 4 roles, properties, enquiry pipeline, visits, deals, referrals. That's ~18 tables, not 63.
2. **Every cut must be reversible without data loss.** Each simplification below has a documented "when to split" trigger.
3. **One table per real screen/workflow.** If no screen reads it and no job writes it, it doesn't exist yet.
4. **Don't simplify the things that are cheap to do right from day one:** UUID PKs, money as NUMERIC, soft deletes on core entities, an audit log, hashed tokens. Retrofitting *those* is what's expensive.

### What was cut, and why

| Cut | Folded into | Bring it back when… |
|---|---|---|
| `tenants` + RLS (multi-tenancy) | — (single company) | You onboard a second brokerage |
| `listings` separate from `properties` | `properties` (listing fields inline) | Same property needs simultaneous sale + rent listings |
| `roles`/`permissions`/`user_roles` (4 tables) | `users.role` enum | You need custom roles or per-user permission overrides |
| `leads` separate from `enquiries` | `enquiries` (it IS your pipeline: enquired→visited→negotiating→converted) | Marketing channels create leads before a property is chosen |
| `leases` + `rent_schedules` | `transactions` (lease columns) + `payments` rows | You build automated recurring rent invoicing |
| `invoices` + `invoice_items` | `payments` (receipt fields) | Tax/GST invoicing is required |
| `media_assets` registry | URL columns | You need dedup/virus-scan/central media admin |
| `locations` hierarchy + PostGIS | `city` + `locality` text columns | Multi-city launch or radius search |
| CMS / blog / SEO (6 tables) | — | Marketing team exists |
| Support tickets (2 tables) | — | Support volume justifies it |
| Notification templates/deliveries/preferences | single `notifications` | You add SMS/push providers with retries |
| Analytics event streams + partitioning | `properties.views_count` + `audit_logs` | Real analytics dashboard requirements |
| Bookings (token advance) | `transactions.status='booked'` + token payment row | Online payment-gated reservations launch |

---

## 2. Entity Overview (18 tables)

```
AUTH      users · auth_tokens
PROFILES  agent_profiles · client_profiles
CATALOG   property_types · amenities · properties · property_images · property_amenities
CRM       enquiries · enquiry_activities · property_visits · saved_properties
DEALS     transactions · payments
SOCIAL    reviews · referrals
PLATFORM  notifications · audit_logs
```

Wait — that's 19 names; `auth_tokens` covers refresh + password-reset + email-verify in one table (a `purpose` column), which is the kind of consolidation that saves three tables with zero loss.

---

## 3. Schema

> Conventions: `id UUID PK DEFAULT gen_random_uuid()`, `created_at`/`updated_at TIMESTAMPTZ NOT NULL DEFAULT now()` on every table (not repeated below). Money = `NUMERIC(14,2)`. Soft delete (`deleted_at`) only where the product needs undelete/history: users, properties, enquiries, transactions.

### users
One row per human; single role keeps authz trivial (`admin`, `agent`, `client`, `member` — matches `AuthContext.jsx`).

| Column | Type | Null | Default | Constraint |
|---|---|---|---|---|
| id | UUID | NO | gen_random_uuid() | PK |
| name | VARCHAR(150) | NO | — | |
| email | CITEXT | NO | — | UNIQUE WHERE deleted_at IS NULL |
| phone | VARCHAR(20) | YES | — | |
| password_hash | VARCHAR(255) | NO | — | bcrypt/argon2 |
| role | VARCHAR(10) | NO | 'client' | CHECK (role IN ('admin','agent','client','member')) |
| avatar_url | VARCHAR(500) | YES | — | |
| status | VARCHAR(10) | NO | 'active' | CHECK (status IN ('active','inactive','banned')) |
| email_verified_at | TIMESTAMPTZ | YES | — | |
| last_login_at | TIMESTAMPTZ | YES | — | |
| deleted_at | TIMESTAMPTZ | YES | — | |

Index: `(role, status)`.

### auth_tokens
Refresh tokens, password resets, email verification — one table, one sweep job.

| Column | Type | Null | Default | Constraint |
|---|---|---|---|---|
| id | UUID | NO | gen_random_uuid() | PK |
| user_id | UUID | NO | — | FK→users ON DELETE CASCADE |
| token_hash | CHAR(64) | NO | — | UNIQUE (SHA-256; raw token never stored) |
| purpose | VARCHAR(20) | NO | — | CHECK IN ('refresh','password_reset','email_verify') |
| expires_at | TIMESTAMPTZ | NO | — | |
| used_at | TIMESTAMPTZ | YES | — | single-use for reset/verify |
| revoked_at | TIMESTAMPTZ | YES | — | |

Index: `(user_id, purpose)`, `(expires_at)`.

### agent_profiles (1:1 users)
| Column | Type | Null | Default | Constraint |
|---|---|---|---|---|
| user_id | UUID | NO | — | **PK**, FK→users ON DELETE CASCADE |
| specialization | VARCHAR(150) | YES | — | 'Luxury Residential' |
| operating_area | VARCHAR(150) | YES | — | 'Banjara Hills' |
| bio | TEXT | YES | — | |
| license_no | VARCHAR(50) | YES | — | RERA |
| commission_rate_pct | NUMERIC(5,2) | NO | 2.00 | |
| rating_avg | NUMERIC(3,2) | NO | 0 | recomputed from reviews |
| rating_count | INT | NO | 0 | |
| joined_date | DATE | NO | CURRENT_DATE | |

> `properties`, `clients`, `dealsClosedThisMonth`, `earnings` from your mock data are **computed**, not stored — COUNT/SUM queries over properties, client_profiles, transactions. Don't cache until it's slow.

### client_profiles (1:1 users)
| Column | Type | Null | Default | Constraint |
|---|---|---|---|---|
| user_id | UUID | NO | — | **PK**, FK→users ON DELETE CASCADE |
| client_type | VARCHAR(10) | NO | 'buyer' | CHECK IN ('buyer','seller','investor','tenant') |
| budget_min | NUMERIC(14,2) | YES | — | |
| budget_max | NUMERIC(14,2) | YES | — | CHECK (budget_max IS NULL OR budget_max >= budget_min) |
| preferences | JSONB | NO | '{}' | {propertyTypes, locations, bedrooms, amenities} — matches clients.js |
| assigned_agent_id | UUID | YES | — | FK→users ON DELETE SET NULL |

### property_types
Lookup (admin-editable) — Apartment, Villa, Studio, Penthouse, Commercial, Plot.

| Column | Type | Null | Default | Constraint |
|---|---|---|---|---|
| id | SMALLSERIAL | NO | — | PK |
| name | VARCHAR(60) | NO | — | UNIQUE |
| is_active | BOOLEAN | NO | true | |

### amenities
| Column | Type | Null | Default | Constraint |
|---|---|---|---|---|
| id | SMALLSERIAL | NO | — | PK |
| name | VARCHAR(60) | NO | — | UNIQUE — Gym, Swimming Pool, Gated Community… |
| is_active | BOOLEAN | NO | true | |

### properties
Asset + listing in one table — correct while one property has one offer at a time.

| Column | Type | Null | Default | Constraint |
|---|---|---|---|---|
| id | UUID | NO | gen_random_uuid() | PK |
| reference_code | VARCHAR(12) | NO | — | UNIQUE — 'P-0001' (human ID, like your P001) |
| title | VARCHAR(200) | NO | — | |
| slug | VARCHAR(220) | NO | — | UNIQUE — public URL |
| description | TEXT | YES | — | |
| type_id | SMALLINT | NO | — | FK→property_types |
| listing_type | VARCHAR(4) | NO | 'sale' | CHECK IN ('sale','rent') |
| price | NUMERIC(14,2) | NO | — | CHECK (price > 0) — sale price or monthly rent |
| security_deposit | NUMERIC(14,2) | YES | — | rent only |
| area_sqft | NUMERIC(10,2) | YES | — | |
| bedrooms | SMALLINT | YES | — | |
| bathrooms | SMALLINT | YES | — | |
| furnishing | VARCHAR(12) | YES | — | CHECK IN ('unfurnished','semi','fully') |
| address | VARCHAR(255) | YES | — | |
| locality | VARCHAR(100) | NO | — | 'Banjara Hills' |
| city | VARCHAR(80) | NO | 'Hyderabad' | |
| latitude / longitude | NUMERIC(9,6) | YES | — | |
| status | VARCHAR(12) | NO | 'draft' | CHECK IN ('draft','active','reserved','sold','rented','inactive') |
| tags | TEXT[] | NO | '{}' | 'Premium', 'Sea View' — display chips, not joined |
| owner_id | UUID | YES | — | FK→users ON DELETE SET NULL (seller/landlord) |
| agent_id | UUID | YES | — | FK→users ON DELETE SET NULL |
| created_by | UUID | NO | — | FK→users |
| is_featured | BOOLEAN | NO | false | |
| views_count | INT | NO | 0 | |
| listed_at | TIMESTAMPTZ | YES | — | |
| deleted_at | TIMESTAMPTZ | YES | — | |

Indexes: `(status, listing_type)`, `(city, locality)`, `(type_id)`, `(agent_id)`, `(price)`, GIN `(tags)`.

### property_images
| Column | Type | Null | Default | Constraint |
|---|---|---|---|---|
| id | UUID | NO | gen_random_uuid() | PK |
| property_id | UUID | NO | — | FK→properties ON DELETE CASCADE |
| url | VARCHAR(500) | NO | — | |
| is_primary | BOOLEAN | NO | false | partial UNIQUE(property_id) WHERE is_primary |
| sort_order | SMALLINT | NO | 0 | |

### property_amenities
| Column | Type | Null | Default | Constraint |
|---|---|---|---|---|
| property_id | UUID | NO | — | **PK(property_id, amenity_id)**, FK CASCADE |
| amenity_id | SMALLINT | NO | — | FK→amenities |

### enquiries
Your CRM pipeline, exactly as `enquiries.js` works — no separate leads table.

| Column | Type | Null | Default | Constraint |
|---|---|---|---|---|
| id | UUID | NO | gen_random_uuid() | PK |
| property_id | UUID | NO | — | FK→properties |
| client_id | UUID | NO | — | FK→users |
| agent_id | UUID | YES | — | FK→users ON DELETE SET NULL |
| message | TEXT | YES | — | |
| source | VARCHAR(20) | NO | 'website' | CHECK IN ('website','referral','walk_in','call') |
| status | VARCHAR(12) | NO | 'enquired' | CHECK IN ('enquired','visited','negotiating','converted','closed') |
| priority | VARCHAR(6) | NO | 'medium' | CHECK IN ('low','medium','high') |
| follow_up_date | DATE | YES | — | |
| closed_reason | VARCHAR(150) | YES | — | |
| deleted_at | TIMESTAMPTZ | YES | — | |

Indexes: `(agent_id, status)`, `(client_id)`, `(property_id)`, `(follow_up_date) WHERE status NOT IN ('converted','closed')`.

### enquiry_activities
Timeline (notes, calls, status changes) — replaces the single mutable `notes` field, which loses history.

| Column | Type | Null | Default | Constraint |
|---|---|---|---|---|
| id | UUID | NO | gen_random_uuid() | PK |
| enquiry_id | UUID | NO | — | FK→enquiries ON DELETE CASCADE |
| author_id | UUID | NO | — | FK→users |
| activity_type | VARCHAR(15) | NO | 'note' | CHECK IN ('note','call','status_change','visit') |
| body | TEXT | YES | — | |

Index: `(enquiry_id, created_at DESC)`.

### property_visits
| Column | Type | Null | Default | Constraint |
|---|---|---|---|---|
| id | UUID | NO | gen_random_uuid() | PK |
| enquiry_id | UUID | NO | — | FK→enquiries ON DELETE CASCADE |
| scheduled_at | TIMESTAMPTZ | NO | — | |
| status | VARCHAR(12) | NO | 'scheduled' | CHECK IN ('scheduled','completed','no_show','cancelled') |
| feedback | TEXT | YES | — | |
| rating | SMALLINT | YES | — | CHECK (rating BETWEEN 1 AND 5) |

Index: `(scheduled_at)` — agent calendar derives via enquiry join.

### saved_properties
| Column | Type | Null | Default | Constraint |
|---|---|---|---|---|
| user_id | UUID | NO | — | **PK(user_id, property_id)**, FK CASCADE |
| property_id | UUID | NO | — | FK→properties ON DELETE CASCADE |
| saved_at | TIMESTAMPTZ | NO | now() | |

### transactions
One closed deal — sale or rental (lease terms inline; split only when recurring rent automation arrives).

| Column | Type | Null | Default | Constraint |
|---|---|---|---|---|
| id | UUID | NO | gen_random_uuid() | PK |
| transaction_no | VARCHAR(15) | NO | — | UNIQUE — 'TXN-0001' |
| transaction_type | VARCHAR(6) | NO | — | CHECK IN ('sale','rent') |
| property_id | UUID | NO | — | FK→properties |
| enquiry_id | UUID | YES | — | FK→enquiries — conversion link |
| buyer_id | UUID | NO | — | FK→users |
| seller_id | UUID | YES | — | FK→users |
| agent_id | UUID | YES | — | FK→users |
| amount | NUMERIC(14,2) | NO | — | sale price or monthly rent |
| commission_amount | NUMERIC(12,2) | NO | 0 | agent earning on this deal |
| lease_start / lease_end | DATE | YES | — | rent only; CHECK (lease_end > lease_start) |
| deposit_amount | NUMERIC(14,2) | YES | — | rent only |
| status | VARCHAR(12) | NO | 'booked' | CHECK IN ('booked','agreement','completed','cancelled') |
| completed_at | TIMESTAMPTZ | YES | — | |
| deleted_at | TIMESTAMPTZ | YES | — | |

Indexes: `(agent_id, status)`, `(buyer_id)`, `(property_id)`.

### payments
Token advance, installments, rent receipts — all money against a transaction.

| Column | Type | Null | Default | Constraint |
|---|---|---|---|---|
| id | UUID | NO | gen_random_uuid() | PK |
| transaction_id | UUID | NO | — | FK→transactions |
| payer_id | UUID | NO | — | FK→users |
| amount | NUMERIC(14,2) | NO | — | CHECK (amount > 0) |
| payment_type | VARCHAR(12) | NO | — | CHECK IN ('token','installment','full','rent','deposit','refund') |
| method | VARCHAR(15) | NO | — | CHECK IN ('upi','card','netbanking','cash','cheque','bank_transfer') |
| gateway_ref | VARCHAR(100) | YES | — | Razorpay/Stripe id |
| idempotency_key | VARCHAR(80) | YES | — | UNIQUE WHERE NOT NULL — the one "enterprise" thing you keep, because double-charges are unfixable |
| status | VARCHAR(10) | NO | 'pending' | CHECK IN ('pending','success','failed','refunded') |
| paid_at | TIMESTAMPTZ | YES | — | |
| notes | VARCHAR(255) | YES | — | |

Index: `(transaction_id)`, `(status, paid_at)`.

### reviews
| Column | Type | Null | Default | Constraint |
|---|---|---|---|---|
| id | UUID | NO | gen_random_uuid() | PK |
| author_id | UUID | NO | — | FK→users |
| agent_id | UUID | YES | — | FK→users |
| property_id | UUID | YES | — | FK→properties; CHECK (one of agent_id/property_id NOT NULL) |
| rating | SMALLINT | NO | — | CHECK (1–5) |
| body | TEXT | YES | — | |
| is_approved | BOOLEAN | NO | false | admin moderation |

Unique: `(author_id, agent_id)` and `(author_id, property_id)` partial uniques — one review per subject.

### referrals
Your member program.

| Column | Type | Null | Default | Constraint |
|---|---|---|---|---|
| id | UUID | NO | gen_random_uuid() | PK |
| referrer_id | UUID | NO | — | FK→users |
| referee_email | CITEXT | NO | — | |
| referee_id | UUID | YES | — | FK→users — set on signup |
| referral_code | VARCHAR(12) | NO | — | UNIQUE |
| status | VARCHAR(10) | NO | 'invited' | CHECK IN ('invited','registered','converted','rewarded') |
| transaction_id | UUID | YES | — | FK→transactions — the converting deal |
| reward_amount | NUMERIC(12,2) | YES | — | |
| rewarded_at | TIMESTAMPTZ | YES | — | |

CHECK `(referrer_id <> referee_id)`. Index: `(referrer_id, status)`.

### notifications
In-app only for now; email fires through the app layer (no delivery-tracking tables yet).

| Column | Type | Null | Default | Constraint |
|---|---|---|---|---|
| id | UUID | NO | gen_random_uuid() | PK |
| user_id | UUID | NO | — | FK→users ON DELETE CASCADE |
| type | VARCHAR(30) | NO | — | 'enquiry_received', 'visit_reminder', 'deal_closed', 'referral_reward'… |
| title | VARCHAR(200) | NO | — | |
| body | TEXT | YES | — | |
| link | VARCHAR(300) | YES | — | deep link |
| read_at | TIMESTAMPTZ | YES | — | |

Index: `(user_id, created_at DESC)`, partial `(user_id) WHERE read_at IS NULL`.

### audit_logs
The other "enterprise" keeper — cheap to write now, impossible to backfill later.

| Column | Type | Null | Default | Constraint |
|---|---|---|---|---|
| id | BIGSERIAL | NO | — | PK (append-only; serial is fine and faster here) |
| actor_id | UUID | YES | — | NULL = system |
| action | VARCHAR(30) | NO | — | create/update/delete/login/status_change |
| entity_type | VARCHAR(30) | NO | — | |
| entity_id | UUID | YES | — | |
| changes | JSONB | YES | — | {field: [old, new]} |
| ip_address | INET | YES | — | |
| created_at | TIMESTAMPTZ | NO | now() | |

Index: `(entity_type, entity_id)`, `(actor_id, created_at)`. App role: INSERT-only.

---

## 4. ER Diagram

```mermaid
erDiagram
    USERS ||--o| AGENT_PROFILES : "agent details"
    USERS ||--o| CLIENT_PROFILES : "client details"
    USERS ||--o{ AUTH_TOKENS : owns
    USERS ||--o{ REFERRALS : refers
    USERS ||--o{ NOTIFICATIONS : receives
    USERS ||--o{ SAVED_PROPERTIES : saves
    USERS ||--o{ REVIEWS : writes

    PROPERTY_TYPES ||--o{ PROPERTIES : classifies
    USERS ||--o{ PROPERTIES : "owns / lists (agent)"
    PROPERTIES ||--o{ PROPERTY_IMAGES : gallery
    PROPERTIES ||--o{ PROPERTY_AMENITIES : has
    AMENITIES ||--o{ PROPERTY_AMENITIES : tagged
    PROPERTIES ||--o{ SAVED_PROPERTIES : saved_by

    PROPERTIES ||--o{ ENQUIRIES : receives
    USERS ||--o{ ENQUIRIES : "client raises / agent handles"
    ENQUIRIES ||--o{ ENQUIRY_ACTIVITIES : timeline
    ENQUIRIES ||--o{ PROPERTY_VISITS : schedules

    ENQUIRIES ||--o| TRANSACTIONS : converts_to
    PROPERTIES ||--o{ TRANSACTIONS : closed_as
    USERS ||--o{ TRANSACTIONS : "buyer / seller / agent"
    TRANSACTIONS ||--o{ PAYMENTS : settled_by
    TRANSACTIONS ||--o{ REFERRALS : rewards

    USERS {
        UUID id PK
        CITEXT email UK
        VARCHAR name
        VARCHAR role "admin|agent|client|member"
        VARCHAR status
    }
    AGENT_PROFILES {
        UUID user_id PK_FK
        VARCHAR specialization
        VARCHAR operating_area
        NUMERIC rating_avg
    }
    CLIENT_PROFILES {
        UUID user_id PK_FK
        VARCHAR client_type
        NUMERIC budget_min
        NUMERIC budget_max
        JSONB preferences
    }
    PROPERTIES {
        UUID id PK
        VARCHAR reference_code UK
        VARCHAR title
        SMALLINT type_id FK
        VARCHAR listing_type "sale|rent"
        NUMERIC price
        VARCHAR locality
        VARCHAR city
        VARCHAR status
        UUID owner_id FK
        UUID agent_id FK
    }
    ENQUIRIES {
        UUID id PK
        UUID property_id FK
        UUID client_id FK
        UUID agent_id FK
        VARCHAR status "enquired..converted"
        VARCHAR priority
        DATE follow_up_date
    }
    PROPERTY_VISITS {
        UUID id PK
        UUID enquiry_id FK
        TIMESTAMPTZ scheduled_at
        VARCHAR status
    }
    TRANSACTIONS {
        UUID id PK
        VARCHAR transaction_no UK
        VARCHAR transaction_type "sale|rent"
        UUID property_id FK
        UUID buyer_id FK
        UUID agent_id FK
        NUMERIC amount
        NUMERIC commission_amount
        VARCHAR status
    }
    PAYMENTS {
        UUID id PK
        UUID transaction_id FK
        NUMERIC amount
        VARCHAR payment_type
        VARCHAR method
        VARCHAR status
    }
    REFERRALS {
        UUID id PK
        UUID referrer_id FK
        VARCHAR referral_code UK
        VARCHAR status
        NUMERIC reward_amount
    }
    REVIEWS {
        UUID id PK
        UUID author_id FK
        UUID agent_id FK
        UUID property_id FK
        SMALLINT rating
    }
```

---

## 5. How dashboard numbers are computed (no analytics tables)

| Screen metric | Query |
|---|---|
| Agent: properties / clients / deals this month / earnings | `COUNT(properties WHERE agent_id)` · `COUNT(client_profiles WHERE assigned_agent_id)` · `COUNT(transactions WHERE agent_id AND completed_at in month)` · `SUM(commission_amount)` |
| Admin dashboard cards | COUNTs over properties/enquiries/transactions with status filters — fine for years at this data size |
| Enquiry funnel chart | `GROUP BY status` on enquiries |
| Agent rating | trigger/job recomputes `agent_profiles.rating_avg` from reviews |

At 100K users / 1M properties these stay fast with the listed indexes. Add a metrics rollup table only when a dashboard query exceeds ~100ms in production.

---

## 6. Growth triggers (the contract with the future)

| Signal in the business | Schema change | Effort |
|---|---|---|
| Second brokerage onboards | Add `tenant_id` + RLS | Medium — additive migration |
| Property listed for sale AND rent at once | Extract `listings` from `properties` | Medium — backfill 1 listing per property |
| Custom roles needed | Add roles/permissions tables, migrate `users.role` | Low |
| Automated monthly rent invoicing | Add `rent_schedules` (+ invoices if GST needed) | Low — transactions already hold lease terms |
| Multi-city + radius search | Add `locations` + PostGIS column, backfill from city/locality strings | Medium |
| SMS/push with retries | Add `notification_deliveries` + templates | Low |
| Marketing/SEO team | Add blog/cms/seo tables | Low — fully additive |

Every trigger is **additive** — nothing in v2 has to be unbuilt. That's the test of a right-sized schema.

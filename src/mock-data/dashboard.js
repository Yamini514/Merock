export const DASHBOARD_STATS = [
  { label: 'Total Properties', value: '248',  change: '+12', pct: '+5.1%', changeType: 'up',   icon: 'Building2',     color: 'indigo' },
  { label: 'Active Clients',   value: '143',  change: '+8',  pct: '+5.9%', changeType: 'up',   icon: 'Users',         color: 'violet' },
  { label: 'Open Enquiries',   value: '37',   change: '-3',  pct: '-7.5%', changeType: 'down', icon: 'MessageSquare', color: 'sky' },
  { label: 'Deals This Month', value: '14',   change: '+6',  pct: '+75%',  changeType: 'up',   icon: 'TrendingUp',    color: 'emerald' },
]

export const MONTHLY_ENQUIRIES = [
  { month: 'Nov', enquiries: 28, conversions: 8  },
  { month: 'Dec', enquiries: 35, conversions: 12 },
  { month: 'Jan', enquiries: 42, conversions: 15 },
  { month: 'Feb', enquiries: 38, conversions: 11 },
  { month: 'Mar', enquiries: 55, conversions: 20 },
  { month: 'Apr', enquiries: 47, conversions: 18 },
]

export const PROPERTY_TYPE_DATA = [
  { name: 'Apartment',  value: 45, color: '#6366f1' },
  { name: 'Villa',      value: 20, color: '#8b5cf6' },
  { name: 'Commercial', value: 15, color: '#06b6d4' },
  { name: 'Plot',       value: 12, color: '#10b981' },
  { name: 'Studio',     value: 8,  color: '#f59e0b' },
]

export const RECENT_ACTIVITY = [
  { id: 1, action: 'New enquiry received for Luxury 3BHK in Banjara Hills', user: 'Arjun Reddy',  time: '10 min ago', type: 'enquiry'  },
  { id: 2, action: 'Property P002 status changed to Sold',                  user: 'Priya Sharma', time: '1 hr ago',   type: 'property' },
  { id: 3, action: 'New client registered',                                  user: 'Sunita Patel', time: '2 hrs ago',  type: 'client'   },
  { id: 4, action: 'Referral converted via code KIRAN2024',                  user: 'Kiran Rao',    time: '3 hrs ago',  type: 'referral' },
  { id: 5, action: 'Price drop alert triggered for P003',                    user: 'System',       time: '5 hrs ago',  type: 'alert'    },
  { id: 6, action: 'New listing: Commercial Space in HITEC City',            user: 'Amit Verma',   time: '1 day ago',  type: 'property' },
]

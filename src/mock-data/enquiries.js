export const ENQUIRIES = [
  {
    id: 'E001', client: 'Arjun Reddy',    clientId: 'C001',
    property: 'Luxury 3BHK in Banjara Hills',    propertyId: 'P001',
    agent: 'Ravi Kumar',   date: '2024-04-10', status: 'negotiating',
    notes: 'Client liked the property. Price negotiation in progress.',
    followUpDate: '2024-04-20', priority: 'high',
  },
  {
    id: 'E002', client: 'Meera Nair',     clientId: 'C002',
    property: '4BHK Penthouse in Madhapur',       propertyId: 'P004',
    agent: 'Sana Khan',    date: '2024-04-08', status: 'visited',
    notes: 'Site visit done. Client requesting floor plan.',
    followUpDate: '2024-04-18', priority: 'high',
  },
  {
    id: 'E003', client: 'Rohan Gupta',    clientId: 'C003',
    property: 'Studio Flat in Gachibowli',        propertyId: 'P003',
    agent: 'Amit Verma',   date: '2024-04-05', status: 'enquired',
    notes: 'Initial inquiry via website form.',
    followUpDate: '2024-04-15', priority: 'medium',
  },
  {
    id: 'E004', client: 'Meera Nair',     clientId: 'C002',
    property: 'Independent Villa in Jubilee Hills', propertyId: 'P002',
    agent: 'Priya Sharma', date: '2024-03-28', status: 'converted',
    notes: 'Deal closed. Agreement signed.',
    followUpDate: null, priority: 'low',
  },
  {
    id: 'E005', client: 'Arjun Reddy',    clientId: 'C001',
    property: '4BHK Penthouse in Madhapur',        propertyId: 'P004',
    agent: 'Sana Khan',    date: '2024-04-12', status: 'enquired',
    notes: 'Requested virtual tour.',
    followUpDate: '2024-04-22', priority: 'medium',
  },
  {
    id: 'E006', client: 'Sunita Patel',   clientId: 'C004',
    property: 'Commercial Space in HITEC City',    propertyId: 'P006',
    agent: 'Priya Sharma', date: '2024-04-11', status: 'visited',
    notes: 'Client is comparing with two other spaces.',
    followUpDate: '2024-04-21', priority: 'high',
  },
  {
    id: 'E007', client: 'Rohan Gupta',    clientId: 'C003',
    property: '2BHK in Kondapur',                  propertyId: 'P005',
    agent: 'Ravi Kumar',   date: '2024-04-06', status: 'enquired',
    notes: 'Looking for immediate possession.',
    followUpDate: '2024-04-16', priority: 'low',
  },
  {
    id: 'E008', client: 'Arjun Reddy',    clientId: 'C001',
    property: 'Commercial Space in HITEC City',    propertyId: 'P006',
    agent: 'Priya Sharma', date: '2024-03-20', status: 'negotiating',
    notes: 'Lease terms under discussion.',
    followUpDate: '2024-04-05', priority: 'high',
  },
]

export const ENQUIRY_STATUSES = ['enquired', 'visited', 'negotiating', 'converted']

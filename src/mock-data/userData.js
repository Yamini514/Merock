export const USER_PROFILE = {
  name: 'Arjun Reddy',
  email: 'arjun.reddy@gmail.com',
  phone: '+91 98765 43210',
  avatar: null,
  memberSince: '2024-01-12',
  savedSearches: [
    { id: 'SS001', label: '3BHK in Banjara Hills under ₹1Cr', active: true, createdAt: '2024-03-10', matches: 8 },
    { id: 'SS002', label: 'Villa with Pool in Jubilee Hills', active: true, createdAt: '2024-02-14', matches: 3 },
    { id: 'SS003', label: '2BHK in Gachibowli under ₹60L', active: false, createdAt: '2024-01-20', matches: 12 },
  ],
  enquiries: [
    { id: 'EQ001', propertyId: 'UP001', property: 'Luxury 3BHK in Banjara Hills', price: 8500000, status: 'negotiating', date: '2024-04-10', agent: 'Ravi Kumar', image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&q=80' },
    { id: 'EQ002', propertyId: 'UP004', property: '4BHK Penthouse in Madhapur', price: 35000000, status: 'visited', date: '2024-04-08', agent: 'Sana Khan', image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&q=80' },
    { id: 'EQ003', propertyId: 'UP003', property: 'Modern Studio in Gachibowli', price: 2200000, status: 'enquired', date: '2024-04-05', agent: 'Amit Verma', image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&q=80' },
  ],
  alerts: [
    { id: 'AL001', title: 'New Match Found', message: 'A new 3BHK in Banjara Hills matches your saved search.', time: '2024-04-14T10:30:00', read: false, type: 'match' },
    { id: 'AL002', title: 'Price Drop Alert', message: 'Luxury 3BHK in Banjara Hills dropped price by ₹5L.', time: '2024-04-13T09:00:00', read: false, type: 'price_drop' },
    { id: 'AL003', title: 'Visit Confirmed', message: 'Your site visit for 4BHK Penthouse is confirmed for April 20.', time: '2024-04-12T14:00:00', read: true, type: 'visit' },
  ],
}

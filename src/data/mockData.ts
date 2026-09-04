import { Hub, FoundItem } from '../types';

export interface ChennaiHub extends Hub {
  tamil_name?: string;
  distance_badge?: string;
  landmark?: string;
}

export const INITIAL_HUBS: ChennaiHub[] = [
  {
    id: 'hub-chennai-tnagar-02',
    name: 'T. Nagar Hub',
    tamil_name: 'T.நகர் Hub',
    address: '74 Usman Road, T. Nagar, Chennai, Tamil Nadu 600017',
    lat: 13.0418,
    lng: 80.2341,
    hours: '8AM - 10PM',
    distance_badge: '1.2 km',
    landmark: 'Opposite Panagal Park / Usman Rd Flyover',
    photo_url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80',
    phone: '+91 44 2434 1122',
    is_verified: true
  },
  {
    id: 'hub-chennai-marina',
    name: 'Marina Beach Hub',
    tamil_name: 'மெரினா கடற்கரை Hub',
    address: 'Kamarajar Promenade, Triplicane, Chennai 600005',
    lat: 13.0500,
    lng: 80.2824,
    hours: '6AM - 10PM',
    distance_badge: '2.4 km',
    landmark: 'Near Light House & Vivekananda House',
    photo_url: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80',
    phone: '+91 44 2844 1900',
    is_verified: true
  },
  {
    id: 'hub-chennai-velachery-01',
    name: 'Velachery Civic Hub',
    tamil_name: 'வேளச்சேரி Hub',
    address: '100 Feet Bypass Rd, Velachery, Chennai, Tamil Nadu 600042',
    lat: 12.9756,
    lng: 80.2207,
    hours: '8AM - 10PM',
    distance_badge: '3.8 km',
    landmark: 'Near Phoenix MarketCity / MRTS Station',
    photo_url: 'https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=800&q=80',
    phone: '+91 44 2244 5566',
    is_verified: true
  },
  {
    id: 'hub-chennai-adyar-03',
    name: 'Adyar Transit Hub',
    tamil_name: 'அடையாறு Hub',
    address: '28 Lattice Bridge Rd, Adyar, Chennai, Tamil Nadu 600020',
    lat: 13.0012,
    lng: 80.2565,
    hours: '8AM - 10PM',
    distance_badge: '4.1 km',
    landmark: 'Besant Avenue Junction',
    photo_url: 'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?auto=format&fit=crop&w=800&q=80',
    phone: '+91 44 2491 3344',
    is_verified: true
  },
  {
    id: 'hub-chennai-annanagar-04',
    name: 'Anna Nagar Central Hub',
    tamil_name: 'அண்ணா நகர் Hub',
    address: '2nd Avenue, Roundtana, Anna Nagar, Chennai, Tamil Nadu 600040',
    lat: 13.0850,
    lng: 80.2101,
    hours: '8AM - 10PM',
    distance_badge: '5.6 km',
    landmark: 'Near Anna Nagar Tower Metro Station',
    photo_url: 'https://images.unsplash.com/photo-1517502884422-41eaead166d4?auto=format&fit=crop&w=800&q=80',
    phone: '+91 44 2621 7788',
    is_verified: true
  },
  {
    id: 'hub-chennai-central-05',
    name: 'Central Rail Hub',
    tamil_name: 'சென்ட்ரல் ரயில் Hub',
    address: 'Kannappar Thidal, Periyamet, Chennai, Tamil Nadu 600003',
    lat: 13.0827,
    lng: 80.2707,
    hours: '6AM - 11PM',
    distance_badge: '6.2 km',
    landmark: 'Puratchi Thalaivar Dr. M.G.R. Central Station Gate 4',
    photo_url: 'https://images.unsplash.com/photo-1582139329536-e7284fece509?auto=format&fit=crop&w=800&q=80',
    phone: '+91 44 2535 3520',
    is_verified: true
  }
];

export const INITIAL_ITEMS: FoundItem[] = [
  {
    id: 'item-chennai-1',
    reporter_id: 'user-finder-demo',
    reporter_name: 'Karthik Subramanian',
    reporter_email: 'karthik.subramanian@example.com',
    category: 'Wallet',
    item_code: 'FB-2024-0041',
    photo_url: 'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=600&q=80',
    lat: 13.0418,
    lng: 80.2341,
    location_name: 'T. Nagar Usman Road Bus Stop',
    hub_id: 'hub-chennai-tnagar-02',
    status: 'dropped_at_hub',
    description: 'Black leather bifold wallet with Chennai Metro smart card and college ID inside.',
    created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    dropped_at: new Date(Date.now() - 3600000 * 2).toISOString()
  },
  {
    id: 'item-chennai-2',
    reporter_id: 'user-finder-2',
    reporter_name: 'Ananya Raman',
    reporter_email: 'ananya.raman@example.com',
    category: 'Phone',
    item_code: 'FB-2024-0089',
    photo_url: 'https://images.unsplash.com/photo-1580910051074-3eb694886505?auto=format&fit=crop&w=600&q=80',
    lat: 13.0500,
    lng: 80.2824,
    location_name: 'Marina Beach Service Lane, near Gandhi Statue',
    hub_id: 'hub-chennai-marina',
    status: 'listed',
    description: 'Midnight Blue smartphone in transparent case with Tamil Nadu Govt decal.',
    created_at: new Date(Date.now() - 86400000 * 1.5).toISOString(),
    updated_at: new Date(Date.now() - 43200000).toISOString(),
    dropped_at: new Date(Date.now() - 43200000).toISOString()
  },
  {
    id: 'item-chennai-3',
    reporter_id: 'user-finder-3',
    reporter_name: 'Muthu Selvan',
    reporter_email: 'muthu.selvan@example.com',
    category: 'Keys',
    item_code: 'FB-2024-0104',
    photo_url: 'https://images.unsplash.com/photo-1582139329536-e7284fece509?auto=format&fit=crop&w=600&q=80',
    lat: 13.0012,
    lng: 80.2565,
    location_name: 'Adyar Besant Nagar Beach Promenade',
    hub_id: 'hub-chennai-adyar-03',
    status: 'reported',
    description: 'Bike ignition keys with Royal Enfield brass keychain.',
    created_at: new Date(Date.now() - 7200000).toISOString(),
    updated_at: new Date(Date.now() - 7200000).toISOString()
  },
  {
    id: 'item-chennai-4',
    reporter_id: 'user-finder-demo',
    reporter_name: 'Karthik Subramanian',
    reporter_email: 'karthik.subramanian@example.com',
    category: 'Documents',
    item_code: 'FB-2024-0012',
    photo_url: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&w=600&q=80',
    lat: 13.0827,
    lng: 80.2707,
    location_name: 'Chennai Central Station Platform 3',
    hub_id: 'hub-chennai-central-05',
    status: 'returned',
    description: 'Blue file folder containing Degree certificates and marksheets.',
    created_at: new Date(Date.now() - 86400000 * 4).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 1).toISOString(),
    dropped_at: new Date(Date.now() - 86400000 * 3).toISOString()
  }
];

// Distance calculation utility (Haversine formula in km)
export function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function findNearestHub(lat: number, lng: number, hubs: Hub[] = INITIAL_HUBS): { hub: Hub; distanceKm: number; distanceMinutesWalk: number } {
  let nearest = hubs[0];
  let minDistance = Infinity;

  for (const hub of hubs) {
    const dist = calculateDistanceKm(lat, lng, hub.lat, hub.lng);
    if (dist < minDistance) {
      minDistance = dist;
      nearest = hub;
    }
  }

  // Average walking speed ~ 4.8 km/h => ~12.5 min per km
  const walkMinutes = Math.max(1, Math.round(minDistance * 12.5));

  return {
    hub: nearest,
    distanceKm: parseFloat(minDistance.toFixed(2)),
    distanceMinutesWalk: walkMinutes
  };
}

export function generateItemCode(): string {
  const prefix = 'FB';
  const year = '2024';
  const num = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${year}-${num}`;
}

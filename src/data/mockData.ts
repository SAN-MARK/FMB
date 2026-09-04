import { Hub, FoundItem } from '../types';

export const INITIAL_HUBS: Hub[] = [
  {
    id: 'hub-chennai-velachery-01',
    name: 'Velachery Civic Hub',
    address: '100 Feet Bypass Rd, Velachery, Chennai, Tamil Nadu 600042',
    lat: 12.9756,
    lng: 80.2207,
    hours: '10 PM',
    photo_url: 'https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=800&q=80',
    phone: '+91 44 2244 5566',
    is_verified: true
  },
  {
    id: 'hub-chennai-tnagar-02',
    name: 'T. Nagar Commercial Hub',
    address: '74 Usman Road, T. Nagar, Chennai, Tamil Nadu 600017',
    lat: 13.0418,
    lng: 80.2341,
    hours: '10 PM',
    photo_url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80',
    phone: '+91 44 2434 1122',
    is_verified: true
  },
  {
    id: 'hub-chennai-adyar-03',
    name: 'Adyar Transit Hub',
    address: '28 Lattice Bridge Rd, Adyar, Chennai, Tamil Nadu 600020',
    lat: 13.0012,
    lng: 80.2565,
    hours: '9 PM',
    photo_url: 'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?auto=format&fit=crop&w=800&q=80',
    phone: '+91 44 2491 3344',
    is_verified: true
  },
  {
    id: 'hub-chennai-annanagar-04',
    name: 'Anna Nagar Central Hub',
    address: '2nd Avenue, Roundtana, Anna Nagar, Chennai, Tamil Nadu 600040',
    lat: 13.0850,
    lng: 80.2101,
    hours: '10 PM',
    photo_url: 'https://images.unsplash.com/photo-1517502884422-41eaead166d4?auto=format&fit=crop&w=800&q=80',
    phone: '+91 44 2621 7788',
    is_verified: true
  },
  {
    id: 'hub-chennai-central-05',
    name: 'Central Rail & Civic Hub',
    address: 'Kannappar Thidal, Periyamet, Chennai, Tamil Nadu 600003',
    lat: 13.0827,
    lng: 80.2707,
    hours: '11 PM',
    photo_url: 'https://images.unsplash.com/photo-1582139329536-e7284fece509?auto=format&fit=crop&w=800&q=80',
    phone: '+91 44 2535 3520',
    is_verified: true
  },
  {
    id: 'hub-downtown-01',
    name: 'Downtown Civic Hub (SF)',
    address: '124 Market Street, Suite 200, San Francisco, CA 94105',
    lat: 37.7908,
    lng: -122.3995,
    hours: '9 PM',
    photo_url: 'https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=800&q=80',
    phone: '+1 (415) 555-0192',
    is_verified: true
  }
];

export const INITIAL_ITEMS: FoundItem[] = [
  {
    id: 'item-demo-1',
    reporter_id: 'user-finder-demo',
    reporter_name: 'Alex Rivera',
    reporter_email: 'alex.rivera@example.com',
    category: 'Wallet',
    item_code: 'FB-9921-X',
    photo_url: 'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=600&q=80',
    lat: 37.7879,
    lng: -122.4074,
    location_name: 'Central Park / Market Sq',
    hub_id: 'hub-downtown-01',
    status: 'dropped_at_hub',
    description: 'Black leather bifold wallet with initials A.R. and transit pass inside.',
    created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    dropped_at: new Date(Date.now() - 3600000 * 2).toISOString()
  },
  {
    id: 'item-demo-2',
    reporter_id: 'user-finder-2',
    reporter_name: 'Priya Sharma',
    reporter_email: 'priya.s@example.com',
    category: 'Phone',
    item_code: 'FB-4412-P',
    photo_url: 'https://images.unsplash.com/photo-1580910051074-3eb694886505?auto=format&fit=crop&w=600&q=80',
    lat: 37.7749,
    lng: -122.4194,
    location_name: 'Mission Civic Center',
    hub_id: 'hub-southside-02',
    status: 'listed',
    description: 'Midnight Blue smartphone with transparent case and metallic ring grip.',
    created_at: new Date(Date.now() - 86400000).toISOString(),
    updated_at: new Date(Date.now() - 43200000).toISOString(),
    dropped_at: new Date(Date.now() - 43200000).toISOString()
  },
  {
    id: 'item-demo-3',
    reporter_id: 'user-finder-3',
    reporter_name: 'Marcus Chen',
    reporter_email: 'marcus.c@example.com',
    category: 'Keys',
    item_code: 'FB-7128-K',
    photo_url: 'https://images.unsplash.com/photo-1582139329536-e7284fece509?auto=format&fit=crop&w=600&q=80',
    lat: 37.8024,
    lng: -122.4058,
    location_name: 'Embarcadero Promenade',
    hub_id: 'hub-downtown-01',
    status: 'reported',
    description: 'Keychain with 3 silver keys and a teal brass carabiner.',
    created_at: new Date(Date.now() - 7200000).toISOString(),
    updated_at: new Date(Date.now() - 7200000).toISOString()
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
  const num = Math.floor(1000 + Math.random() * 9000);
  const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const suffix = letters.charAt(Math.floor(Math.random() * letters.length));
  return `${prefix}-${num}-${suffix}`;
}

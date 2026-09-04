export type UserRole = 'FINDER' | 'OWNER' | 'HUB_STAFF' | 'ADMIN';

export type ItemCategory = 'Phone' | 'Wallet' | 'Documents' | 'Jewellery' | 'Keys' | 'Other';

export type ItemStatus = 
  | 'reported' 
  | 'dropped_at_hub' 
  | 'listed' 
  | 'claimed' 
  | 'verified' 
  | 'returned';

export interface User {
  id: string;
  auth_id?: string;
  name: string;
  email: string;
  phone?: string;
  avatar_url?: string;
  role_default?: UserRole;
  created_at: string;
}

export interface Hub {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  hours: string;
  photo_url: string;
  phone?: string;
  is_verified?: boolean;
}

export interface FoundItem {
  id: string;
  reporter_id: string;
  reporter_name?: string;
  reporter_email?: string;
  reporter_phone?: string;
  category: ItemCategory;
  item_code: string;
  photo_url: string;
  lat: number;
  lng: number;
  location_name: string;
  hub_id: string;
  hub?: Hub;
  status: ItemStatus;
  description?: string;
  created_at: string;
  updated_at: string;
  dropped_at?: string;
  verified_at?: string;
  returned_at?: string;
}

export interface Verification {
  id: string;
  item_id: string;
  claimant_id: string;
  claimant_name?: string;
  claimant_email?: string;
  proof_type: 'ID_CARD' | 'PURCHASE_RECEIPT' | 'IMEI_SERIAL' | 'PHOTO_WITH_ITEM' | 'SECURITY_QUESTION';
  id_number_masked?: string;
  proof_url?: string;
  review_notes?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  created_at: string;
}

export interface Coordinates {
  lat: number;
  lng: number;
}

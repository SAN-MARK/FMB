export type UserRole = 
  | 'admin' 
  | 'user' 
  | 'finder' 
  | 'owner' 
  | 'FINDER' 
  | 'OWNER' 
  | 'ADMIN' 
  | 'HUB_STAFF';

export type ItemCategory = 
  | 'Phone' 
  | 'Wallet' 
  | 'ID Card' 
  | 'Bag' 
  | 'Documents' 
  | 'Jewellery' 
  | 'Keys' 
  | 'Other';

export type ClaimStatus = 
  | 'Reported' 
  | 'Matched' 
  | 'Verifying' 
  | 'Returned' 
  | 'Closed' 
  | 'Disputed';

export type ItemStatus = 
  | 'reported' 
  | 'dropped_at_hub' 
  | 'listed' 
  | 'claimed' 
  | 'verified' 
  | 'returned'
  | 'disputed';

export interface User {
  id: string;
  auth_id?: string;
  name: string;
  email: string;
  phone?: string;
  avatar_url?: string;
  role?: UserRole | string;
  role_default?: UserRole | string;
  created_at?: string;
}

export interface RegisteredAccount extends User {
  password_hash?: string;
  e164_phone: string;
}

export interface Hub {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  is_active?: boolean;
  is_verified?: boolean;
  volume_level?: 'high' | 'medium' | 'low';
  hours?: string;
  photo_url?: string;
  phone?: string;
  landmark?: string;
  tamil_name?: string;
  distance_badge?: string;
  created_at?: string;
}

export type ChennaiHub = Hub;

export interface LiveCaptureMetadata {
  timestamp: string;
  is_live_camera: boolean;
  geolocation?: {
    lat: number;
    lng: number;
    accuracy?: number;
  };
  device_info?: string;
}

export interface AiMatchResult {
  match_score: number; // 0 - 100
  confidence: 'high' | 'medium' | 'low';
  summary: string;
  fraud_risk: 'low' | 'medium' | 'high';
  detected_features: string[];
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
  description: string;
  capture_metadata?: LiveCaptureMetadata;
  ai_verification?: AiMatchResult;
  created_at: string;
  updated_at?: string;
  dropped_at?: string;
  verified_at?: string;
  returned_at?: string;
}

export interface Claim {
  id: string;
  item_id: string;
  claimant_id: string;
  claimant_name?: string;
  claimant_email?: string;
  status: ClaimStatus;
  dispute_flag: boolean;
  created_at: string;
  resolved_at?: string;
  proof_notes?: string;
  proof_url?: string;
  id_number_masked?: string;
  match_score?: number;
}

export interface Verification {
  id: string;
  item_id: string;
  claimant_id: string;
  claimant_name?: string;
  claimant_email?: string;
  status: 'pending' | 'approved' | 'rejected' | 'PENDING' | 'APPROVED' | 'REJECTED' | string;
  proof_type?: string;
  id_type?: string;
  id_number_masked?: string;
  document_url?: string;
  notes?: string;
  created_at: string;
  [key: string]: any;
}

export type PayoutStatus = 'pending' | 'approved' | 'held' | 'rejected' | 'paid';

export interface Payout {
  id: string;
  claim_id: string;
  finder_id?: string;
  finder_name: string;
  finder_email?: string;
  finder_phone?: string;
  finder_upi?: string;
  item_id?: string;
  item_title?: string;
  item_description: string;
  hub_id?: string;
  hub_name: string;
  amount?: number; // Finder reward = 30% of recovery fee
  finder_reward_amount: number;
  total_recovery_fee: number;
  status: PayoutStatus;
  razorpay_txn_id?: string;
  razorpay_payout_id?: string;
  approved_by?: string;
  approved_at?: string;
  reason?: string | null;
  hold_reason?: string | null;
  dispute_flag?: boolean;
  created_at: string;
}

export interface AdminAuditLog {
  id: string;
  actor_email: string;
  action: string;
  target_id?: string;
  timestamp: string;
  details?: string;
  metadata?: any;
}

export interface CounterpartMessage {
  id: string;
  item_id: string;
  sender_id: string;
  sender_name: string;
  sender_email: string;
  sender_role: 'finder' | 'owner' | 'admin';
  message: string;
  timestamp: string;
}

export interface Coordinates {
  lat: number;
  lng: number;
}

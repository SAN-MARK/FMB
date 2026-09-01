import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { FoundItem, Hub, ItemCategory, ItemStatus, User, UserRole, Verification } from '../types';
import { 
  getStoredItems, 
  saveStoredItems, 
  getStoredHubs, 
  getStoredUser, 
  saveStoredUser,
  getStoredVerifications,
  saveStoredVerifications,
  supabase,
  isSupabaseConfigured
} from '../lib/supabase';
import { INITIAL_HUBS, INITIAL_ITEMS, generateItemCode } from '../data/mockData';

export type ScreenName = 
  | 'splash'
  | 'role-selection'
  | 'report-found'
  | 'drop-off'
  | 'tag-generated'
  | 'item-received'
  | 'search-lost'
  | 'active-cases'
  | 'hub-console';

interface AppContextType {
  user: User | null;
  role: UserRole | null;
  currentScreen: ScreenName;
  activeItem: FoundItem | null;
  items: FoundItem[];
  hubs: Hub[];
  userActiveCase: FoundItem | null;
  isAuthModalOpen: boolean;
  isLoading: boolean;
  errorMessage: string | null;
  successNotification: string | null;
  
  // Navigation & Role actions
  setRole: (role: UserRole) => void;
  setCurrentScreen: (screen: ScreenName) => void;
  navigateTo: (screen: ScreenName) => void;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  dismissError: () => void;
  clearNotification: () => void;

  // Item & Reporting actions
  setActiveItem: (item: FoundItem | null) => void;
  reportFoundItem: (data: {
    category: ItemCategory;
    photo_url: string;
    lat: number;
    lng: number;
    location_name: string;
    hub_id: string;
    description?: string;
  }) => Promise<FoundItem>;
  confirmItemDropOff: (itemId: string) => Promise<FoundItem>;
  updateItemStatus: (itemId: string, status: ItemStatus) => Promise<FoundItem>;
  getItemById: (itemId: string) => FoundItem | undefined;
  submitClaimVerification: (data: {
    item_id: string;
    proof_type: Verification['proof_type'];
    id_number_masked?: string;
    proof_url?: string;
    review_notes?: string;
  }) => Promise<Verification>;

  // Auth actions
  loginWithGoogle: () => Promise<void>;
  loginDemo: (role?: UserRole) => void;
  logout: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const LOCAL_STORAGE_ACTIVE_ITEM_ID = 'findback_active_item_id';
const LOCAL_STORAGE_ROLE = 'findback_current_role';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => getStoredUser());
  const [role, setRoleState] = useState<UserRole | null>(() => {
    return (localStorage.getItem(LOCAL_STORAGE_ROLE) as UserRole) || 'FINDER';
  });
  const [currentScreen, setCurrentScreen] = useState<ScreenName>('role-selection');
  const [items, setItems] = useState<FoundItem[]>(() => getStoredItems());
  const [hubs] = useState<Hub[]>(() => getStoredHubs());
  const [verifications, setVerifications] = useState<Verification[]>(() => getStoredVerifications());
  const [activeItem, setActiveItemState] = useState<FoundItem | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successNotification, setSuccessNotification] = useState<string | null>(null);

  // Restore active item from storage
  useEffect(() => {
    const savedActiveId = localStorage.getItem(LOCAL_STORAGE_ACTIVE_ITEM_ID);
    if (savedActiveId && items.length > 0) {
      const match = items.find(i => i.id === savedActiveId);
      if (match) {
        setActiveItemState(match);
      }
    }
  }, [items]);

  // Sync state to local storage
  useEffect(() => {
    saveStoredItems(items);
  }, [items]);

  useEffect(() => {
    saveStoredVerifications(verifications);
  }, [verifications]);

  useEffect(() => {
    saveStoredUser(user);
  }, [user]);

  const setRole = useCallback((newRole: UserRole) => {
    setRoleState(newRole);
    localStorage.setItem(LOCAL_STORAGE_ROLE, newRole);
  }, []);

  const setActiveItem = useCallback((item: FoundItem | null) => {
    setActiveItemState(item);
    if (item) {
      localStorage.setItem(LOCAL_STORAGE_ACTIVE_ITEM_ID, item.id);
    } else {
      localStorage.removeItem(LOCAL_STORAGE_ACTIVE_ITEM_ID);
    }
  }, []);

  const navigateTo = useCallback((screen: ScreenName) => {
    setCurrentScreen(screen);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Compute active case for current user
  const userActiveCase = React.useMemo(() => {
    if (!user) return null;
    const userItems = items.filter(
      item => (item.reporter_id === user.id || item.reporter_email === user.email) && 
              item.status !== 'returned'
    );
    return userItems.length > 0 ? userItems[0] : null;
  }, [items, user]);

  // Report a new found item
  const reportFoundItem = async (data: {
    category: ItemCategory;
    photo_url: string;
    lat: number;
    lng: number;
    location_name: string;
    hub_id: string;
    description?: string;
  }): Promise<FoundItem> => {
    setIsLoading(true);
    setErrorMessage(null);

    const currentUser = user || {
      id: `user-${Date.now()}`,
      name: 'Guest Finder',
      email: 'guest.finder@findback.org',
      role_default: 'FINDER' as UserRole,
      created_at: new Date().toISOString()
    };

    if (!user) {
      setUser(currentUser);
    }

    const assignedHub = hubs.find(h => h.id === data.hub_id) || hubs[0];
    const itemCode = generateItemCode();
    const now = new Date().toISOString();

    const newItem: FoundItem = {
      id: `item-${Date.now()}`,
      reporter_id: currentUser.id,
      reporter_name: currentUser.name,
      reporter_email: currentUser.email,
      reporter_phone: currentUser.phone || '',
      category: data.category,
      item_code: itemCode,
      photo_url: data.photo_url,
      lat: data.lat,
      lng: data.lng,
      location_name: data.location_name || 'Downtown Civic Grid',
      hub_id: assignedHub.id,
      hub: assignedHub,
      status: 'reported',
      description: data.description || '',
      created_at: now,
      updated_at: now
    };

    // If Supabase is active, persist to PostgreSQL
    if (supabase && isSupabaseConfigured) {
      try {
        const { error } = await supabase.from('found_items').insert({
          id: newItem.id,
          reporter_id: newItem.reporter_id,
          reporter_name: newItem.reporter_name,
          reporter_email: newItem.reporter_email,
          reporter_phone: newItem.reporter_phone,
          category: newItem.category,
          item_code: newItem.item_code,
          photo_url: newItem.photo_url,
          lat: newItem.lat,
          lng: newItem.lng,
          location_name: newItem.location_name,
          hub_id: newItem.hub_id,
          status: newItem.status,
          description: newItem.description,
          created_at: newItem.created_at,
          updated_at: newItem.updated_at
        });

        if (error) {
          console.warn('Supabase insert warning:', error.message);
        }
      } catch (err) {
        console.warn('Supabase insert failed, continuing with local store:', err);
      }
    }

    setItems(prev => [newItem, ...prev]);
    setActiveItem(newItem);
    setIsLoading(false);
    setSuccessNotification(`Item registered with Tag ${itemCode}!`);
    return newItem;
  };

  // Confirm item dropped off at hub
  const confirmItemDropOff = async (itemId: string): Promise<FoundItem> => {
    setIsLoading(true);
    const now = new Date().toISOString();

    let updatedItem: FoundItem | null = null;
    setItems(prev =>
      prev.map(item => {
        if (item.id === itemId || item.item_code === itemId) {
          updatedItem = {
            ...item,
            status: 'dropped_at_hub',
            dropped_at: now,
            updated_at: now
          };
          return updatedItem;
        }
        return item;
      })
    );

    if (updatedItem) {
      setActiveItem(updatedItem);
    }

    if (supabase && isSupabaseConfigured) {
      try {
        await supabase
          .from('found_items')
          .update({
            status: 'dropped_at_hub',
            dropped_at: now,
            updated_at: now
          })
          .eq('id', itemId);
      } catch (err) {
        console.warn('Supabase update status failed:', err);
      }
    }

    setIsLoading(false);
    return updatedItem || items[0];
  };

  // General update item status (e.g., Staff checks in, Marks Claimed, Marks Returned)
  const updateItemStatus = async (itemId: string, newStatus: ItemStatus): Promise<FoundItem> => {
    setIsLoading(true);
    const now = new Date().toISOString();

    let updatedItem: FoundItem | null = null;
    setItems(prev =>
      prev.map(item => {
        if (item.id === itemId || item.item_code === itemId) {
          updatedItem = {
            ...item,
            status: newStatus,
            updated_at: now,
            ...(newStatus === 'dropped_at_hub' ? { dropped_at: now } : {}),
            ...(newStatus === 'verified' || newStatus === 'claimed' ? { verified_at: now } : {}),
            ...(newStatus === 'returned' ? { returned_at: now } : {})
          };
          return updatedItem;
        }
        return item;
      })
    );

    if (updatedItem && activeItem && activeItem.id === itemId) {
      setActiveItem(updatedItem);
    }

    if (supabase && isSupabaseConfigured) {
      try {
        await supabase
          .from('found_items')
          .update({
            status: newStatus,
            updated_at: now
          })
          .eq('id', itemId);
      } catch (err) {
        console.warn('Supabase item update failed:', err);
      }
    }

    setIsLoading(false);
    setSuccessNotification(`Status updated to "${newStatus.replace('_', ' ')}"`);
    return updatedItem || items[0];
  };

  // Submit claim verification
  const submitClaimVerification = async (data: {
    item_id: string;
    proof_type: Verification['proof_type'];
    id_number_masked?: string;
    proof_url?: string;
    review_notes?: string;
  }): Promise<Verification> => {
    setIsLoading(true);
    const currentUser = user || {
      id: `user-claimant-${Date.now()}`,
      name: 'Verified Claimant',
      email: 'claimant@findback.org',
      role_default: 'OWNER' as UserRole,
      created_at: new Date().toISOString()
    };

    const newVerification: Verification = {
      id: `verif-${Date.now()}`,
      item_id: data.item_id,
      claimant_id: currentUser.id,
      claimant_name: currentUser.name,
      claimant_email: currentUser.email,
      proof_type: data.proof_type,
      id_number_masked: data.id_number_masked || '[Aadhaar/ID Redacted]',
      proof_url: data.proof_url || '',
      review_notes: data.review_notes || '',
      status: 'PENDING',
      created_at: new Date().toISOString()
    };

    setVerifications(prev => [newVerification, ...prev]);

    // Update item status to 'claimed'
    await updateItemStatus(data.item_id, 'claimed');

    setIsLoading(false);
    setSuccessNotification('Claim & Identity verification submitted for Hub review!');
    return newVerification;
  };

  const getItemById = useCallback((itemId: string) => {
    return items.find(i => i.id === itemId || i.item_code === itemId);
  }, [items]);

  const loginWithGoogle = async () => {
    setIsLoading(true);
    if (supabase && isSupabaseConfigured) {
      try {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: window.location.origin
          }
        });
        if (error) throw error;
      } catch (err: any) {
        console.warn('Supabase OAuth exception:', err);
        setErrorMessage(err.message || 'Google login initialization failed. Using demo profile.');
        loginDemo();
      }
    } else {
      // Instant demo login for preview environment
      loginDemo();
    }
    setIsLoading(false);
    setIsAuthModalOpen(false);
  };

  const loginDemo = (selectedRole: UserRole = 'FINDER') => {
    const demoUser: User = {
      id: 'user-auth-01',
      name: selectedRole === 'HUB_STAFF' ? 'Officer David Vance' : 'Sanjeev Kumar',
      email: 'sanjeev@findback.org',
      phone: '+91 98400 12345',
      avatar_url: '',
      role_default: selectedRole,
      created_at: new Date().toISOString()
    };
    setUser(demoUser);
    setRole(selectedRole);
    setSuccessNotification(`Signed in as ${demoUser.name}`);
    setIsAuthModalOpen(false);
  };

  const logout = () => {
    setUser(null);
    setActiveItem(null);
    setRole('FINDER');
    setCurrentScreen('role-selection');
    setSuccessNotification('Signed out successfully.');
  };

  const openAuthModal = () => setIsAuthModalOpen(true);
  const closeAuthModal = () => setIsAuthModalOpen(false);
  const dismissError = () => setErrorMessage(null);
  const clearNotification = () => setSuccessNotification(null);

  return (
    <AppContext.Provider
      value={{
        user,
        role,
        currentScreen,
        activeItem,
        items,
        hubs,
        userActiveCase,
        isAuthModalOpen,
        isLoading,
        errorMessage,
        successNotification,
        setRole,
        setCurrentScreen,
        navigateTo,
        openAuthModal,
        closeAuthModal,
        dismissError,
        clearNotification,
        setActiveItem,
        reportFoundItem,
        confirmItemDropOff,
        updateItemStatus,
        getItemById,
        submitClaimVerification,
        loginWithGoogle,
        loginDemo,
        logout
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

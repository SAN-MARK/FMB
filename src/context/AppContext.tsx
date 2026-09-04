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
  getStoredRegisteredUsers,
  recordRegisteredAccount,
  RegisteredAccount,
  supabase,
  isSupabaseConfigured
} from '../lib/supabase';
import { INITIAL_HUBS, INITIAL_ITEMS, generateItemCode } from '../data/mockData';
import { 
  formatPhoneNumber, 
  deriveAuthEmailFromPhone, 
  validatePasswordStrength, 
  validateFullName 
} from '../lib/authHelpers';

export type ScreenName = 
  | 'splash'
  | 'auth'
  | 'role-selection'
  | 'report-found'
  | 'drop-off'
  | 'tag-generated'
  | 'item-received'
  | 'search-lost'
  | 'active-cases'
  | 'hub-console'
  | 'proof-of-ownership'
  | 'design-system';

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
  isAuthInitialized: boolean;
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
  signUpWithPhonePassword: (name: string, phone: string, password: string) => Promise<User>;
  loginWithPhonePassword: (phone: string, password: string) => Promise<User>;
  requestPasswordReset: (phone: string) => Promise<string>;
  loginWithGoogle: () => Promise<void>;
  loginDemo: (role?: UserRole) => void;
  logout: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const LOCAL_STORAGE_ACTIVE_ITEM_ID = 'findback_active_item_id';
const LOCAL_STORAGE_ROLE = 'findback_current_role';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => getStoredUser());
  const [isAuthInitialized, setIsAuthInitialized] = useState<boolean>(false);
  const [role, setRoleState] = useState<UserRole | null>(() => {
    return (localStorage.getItem(LOCAL_STORAGE_ROLE) as UserRole) || 'FINDER';
  });
  const [currentScreen, setCurrentScreen] = useState<ScreenName>(() => {
    const stored = getStoredUser();
    return stored ? 'role-selection' : 'auth';
  });
  const [items, setItems] = useState<FoundItem[]>(() => getStoredItems());
  const [hubs] = useState<Hub[]>(() => getStoredHubs());
  const [verifications, setVerifications] = useState<Verification[]>(() => getStoredVerifications());
  const [activeItem, setActiveItemState] = useState<FoundItem | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successNotification, setSuccessNotification] = useState<string | null>(null);

  // Initialize Supabase Auth session & listener
  useEffect(() => {
    let isMounted = true;

    async function initAuth() {
      if (supabase && isSupabaseConfigured) {
        try {
          const { data, error } = await supabase.auth.getSession();
          if (error) {
            console.warn('Supabase getSession warning:', error.message);
          }
          if (data?.session?.user && isMounted) {
            const authUser = data.session.user;
            const metadata = authUser.user_metadata || {};
            const e164Phone = metadata.phone || authUser.phone || '';
            
            // Try fetching from public.users table
            let name = metadata.name || metadata.full_name || 'Community Member';
            let roleDefault = (metadata.role_default as UserRole) || 'FINDER';

            try {
              const { data: profile } = await supabase
                .from('users')
                .select('*')
                .eq('auth_id', authUser.id)
                .single();

              if (profile) {
                name = profile.name || name;
                roleDefault = profile.role_default || roleDefault;
              }
            } catch (err) {
              console.warn('Could not fetch user profile row:', err);
            }

            const currentUser: User = {
              id: authUser.id,
              auth_id: authUser.id,
              name,
              email: authUser.email || '',
              phone: e164Phone,
              role_default: roleDefault,
              created_at: authUser.created_at || new Date().toISOString()
            };

            setUser(currentUser);
            saveStoredUser(currentUser);
          }
        } catch (e) {
          console.warn('Auth initialization error:', e);
        }
      }

      if (isMounted) {
        setIsAuthInitialized(true);
      }
    }

    initAuth();

    // Listen to Supabase auth state changes
    let authListener: { subscription: { unsubscribe: () => void } } | null = null;
    if (supabase && isSupabaseConfigured) {
      const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          const meta = session.user.user_metadata || {};
          const syncedUser: User = {
            id: session.user.id,
            auth_id: session.user.id,
            name: meta.name || meta.full_name || 'Community Member',
            email: session.user.email || '',
            phone: meta.phone || session.user.phone || '',
            role_default: (meta.role_default as UserRole) || 'FINDER',
            created_at: session.user.created_at || new Date().toISOString()
          };
          setUser(syncedUser);
          saveStoredUser(syncedUser);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          saveStoredUser(null);
          setCurrentScreen('auth');
        }
      });
      authListener = data;
    }

    return () => {
      isMounted = false;
      if (authListener) {
        authListener.subscription.unsubscribe();
      }
    };
  }, []);

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

  // Route Guard in navigation: Gate app behind authentication
  const navigateTo = useCallback((screen: ScreenName) => {
    // If not authenticated and trying to navigate to a protected screen, force auth
    if (!user && screen !== 'auth' && screen !== 'splash') {
      setCurrentScreen('auth');
      setErrorMessage('Please sign in or create an account to continue.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setCurrentScreen(screen);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [user]);

  // Compute active case for current user
  const userActiveCase = React.useMemo(() => {
    if (!user) return null;
    const userItems = items.filter(
      item => (item.reporter_id === user.id || item.reporter_email === user.email || (user.phone && item.reporter_phone === user.phone)) && 
              item.status !== 'returned'
    );
    return userItems.length > 0 ? userItems[0] : null;
  }, [items, user]);

  // Sign up with Name, Phone, and Password
  const signUpWithPhonePassword = async (name: string, rawPhone: string, rawPassword: string): Promise<User> => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      // 1. Client validations
      const nameValidation = validateFullName(name);
      if (!nameValidation.isValid) {
        throw new Error(nameValidation.errorMessage);
      }

      const phoneFormat = formatPhoneNumber(rawPhone);
      if (!phoneFormat.isValid) {
        throw new Error(phoneFormat.errorMessage);
      }

      const passwordCheck = validatePasswordStrength(rawPassword);
      if (!passwordCheck.isValid) {
        throw new Error(passwordCheck.errors.join(' '));
      }

      const e164 = phoneFormat.e164;
      const derivedEmail = deriveAuthEmailFromPhone(e164);

      // Check for duplicate in local ledger
      const existingAccounts = getStoredRegisteredUsers();
      const duplicate = existingAccounts.find(
        acc => acc.e164_phone === e164 || acc.phone === e164 || acc.phone === phoneFormat.formattedDisplay
      );
      if (duplicate) {
        throw new Error('This phone number is already registered. Please sign in instead.');
      }

      let createdUser: User;

      // 2. Supabase Auth Account Creation
      if (supabase && isSupabaseConfigured) {
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: derivedEmail,
          password: rawPassword,
          options: {
            data: {
              name: name.trim(),
              phone: e164,
              formatted_phone: phoneFormat.formattedDisplay,
              role_default: 'FINDER'
            }
          }
        });

        if (authError) {
          if (authError.message.toLowerCase().includes('already registered') || authError.message.toLowerCase().includes('user already exists')) {
            throw new Error('This phone number is already registered. Please sign in instead.');
          }
          throw new Error(authError.message);
        }

        const authUserId = authData.user?.id || `user-${Date.now()}`;

        // 3. Upsert profile in public.users table
        try {
          await supabase.from('users').upsert({
            auth_id: authUserId,
            name: name.trim(),
            email: derivedEmail,
            phone: e164,
            role_default: 'FINDER'
          }, { onConflict: 'email' });
        } catch (dbErr) {
          console.warn('Could not insert profile to public.users table:', dbErr);
        }

        createdUser = {
          id: authUserId,
          auth_id: authUserId,
          name: name.trim(),
          email: derivedEmail,
          phone: phoneFormat.formattedDisplay,
          role_default: 'FINDER',
          created_at: new Date().toISOString()
        };
      } else {
        // Local deterministic account creation for sandbox / preview environments
        const localId = `user-${Date.now()}`;
        createdUser = {
          id: localId,
          auth_id: localId,
          name: name.trim(),
          email: derivedEmail,
          phone: phoneFormat.formattedDisplay,
          role_default: 'FINDER',
          created_at: new Date().toISOString()
        };
      }

      // Record in registered ledger
      recordRegisteredAccount({
        ...createdUser,
        e164_phone: e164,
        password_hash: rawPassword
      });

      setUser(createdUser);
      saveStoredUser(createdUser);
      setRole('FINDER');
      setCurrentScreen('role-selection');
      setSuccessNotification(`Welcome to FindBack, ${createdUser.name}!`);
      setIsLoading(false);
      return createdUser;
    } catch (err: any) {
      setIsLoading(false);
      const msg = err.message || 'Failed to create account. Please check your connection.';
      setErrorMessage(msg);
      throw new Error(msg);
    }
  };

  // Log in with Phone and Password
  const loginWithPhonePassword = async (rawPhone: string, rawPassword: string): Promise<User> => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const phoneFormat = formatPhoneNumber(rawPhone);
      if (!phoneFormat.isValid) {
        throw new Error('Please enter a valid phone number.');
      }
      if (!rawPassword) {
        throw new Error('Please enter your password.');
      }

      const e164 = phoneFormat.e164;
      const derivedEmail = deriveAuthEmailFromPhone(e164);

      let authenticatedUser: User | null = null;

      if (supabase && isSupabaseConfigured) {
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
          email: derivedEmail,
          password: rawPassword
        });

        if (authError) {
          // Provide secure generic error without leaking account existence
          throw new Error('Phone number or password is incorrect. Please try again.');
        }

        if (authData.user) {
          const meta = authData.user.user_metadata || {};
          let name = meta.name || meta.full_name || 'Community Member';
          let roleDefault = (meta.role_default as UserRole) || 'FINDER';

          try {
            const { data: profile } = await supabase
              .from('users')
              .select('*')
              .eq('auth_id', authData.user.id)
              .single();
            if (profile) {
              name = profile.name || name;
              roleDefault = profile.role_default || roleDefault;
            }
          } catch (e) {
            console.warn('Profile fetch note:', e);
          }

          authenticatedUser = {
            id: authData.user.id,
            auth_id: authData.user.id,
            name,
            email: authData.user.email || derivedEmail,
            phone: phoneFormat.formattedDisplay,
            role_default: roleDefault,
            created_at: authData.user.created_at || new Date().toISOString()
          };
        }
      }

      // Offline / fallback verification
      if (!authenticatedUser) {
        const localAccounts = getStoredRegisteredUsers();
        const found = localAccounts.find(
          a => a.e164_phone === e164 || a.phone?.replace(/\D/g, '') === phoneFormat.digitsOnly
        );

        if (!found || found.password_hash !== rawPassword) {
          throw new Error('Phone number or password is incorrect. Please try again.');
        }

        authenticatedUser = {
          id: found.id,
          auth_id: found.auth_id,
          name: found.name,
          email: found.email,
          phone: found.phone || phoneFormat.formattedDisplay,
          role_default: found.role_default || 'FINDER',
          created_at: found.created_at
        };
      }

      setUser(authenticatedUser);
      saveStoredUser(authenticatedUser);
      setRole(authenticatedUser.role_default || 'FINDER');
      setCurrentScreen('role-selection');
      setSuccessNotification(`Welcome back, ${authenticatedUser.name}!`);
      setIsLoading(false);
      return authenticatedUser;
    } catch (err: any) {
      setIsLoading(false);
      const msg = err.message || 'Phone number or password is incorrect.';
      setErrorMessage(msg);
      throw new Error(msg);
    }
  };

  // Request password reset
  const requestPasswordReset = async (rawPhone: string): Promise<string> => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const phoneFormat = formatPhoneNumber(rawPhone);
      if (!phoneFormat.isValid) {
        throw new Error('Please enter a valid phone number.');
      }

      const derivedEmail = deriveAuthEmailFromPhone(phoneFormat.e164);

      if (supabase && isSupabaseConfigured) {
        try {
          await supabase.auth.resetPasswordForEmail(derivedEmail);
        } catch (e) {
          console.warn('Password reset call error:', e);
        }
      }

      const genericMessage = 'If an account exists with this phone number, reset instructions have been dispatched via SMS/Email.';
      setSuccessNotification(genericMessage);
      setIsLoading(false);
      return genericMessage;
    } catch (err: any) {
      setIsLoading(false);
      const msg = err.message || 'Unable to request password reset. Please try again.';
      setErrorMessage(msg);
      throw new Error(msg);
    }
  };

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
      id: selectedRole === 'HUB_STAFF' ? 'user-demo-staff' : 'user-demo-sanjeev',
      auth_id: selectedRole === 'HUB_STAFF' ? 'user-demo-staff' : 'user-demo-sanjeev',
      name: selectedRole === 'HUB_STAFF' ? 'Officer David Vance' : 'Sanjeev Kumar',
      email: selectedRole === 'HUB_STAFF' ? '919840099999@phone.findback.network' : '919840012345@phone.findback.network',
      phone: selectedRole === 'HUB_STAFF' ? '+91 98400 99999' : '+91 98400 12345',
      avatar_url: '',
      role_default: selectedRole,
      created_at: new Date().toISOString()
    };
    setUser(demoUser);
    saveStoredUser(demoUser);
    setRole(selectedRole);
    setCurrentScreen('role-selection');
    setSuccessNotification(`Signed in as ${demoUser.name} (${selectedRole})`);
    setIsAuthModalOpen(false);
  };

  const logout = async () => {
    setIsLoading(true);
    if (supabase && isSupabaseConfigured) {
      try {
        await supabase.auth.signOut();
      } catch (e) {
        console.warn('Supabase signOut error:', e);
      }
    }
    setUser(null);
    saveStoredUser(null);
    setActiveItem(null);
    setRole('FINDER');
    setCurrentScreen('auth');
    setIsLoading(false);
    setIsAuthModalOpen(false);
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
        isAuthInitialized,
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
        signUpWithPhonePassword,
        loginWithPhonePassword,
        requestPasswordReset,
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


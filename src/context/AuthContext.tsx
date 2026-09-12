import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User as FirebaseUser, 
  signInWithPopup, 
  signOut as firebaseSignOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  serverTimestamp, 
  updateDoc 
} from 'firebase/firestore';
import { auth, googleProvider, db } from '../firebase';

export type UserRole = 'admin' | 'user';

// The single privileged admin email (checked server-side as the source of truth)
export const ADMIN_EMAIL_IDENTIFIER = 'iamheresanjeev@gmail.com';

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  phone?: string;
  photoURL?: string;
  role: UserRole;
  createdAt: any;
}

export interface AuthContextType {
  user: FirebaseUser | null;
  userProfile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  adminSessionToken: string | null;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  updateProfileData: (data: Partial<UserProfile>) => Promise<void>;
  loginAsDemo: (roleType: 'admin' | 'user') => Promise<void>;
  requestAdminOtp: () => Promise<{ success: boolean; message: string; simulatedPreviewCode?: string }>;
  verifyAdminOtp: (code: string) => Promise<{ success: boolean; sessionToken?: string; message?: string }>;
  clearAdminSession: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [adminSessionToken, setAdminSessionToken] = useState<string | null>(() => {
    return sessionStorage.getItem('findback_admin_session_token');
  });

  // Determines if the current active email matches the privileged admin
  const currentEmail = (userProfile?.email || user?.email || '').trim().toLowerCase();
  const isAdmin = currentEmail === ADMIN_EMAIL_IDENTIFIER.toLowerCase();

  // Sync user profile from Firestore or initialize upon first sign-in
  const syncUserProfile = async (firebaseUser: FirebaseUser): Promise<UserProfile> => {
    const userEmail = (firebaseUser.email || '').trim().toLowerCase();
    const assignedRole: UserRole = userEmail === ADMIN_EMAIL_IDENTIFIER.toLowerCase() ? 'admin' : 'user';

    try {
      const userDocRef = doc(db, 'users', firebaseUser.uid);
      const userSnap = await getDoc(userDocRef);

      if (userSnap.exists()) {
        const data = userSnap.data() as UserProfile;
        // Strict protection: role is always computed from email match, ignoring DB tampering
        const validatedProfile: UserProfile = {
          ...data,
          role: assignedRole,
          email: firebaseUser.email || data.email,
          displayName: firebaseUser.displayName || data.displayName,
          photoURL: firebaseUser.photoURL || data.photoURL,
        };
        setUserProfile(validatedProfile);
        return validatedProfile;
      } else {
        // First login: create user document in Firestore users collection
        const newProfile: UserProfile = {
          uid: firebaseUser.uid,
          displayName: firebaseUser.displayName || 'FindBack Citizen',
          email: firebaseUser.email || '',
          phone: '+91 98400 12345',
          photoURL: firebaseUser.photoURL || '',
          role: assignedRole, // Only iamheresanjeev@gmail.com becomes admin
          createdAt: serverTimestamp(),
        };

        await setDoc(userDocRef, newProfile);
        setUserProfile(newProfile);
        return newProfile;
      }
    } catch (error) {
      console.warn('Could not sync profile with Firestore:', error);
      const fallbackProfile: UserProfile = {
        uid: firebaseUser.uid,
        displayName: firebaseUser.displayName || 'FindBack Citizen',
        email: firebaseUser.email || '',
        phone: '+91 98400 12345',
        photoURL: firebaseUser.photoURL || '',
        role: assignedRole,
        createdAt: new Date().toISOString(),
      };
      setUserProfile(fallbackProfile);
      return fallbackProfile;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        await syncUserProfile(currentUser);
      } else {
        // Check for active demo user in localStorage
        const storedDemo = localStorage.getItem('findback_demo_profile');
        if (storedDemo) {
          try {
            const parsed = JSON.parse(storedDemo);
            // Re-enforce server role rule
            const isAdm = (parsed.email || '').trim().toLowerCase() === ADMIN_EMAIL_IDENTIFIER.toLowerCase();
            parsed.role = isAdm ? 'admin' : 'user';
            setUserProfile(parsed);
          } catch {
            setUserProfile(null);
          }
        } else {
          setUserProfile(null);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      setUser(result.user);
      await syncUserProfile(result.user);
      localStorage.removeItem('findback_demo_profile');
    } catch (error: any) {
      console.error('Google Sign-In Error:', error);
      if (error.code === 'auth/popup-blocked' || error.code === 'auth/cancelled-popup-request') {
        throw new Error('Sign-in popup was blocked by the browser. Please enable popups or select Quick Login.');
      }
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      await firebaseSignOut(auth);
      localStorage.removeItem('findback_demo_profile');
      sessionStorage.removeItem('findback_admin_session_token');
      setAdminSessionToken(null);
      setUser(null);
      setUserProfile(null);
    } catch (error) {
      console.error('Sign-Out Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateProfileData = async (data: Partial<UserProfile>) => {
    if (!userProfile) return;
    const updated = { ...userProfile, ...data };
    // Prevent any attempt to self-escalate role
    const isAdm = (updated.email || '').trim().toLowerCase() === ADMIN_EMAIL_IDENTIFIER.toLowerCase();
    updated.role = isAdm ? 'admin' : 'user';

    setUserProfile(updated);
    localStorage.setItem('findback_demo_profile', JSON.stringify(updated));

    if (user?.uid) {
      try {
        const userDocRef = doc(db, 'users', user.uid);
        await updateDoc(userDocRef, { ...data, role: updated.role });
      } catch (err) {
        console.warn('Could not update profile in Firestore:', err);
      }
    }
  };

  // Demo user login for pitch evaluation
  const loginAsDemo = async (roleType: 'admin' | 'user') => {
    setLoading(true);
    if (roleType === 'admin') {
      // Exactly the privileged email required
      const adminProfile: UserProfile = {
        uid: 'adm_chennai_sanjeev',
        displayName: 'Sanjeev V. (Admin)',
        email: ADMIN_EMAIL_IDENTIFIER,
        phone: '+91 94440 98765',
        photoURL: '',
        role: 'admin',
        createdAt: new Date().toISOString(),
      };
      localStorage.setItem('findback_demo_profile', JSON.stringify(adminProfile));
      setUserProfile(adminProfile);
    } else {
      const userProfileDemo: UserProfile = {
        uid: 'usr_chennai_karthik',
        displayName: 'Karthik Subramanian',
        email: 'karthik.subramanian@gmail.com',
        phone: '+91 98401 23456',
        photoURL: '',
        role: 'user',
        createdAt: new Date().toISOString(),
      };
      localStorage.setItem('findback_demo_profile', JSON.stringify(userProfileDemo));
      setUserProfile(userProfileDemo);
    }
    setLoading(false);
  };

  // Step-up 2FA: Request 6-digit OTP from server
  const requestAdminOtp = async () => {
    const res = await fetch('/api/admin/request-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: userProfile?.email || user?.email }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Failed to request verification code');
    }
    return data;
  };

  // Step-up 2FA: Verify 6-digit OTP with server
  const verifyAdminOtp = async (code: string) => {
    const res = await fetch('/api/admin/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: userProfile?.email || user?.email, code }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Invalid or expired verification code');
    }

    if (data.sessionToken) {
      sessionStorage.setItem('findback_admin_session_token', data.sessionToken);
      setAdminSessionToken(data.sessionToken);
    }

    return data;
  };

  const clearAdminSession = () => {
    sessionStorage.removeItem('findback_admin_session_token');
    setAdminSessionToken(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        loading,
        isAdmin,
        adminSessionToken,
        signInWithGoogle,
        signOut,
        updateProfileData,
        loginAsDemo,
        requestAdminOtp,
        verifyAdminOtp,
        clearAdminSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};


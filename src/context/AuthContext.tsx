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

export type UserRole = 'finder' | 'owner' | 'admin';

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL: string;
  role: UserRole;
  createdAt: any;
}

export interface AuthContextType {
  user: FirebaseUser | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  updateRole: (newRole: UserRole) => Promise<void>;
  loginAsDemo: (role: UserRole) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Sync user profile from Firestore or initialize upon first sign-in
  const syncUserProfile = async (firebaseUser: FirebaseUser): Promise<UserProfile> => {
    try {
      const userDocRef = doc(db, 'users', firebaseUser.uid);
      const userSnap = await getDoc(userDocRef);

      if (userSnap.exists()) {
        const data = userSnap.data() as UserProfile;
        setUserProfile(data);
        return data;
      } else {
        // First login: create user document in Firestore users collection
        const newProfile: UserProfile = {
          uid: firebaseUser.uid,
          displayName: firebaseUser.displayName || 'FindBack Citizen',
          email: firebaseUser.email || '',
          photoURL: firebaseUser.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${firebaseUser.uid}`,
          role: 'finder', // Default role
          createdAt: serverTimestamp(),
        };

        await setDoc(userDocRef, newProfile);
        setUserProfile(newProfile);
        return newProfile;
      }
    } catch (error) {
      console.warn('Could not sync profile with Firestore:', error);
      // Fallback in-memory profile
      const fallbackProfile: UserProfile = {
        uid: firebaseUser.uid,
        displayName: firebaseUser.displayName || 'FindBack Citizen',
        email: firebaseUser.email || '',
        photoURL: firebaseUser.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${firebaseUser.uid}`,
        role: 'finder',
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
      // If popup is blocked by iframe or browser restrictions, offer friendly guidance
      if (error.code === 'auth/popup-blocked' || error.code === 'auth/cancelled-popup-request') {
        throw new Error('Sign-in popup was blocked by the browser. Please allow popups or use the Pitch Demo Mode.');
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
      setUser(null);
      setUserProfile(null);
    } catch (error) {
      console.error('Sign-Out Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateRole = async (newRole: UserRole) => {
    if (userProfile) {
      const updated = { ...userProfile, role: newRole };
      setUserProfile(updated);
      localStorage.setItem('findback_demo_profile', JSON.stringify(updated));

      if (user) {
        try {
          const userDocRef = doc(db, 'users', user.uid);
          await updateDoc(userDocRef, { role: newRole });
        } catch (err) {
          console.warn('Could not update role in Firestore:', err);
        }
      }
    }
  };

  // Demo user login for guaranteed zero-friction INNOVARA '26 pitch demo
  const loginAsDemo = async (role: UserRole) => {
    setLoading(true);
    const demoId = `demo_${role}_chennai`;
    const demoProfile: UserProfile = {
      uid: demoId,
      displayName: role === 'admin' ? 'Chennai Hub Administrator' : role === 'finder' ? 'Karthik Raja (Finder)' : 'Priya Sundaram (Owner)',
      email: `${role}.chennai@findback.network`,
      photoURL: role === 'admin' 
        ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80'
        : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
      role: role,
      createdAt: new Date().toISOString(),
    };

    localStorage.setItem('findback_demo_profile', JSON.stringify(demoProfile));
    setUserProfile(demoProfile);
    setLoading(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        loading,
        signInWithGoogle,
        signOut,
        updateRole,
        loginAsDemo,
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

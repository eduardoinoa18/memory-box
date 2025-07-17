// Firebase-based authentication utilities for admin dashboard
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../../config/firebase';

export const authConfig = {
  sessionTimeout: 8 * 60 * 60 * 1000, // 8 hours
  sessionKey: 'adminSession',
  adminRoles: ['admin', 'superadmin'], // Allowed admin roles
};

export const authUtils = {
  // Sign in with Firebase
  signIn: async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Check if user has admin privileges
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      const userData = userDoc.data();

      if (!userData || !authConfig.adminRoles.includes(userData.role)) {
        await signOut(auth);
        throw new Error('Access denied. Admin privileges required.');
      }

      // Store session info
      const sessionData = {
        uid: user.uid,
        email: user.email,
        role: userData.role,
        name: userData.displayName || userData.firstName + ' ' + userData.lastName,
        loginTime: new Date().toISOString(),
        isAdmin: true
      };

      localStorage.setItem(authConfig.sessionKey, JSON.stringify(sessionData));
      return sessionData;
    } catch (error) {
      console.error('Admin sign in error:', error);
      throw error;
    }
  },

  // Sign out
  signOut: async () => {
    try {
      await signOut(auth);
      localStorage.removeItem(authConfig.sessionKey);
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    if (typeof window === 'undefined') return false;

    try {
      const session = localStorage.getItem(authConfig.sessionKey);
      if (!session) return false;

      const sessionData = JSON.parse(session);
      const now = new Date().getTime();
      const loginTime = new Date(sessionData.loginTime).getTime();

      // Check if session has expired
      if (now - loginTime > authConfig.sessionTimeout) {
        authUtils.signOut();
        return false;
      }

      return sessionData.isAdmin === true;
    } catch {
      return false;
    }
  },

  // Get current admin user
  getCurrentUser: () => {
    if (!authUtils.isAuthenticated()) return null;

    try {
      const session = localStorage.getItem(authConfig.sessionKey);
      return JSON.parse(session);
    } catch {
      return null;
    }
  },

  // Legacy compatibility - use signOut instead  
  logout: () => {
    return authUtils.signOut();
  },

  // Check permission based on role
  hasPermission: (permission) => {
    const user = authUtils.getCurrentUser();
    if (!user) return false;

    const permissions = {
      admin: ['read', 'write', 'admin'],
      superadmin: ['read', 'write', 'delete', 'admin', 'superadmin']
    };

    const userPermissions = permissions[user.role] || [];
    return userPermissions.includes(permission);
  }
};

// React hook for authentication state
export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Check if user is admin
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          const userData = userDoc.data();

          if (userData && authConfig.adminRoles.includes(userData.role)) {
            const sessionData = {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              role: userData.role,
              name: userData.displayName || userData.firstName + ' ' + userData.lastName,
              isAdmin: true
            };
            setUser(sessionData);
            localStorage.setItem(authConfig.sessionKey, JSON.stringify(sessionData));
          } else {
            setUser(null);
            localStorage.removeItem(authConfig.sessionKey);
          }
        } catch (error) {
          console.error('Error checking admin status:', error);
          setUser(null);
        }
      } else {
        setUser(null);
        localStorage.removeItem(authConfig.sessionKey);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const userData = await authUtils.signIn(email, password);
      setUser(userData);
      return userData;
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await authUtils.signOut();
      setUser(null);
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
    hasPermission: authUtils.hasPermission
  };
};

// HOC for protecting admin routes
export const withAuth = (WrappedComponent) => {
  return function AuthenticatedComponent(props) {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!loading && !user) {
        router.push('/login');
      }
    }, [user, loading, router]);

    if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      );
    }

    if (!user) {
      return null;
    }

    return <WrappedComponent {...props} />;
  };
};

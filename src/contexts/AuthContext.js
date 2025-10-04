import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuth, signInWithGoogle, signOutUser, createUser, signInUser } from '../lib/firebase';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'signup'

  // Listen to Firebase auth state changes
  useEffect(() => {
    const unsubscribe = onAuth((firebaseUser) => {
      if (firebaseUser) {
        // User is signed in
        const userData = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          name: firebaseUser.displayName || firebaseUser.email,
          photoURL: firebaseUser.photoURL,
          createdAt: firebaseUser.metadata.creationTime,
          plan: 'free'
        };
        setUser(userData);
      } else {
        // User is signed out
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Save user to localStorage when user changes
  useEffect(() => {
    if (user) {
      localStorage.setItem('myplanner_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('myplanner_user');
    }
  }, [user]);

  const signup = async (userData) => {
    try {
      const userCredential = await createUser(userData.email, userData.password, userData.name);
      setShowAuthModal(false);
      return { success: true, user: userCredential.user };
    } catch (error) {
      let errorMessage = 'An error occurred during signup';
      
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'This email is already registered. Please sign in instead.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Please enter a valid email address.';
          break;
        case 'auth/weak-password':
          errorMessage = 'Password should be at least 6 characters.';
          break;
        case 'auth/operation-not-allowed':
          errorMessage = 'Email/password accounts are not enabled.';
          break;
        default:
          errorMessage = error.message;
      }
      
      return { success: false, error: errorMessage };
    }
  };

  const login = async (email, password) => {
    try {
      const userCredential = await signInUser(email, password);
      setShowAuthModal(false);
      return { success: true, user: userCredential.user };
    } catch (error) {
      let errorMessage = 'An error occurred during login';
      
      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage = 'No account found with this email address.';
          break;
        case 'auth/wrong-password':
          errorMessage = 'Incorrect password. Please try again.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Please enter a valid email address.';
          break;
        case 'auth/user-disabled':
          errorMessage = 'This account has been disabled.';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Too many failed attempts. Please try again later.';
          break;
        default:
          errorMessage = error.message;
      }
      
      return { success: false, error: errorMessage };
    }
  };

  const loginWithGoogle = async () => {
    try {
      const userCredential = await signInWithGoogle();
      setShowAuthModal(false);
      return { success: true, user: userCredential.user };
    } catch (error) {
      let errorMessage = 'An error occurred during Google sign-in';
      
      switch (error.code) {
        case 'auth/popup-closed-by-user':
          errorMessage = 'Sign-in was cancelled. Please try again.';
          break;
        case 'auth/popup-blocked':
          errorMessage = 'Popup was blocked by your browser. Please allow popups and try again.';
          break;
        case 'auth/cancelled-popup-request':
          errorMessage = 'Sign-in was cancelled. Please try again.';
          break;
        default:
          errorMessage = error.message;
      }
      
      return { success: false, error: errorMessage };
    }
  };

  const logout = async () => {
    try {
      await signOutUser();
      setUser(null);
    } catch (error) {
      console.error('Error signing out:', error);
      // Still set user to null even if signOut fails
      setUser(null);
    }
  };

  const requireAuth = (action) => {
    if (!user) {
      setShowAuthModal(true);
      return false;
    }
    return true;
  };

  const value = {
    user,
    loading,
    showAuthModal,
    setShowAuthModal,
    authMode,
    setAuthMode,
    signup,
    login,
    loginWithGoogle,
    logout,
    requireAuth
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

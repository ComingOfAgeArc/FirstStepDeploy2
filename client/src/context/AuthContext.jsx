// src/context/AuthContext.jsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase/firebase';
import api from '../api/axios';

const AuthContext = createContext({
  currentUser: null,   // the Firebase user object (has .uid, .email, etc.)
  role: null,           // 'seeker' | 'recruiter' | null
  loading: true,
  refreshRole: async () => {},
});

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshRole = async (user) => {
    if (!user) {
      setRole(null);
      return;
    }
    try {
      const res = await api.get('/users/me');
      setRole(res.data.role);
    } catch (err) {
      // Not registered in our DB yet (e.g. mid-registration) — that's fine
      setRole(null);
    }
  };

  // useEffect(() => {
    // onAuthStateChanged is the source of truth for "who is logged in" —
    // it fires on load, on login, on logout, and on token refresh, and
    // Firebase persists the session itself (no localStorage needed).
  //   const unsubscribe = onAuthStateChanged(auth, async (user) => {
  //     setCurrentUser(user);
  //     await refreshRole(user);
  //     setLoading(false);
  //   });
  //   return unsubscribe;
  // }, []); earlier

  useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, async (user) => {
    console.log("Firebase user:", user);

    setCurrentUser(user);

    try {
      await refreshRole(user);
      console.log("Role fetched");
    } catch (err) {
      console.log(err);
    }

    console.log("Setting loading false");
    setLoading(false);
  });

  return unsubscribe;
}, []);



  const value = {
    currentUser,
    uid: currentUser?.uid || null,
    role,
    loading,
    refreshRole: () => refreshRole(auth.currentUser),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);

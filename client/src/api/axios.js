// src/api/axios.js
import axios from 'axios';
import { auth } from '../firebase/firebase';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL
});

// Attach a fresh Firebase ID token to every outgoing request.
// getIdToken() returns the cached token and silently refreshes it
// in the background if it's close to expiring, so this is cheap to
// call on every request.
api.interceptors.request.use(async (config) => {
  const user = auth.currentUser;
  if (user) {
    const token = await user.getIdToken();
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// If the token is ever rejected (expired session, revoked account, etc.)
// bounce the user back to login instead of leaving them on a broken page.
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      // Avoid redirect loops if we're already on the login page
      if (window.location.pathname !== '/login' && window.location.pathname !== '/') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

export default api;

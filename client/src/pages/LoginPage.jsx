import React, { useState } from 'react';
import { auth, googleProvider } from '../firebase/firebase';
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import api from '../api/axios';
import '../styles/Login.css';
import Header from '../components/Header';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Check profile completeness before redirect
  const redirectToDashboard = async (role) => {
    if (role === 'seeker') {
      try {
        const profileRes = await api.get('/seeker/profile');
        const seeker = profileRes.data.profile;
        if (!seeker?.personalDetails?.phone) {
          window.location.href = '/profile-setup';
        } else {
          window.location.href = '/main-seeker';
        }
      } catch (err) {
        console.error('Profile check failed:', err.message);
        window.location.href = '/profile-setup';
      }
    } else if (role === 'recruiter') {
      window.location.href = '/main-provider';
    } else {
      alert('No role found. Please register.');
    }
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    try {
      // signInWithEmailAndPassword sets auth.currentUser, which the axios
      // interceptor then uses to attach a fresh ID token automatically.
      await signInWithEmailAndPassword(auth, email, password);

      const response = await api.post('/users/login');
      const role = response.data.role;

      await redirectToDashboard(role);
    } catch (err) {
      console.error(err);
      setError('Login failed: user not found or not registered.');
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);

      try {
        const loginResponse = await api.post('/users/login');
        const role = loginResponse.data.role;
        await redirectToDashboard(role);
      } catch (loginError) {
        if (loginError.response && loginError.response.status === 404) {
          // New Google user — register them as a seeker automatically
          const user = auth.currentUser;
          await api.post('/users/register', {
            role: 'seeker',
            name: user.displayName,
            resumeUrl: '',
          });

          window.location.href = '/profile-setup';
        } else {
          console.error('Google login failed:', loginError.message);
          setError('Login failed.');
        }
      }
    } catch (err) {
      console.error('Google sign-in failed:', err.message);
      setError('Login failed.');
    }
  };

  return (
    <>
    <Header></Header>
     <div className="page-container">
    <div className="login-container">
      <h2>Login to FirstStep Jobs</h2>
      <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
      <input placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
      <button onClick={handleEmailLogin}>Login with Email</button>
      <hr />
      <button onClick={handleGoogleLogin}>Continue with Google</button>
      {error && <p>{error}</p>}
      <p className="switch-option">Don't have an account? <a href="/register">Register</a></p>
    </div></div></>

  );
};

export default LoginPage;

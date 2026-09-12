import React, { useState } from 'react';
import { auth } from '../firebase/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import api from '../api/axios';
import '../styles/Login.css';
import Header from '../components/Header';


const RegisterPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('seeker');
  const [name, setName] = useState('');
  const [error, setError] = useState('');

 const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    try {
      // Create Firebase account
      await createUserWithEmailAndPassword(auth, email, password);

      // Create user in MongoDB
      await api.post('/users/register', {
        role,
        name,
        resumeUrl: '',
        company: '',
        position: '',
      });

      alert('Registration successful!');

      if (role === 'recruiter') {
        window.location.href = '/main-provider';
      } else {
        window.location.href = '/profile-setup';
      }
      } catch (err) {
        console.error(err);
        setError(err.message);
      }
    };

  // const handleRegister = async (e) => {
  //   e.preventDefault();
  //   setError('');

  //   try {
  //     // Creates the Firebase account and signs the user in, which makes
  //     // auth.currentUser available for the axios interceptor to grab an
  //     // ID token from on the very next request below.
  //     await createUserWithEmailAndPassword(auth, email, password);

  //     // uid/email are taken server-side from the verified token — we only
  //     // send the non-sensitive profile fields the user is choosing.
  //     await api.post('/users/register', {
  //       role,
  //       name,
  //       resumeUrl: '',
  //       company: '',
  //       position: '',
  //     });

  //     alert('Registration successful!');
  //     window.location.href = '/login';
  //   } catch (err) {
  //     console.error(err);
  //     setError(err.message);
  //   }
  // };

  return (
    <><Header></Header>
    <div className="page-container">
    <div className="login-container">
      <h2>Register</h2>
      <input placeholder="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} />
      <input placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
      <input placeholder="Name" type="text" value={name} onChange={e => setName(e.target.value)} />
      <select value={role} onChange={e => setRole(e.target.value)}>
        <option value="seeker">Job Seeker</option>
        <option value="recruiter">Recruiter</option>
      </select>
      <button onClick={handleRegister}>Register</button>
      {error && <p className="error">{error}</p>}
    </div></div></>
  );
};

export default RegisterPage;

// src/components/Header.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase/firebase';
import { useAuth } from '../context/AuthContext';
import '../styles/Header.css';

const Header = () => {
  const { role } = useAuth(); // 'seeker' or 'recruiter', derived server-side from the verified token
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem('theme') === 'dark'
  );

  // Theme preference is not sensitive, so localStorage is still fine here.
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-mode');
      localStorage.setItem('theme', 'dark');
    } else {
      document.body.classList.remove('dark-mode');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  const handleLogout = async () => {
    await signOut(auth); // clears the Firebase session; AuthContext picks this up automatically
    navigate('/login');
  };

  const toggleTheme = () => {
    setDarkMode((prev) => !prev);
  };

  return (
    <header className={`header ${darkMode ? 'dark' : ''}`}>
      <div className="logo">
        <Link to="/">
          <span className="logo-icon">🚀</span>
          <span className="logo-text">FirstStepJob<span>.com</span></span>
        </Link>
      </div>

      <nav className="nav-links">
        <button
          className="nav-btn"
          onClick={() => {
            if (role === 'seeker') navigate('/main-seeker');
            else if (role === 'recruiter') navigate('/main-provider');
          }}
        >
          Home
        </button>

        <Link to="/available-jobs">Jobs</Link>

        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </nav>
    </header>
  );
};

export default Header;

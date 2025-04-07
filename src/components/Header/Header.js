import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import styles from './Header.module.css';

const Header = () => {
  const { user, login, register, logout } = useAuth();
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    firstName: '',
    lastName: '',
    email: '',
    dateOfBirth: '',
  });
  const [error, setError] = useState('');
  const [loginData, setLoginData] = useState({
    user_name: '',
    password: '',
  });
  const [loginError, setLoginError] = useState('');
  const [registerData, setRegisterData] = useState({
    user_name: '',
    first_name: '',
    last_name: '',
    email: '',
    birth_date: '',
    password: '',
    username: ''
  });
  const [registerError, setRegisterError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await login(loginData.user_name, loginData.password);
      setShowLoginForm(false);
      setLoginError('');
    } catch (error) {
      setLoginError('שגיאה בהתחברות. אנא נסה שוב.');
    }
  };

  const handleLoginChange = (e) => {
    setLoginData({
      ...loginData,
      [e.target.name]: e.target.value
    });
  };

  const handleRegisterChange = (e) => {
    setRegisterData({
      ...registerData,
      [e.target.name]: e.target.value
    });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const userData = {
        ...registerData,
        username: registerData.user_name
      };
      await register(userData);
      setShowRegisterForm(false);
      setRegisterError('');
    } catch (error) {
      setRegisterError('שגיאה בהרשמה. אנא נסה שוב.');
    }
  };

  return (
    <header className={styles.header}>
      <div className={styles.headerContent}>
        <h1>Catalog Management</h1>
        {user && (
          <div className={styles.welcomeMessage}>
            Welcome, &nbsp;&nbsp; {user.user_name}
          </div>
        )}
        <div className={styles.authSection}>
          {!user ? (
            <>
              <button onClick={() => setShowLoginForm(true)}>Login</button>
              <button onClick={() => setShowRegisterForm(true)}>Register</button>
            </>
          ) : (
            <button onClick={logout}>Logout</button>
          )}
        </div>
      </div>

      {showLoginForm && (
        <div className={styles.form}>
          <h3>התחברות</h3>
          {loginError && <div className={styles.error}>{loginError}</div>}
          <form onSubmit={handleLogin}>
            <input
              type="text"
              name="user_name"
              placeholder="שם משתמש"
              value={loginData.user_name}
              onChange={handleLoginChange}
              required
            />
            <input
              type="password"
              name="password"
              placeholder="סיסמה"
              value={loginData.password}
              onChange={handleLoginChange}
              required
            />
            <button type="submit">התחבר</button>
            <button type="button" onClick={() => setShowLoginForm(false)}>ביטול</button>
          </form>
        </div>
      )}

      {showRegisterForm && (
        <div className={styles.form}>
          <h3>הרשמה</h3>
          {registerError && <div className={styles.error}>{registerError}</div>}
          <form onSubmit={handleRegister}>
            <input
              type="text"
              name="user_name"
              placeholder="שם משתמש"
              value={registerData.user_name}
              onChange={handleRegisterChange}
              required
            />
            <input
              type="text"
              name="first_name"
              placeholder="שם פרטי"
              value={registerData.first_name}
              onChange={handleRegisterChange}
              required
            />
            <input
              type="text"
              name="last_name"
              placeholder="שם משפחה"
              value={registerData.last_name}
              onChange={handleRegisterChange}
              required
            />
            <input
              type="email"
              name="email"
              placeholder="אימייל"
              value={registerData.email}
              onChange={handleRegisterChange}
              required
            />
            <input
              type="date"
              name="birth_date"
              value={registerData.birth_date}
              onChange={handleRegisterChange}
              required
            />
            <input
              type="password"
              name="password"
              placeholder="סיסמה"
              value={registerData.password}
              onChange={handleRegisterChange}
              required
            />
            <button type="submit">הרשם</button>
            <button type="button" onClick={() => setShowRegisterForm(false)}>ביטול</button>
          </form>
        </div>
      )}
    </header>
  );
};

export default Header;

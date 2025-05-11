import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './Navbar.module.css';

const Navbar = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.navLinks}>
        <Link to="/products" className={styles.navLink}>Search Products</Link>
        {user?.isAdmin && (
          <Link to="/admin" className={styles.navLink}>Admin Panel</Link>
        )}
        <Link to="/profile" className={styles.navLink}>Profile</Link>
        <button onClick={handleLogout} className={styles.logoutButton}>
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar; 
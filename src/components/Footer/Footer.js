import React from 'react';
import styles from './Footer.module.css';

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerContent}>
        <div className={styles.footerSection}>
          <h3>About Us</h3>
          <p>Catalog Management System - Your one-stop solution for product management.</p>
        </div>
        <div className={styles.footerSection}>
          <h3>Contact</h3>
          <p>Email: support@catalogmanagement.com</p>
          <p>Phone: (555) 123-4567</p>
        </div>
        <div className={styles.footerSection}>
          <h3>Follow Us</h3>
          <div className={styles.socialLinks}>
            <a href="#" target="_blank" rel="noopener noreferrer">Facebook</a>
            <a href="#" target="_blank" rel="noopener noreferrer">Twitter</a>
            <a href="#" target="_blank" rel="noopener noreferrer">LinkedIn</a>
          </div>
        </div>
      </div>
      <div className={styles.footerBottom}>
        <p>&copy; {new Date().getFullYear()} Catalog Management. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer; 
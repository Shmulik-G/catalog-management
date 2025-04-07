import React from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Header from '../Header/Header';
import LeftMenu from '../LeftMenu/LeftMenu';
import Footer from '../Footer/Footer';
import styles from './Layout.module.css';

const Layout = () => {
  const { welcomeMessage } = useAuth();

  return (
    <div className={styles.layout}>
      <Header />
      <div className={styles.mainContent}>
        <LeftMenu />
        <main className={styles.content}>
          {welcomeMessage && <div className={styles.welcome}>{welcomeMessage}</div>}
          <Outlet />
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default Layout; 
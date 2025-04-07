import React from 'react';
import styles from './LeftMenu.module.css';
import { useAuth } from '../../context/AuthContext';
import Menu from '../Menu/Menu';

const LeftMenu = () => {
  const { user } = useAuth();

  return (
    <nav className={styles.leftMenu}>
      {user && <Menu userRole={user.role} />}
    </nav>
  );
};

export default LeftMenu;

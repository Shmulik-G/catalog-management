import React from 'react';
import { Link } from 'react-router-dom';
import styles from './Menu.module.css';

const Menu = ({ userRole }) => {
  return (
    <div className={styles.menu}>
      {userRole === 'admin' ? (
        <ul>
          <li><Link to="/products">View Products</Link></li>
          <li><Link to="/products/add">Add Product</Link></li>
          {/* <li><Link to="/products/delete">Delete Product</Link></li> */}
          {/* <li><Link to="/products/update">Update Product</Link></li> */}
          <li><Link to="/products/search">Search Products</Link></li>
          <li><Link to="/profile">Profile</Link></li>
        </ul>
      ) : userRole === 'user' ? (
        <ul>
          <li><Link to="/products">View Products</Link></li>
          <li><Link to="/products/search">Search Products</Link></li>
          <li><Link to="/profile">Profile</Link></li>
        </ul>
      ) : null}
    </div>
  );
};

export default Menu;

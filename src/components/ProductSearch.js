import React, { useState } from 'react';
import styles from './ProductSearch.module.css';

const ProductSearch = ({ onSearch }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState('name');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch({ term: searchTerm, type: searchType });
  };

  return (
    <div className={styles.searchContainer}>
      <form onSubmit={handleSubmit} className={styles.searchForm}>
        <div className={styles.searchInputGroup}>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Enter search term..."
            className={styles.searchInput}
          />
          <select
            value={searchType}
            onChange={(e) => setSearchType(e.target.value)}
            className={styles.searchSelect}
          >
            <option value="name">Search by Name</option>
            <option value="description">Search by Description</option>
            <option value="id">Search by ID</option>
          </select>
          <button type="submit" className={styles.searchButton}>
            Search
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductSearch; 
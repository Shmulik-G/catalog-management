import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './ProductSearch.module.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const ProductSearch = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [editForm, setEditForm] = useState({
    product_name: '',
    product_description: '',
    current_stock_level: '',
    status: true
  });
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);

  // Check if user is admin when component mounts
  React.useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.isAdmin) {
      setIsAdmin(true);
    }
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setError('Please enter search terms');
      return;
    }
    if (searchQuery.trim().length < 2) {
      setError('Search text must contain at least 2 characters');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      console.log('Starting search with query:', searchQuery);
      console.log('Using API URL:', API_URL);
      console.log('Token:', token.substring(0, 20) + '...');

      const response = await fetch(`${API_URL}/products/search?query=${encodeURIComponent(searchQuery)}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Search response status:', response.status);
      console.log('Search response headers:', Object.fromEntries(response.headers.entries()));
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Search error response:', errorData);
        throw new Error(errorData.message || 'Error searching products');
      }

      const data = await response.json();
      console.log('Search results:', data);
      
      if (!Array.isArray(data)) {
        console.error('Invalid response format:', data);
        throw new Error('Invalid response format from server');
      }

      // Sort results by product_id
      const sortedData = [...data].sort((a, b) => a.product_id - b.product_id);
      setSearchResults(sortedData);
    } catch (err) {
      console.error('Search error:', err);
      setError(err.message || 'Server error. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setEditForm({
      product_name: product.product_name,
      product_description: product.product_description,
      current_stock_level: product.current_stock_level,
      status: product.status
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch(`${API_URL}/products/${editingProduct.product_id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editForm)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Server error');
      }

      const updatedProduct = await response.json();
      
      // Update the product in the search results
      setSearchResults(prevResults => 
        prevResults.map(product => 
          product.product_id === updatedProduct.product_id ? updatedProduct : product
        )
      );

      setEditingProduct(null);
      setEditForm({
        product_name: '',
        product_description: '',
        current_stock_level: '',
        status: true
      });
    } catch (error) {
      console.error('Edit error:', error);
      setError(error.message || 'Error updating product');
    }
  };

  const handleEditChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  return (
    <div className={styles.searchContainer}>
      <h2>Product Search</h2>
      <form onSubmit={handleSearch} className={styles.searchForm}>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Enter product name or description..."
          className={styles.searchInput}
        />
        <button type="submit" className={styles.searchButton}>
          Search
        </button>
      </form>

      {error && <div className={styles.error}>{error}</div>}
      
      {loading ? (
        <div className={styles.loading}>Searching...</div>
      ) : searchResults.length > 0 ? (
        <div className={styles.resultsContainer}>
          <div className={styles.resultsCount}>
            Found {searchResults.length} matching products
          </div>
          <table className={styles.productTable}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Description</th>
                <th>Stock</th>
                <th>Status</th>
                <th>Creation Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {searchResults.map((product) => (
                <tr key={product._id}>
                  <td>{product.product_id}</td>
                  <td>{product.product_name}</td>
                  <td>{product.product_description}</td>
                  <td>{product.current_stock_level}</td>
                  <td>{product.status ? 'Active' : 'Inactive'}</td>
                  <td>{new Date(product.creation_date).toLocaleDateString('en-GB')}</td>
                  <td>
                    {isAdmin && (
                      <button
                        onClick={() => handleEdit(product)}
                        className={styles.editButton}
                      >
                        Edit
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className={styles.noResults}>No products found</div>
      )}

      {editingProduct && (
        <div className={styles.editFormContainer}>
          <h3>Edit Product</h3>
          <form onSubmit={handleEditSubmit} className={styles.editForm}>
            <div className={styles.formGroup}>
              <label>Product Name:</label>
              <input
                type="text"
                name="product_name"
                value={editForm.product_name}
                onChange={handleEditChange}
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label>Description:</label>
              <textarea
                name="product_description"
                value={editForm.product_description}
                onChange={handleEditChange}
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label>Stock Level:</label>
              <input
                type="number"
                name="current_stock_level"
                value={editForm.current_stock_level}
                onChange={handleEditChange}
                min="0"
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label>
                <input
                  type="checkbox"
                  name="status"
                  checked={editForm.status}
                  onChange={handleEditChange}
                />
                Active
              </label>
            </div>
            <div className={styles.buttonContainer}>
              <button type="submit" className={styles.saveButton}>
                Save Changes
              </button>
              <button
                type="button"
                onClick={() => setEditingProduct(null)}
                className={styles.cancelButton}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default ProductSearch; 
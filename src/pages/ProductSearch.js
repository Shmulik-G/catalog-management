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
      setError('נא להזין מילות חיפוש');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('לא נמצא טוקן אימות');
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
        throw new Error(errorData.message || 'שגיאה בחיפוש מוצרים');
      }

      const data = await response.json();
      console.log('Search results:', data);
      
      if (!Array.isArray(data)) {
        console.error('Invalid response format:', data);
        throw new Error('פורמט תשובה לא תקין מהשרת');
      }

      // Sort results by product_id
      const sortedData = [...data].sort((a, b) => a.product_id - b.product_id);
      setSearchResults(sortedData);
    } catch (err) {
      console.error('Search error:', err);
      setError(err.message || 'שגיאת שרת. נא לנסות שוב מאוחר יותר.');
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
      setError(error.message || 'שגיאה בעדכון המוצר');
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
      <h2>חיפוש מוצרים</h2>
      <form onSubmit={handleSearch} className={styles.searchForm}>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="הזן שם מוצר או תיאור..."
          className={styles.searchInput}
        />
        <button type="submit" className={styles.searchButton}>
          חיפוש
        </button>
      </form>

      {error && <div className={styles.error}>{error}</div>}
      
      {loading ? (
        <div className={styles.loading}>מחפש...</div>
      ) : searchResults.length > 0 ? (
        <div className={styles.resultsContainer}>
          <div className={styles.resultsCount}>
            נמצאו {searchResults.length} מוצרים תואמים
          </div>
          <table className={styles.productTable}>
            <thead>
              <tr>
                <th>מזהה</th>
                <th>שם</th>
                <th>תיאור</th>
                <th>מלאי</th>
                <th>סטטוס</th>
                <th>תאריך יצירה</th>
                <th>פעולות</th>
              </tr>
            </thead>
            <tbody>
              {searchResults.map((product) => (
                <tr key={product._id}>
                  <td>{product.product_id}</td>
                  <td>{product.product_name}</td>
                  <td>{product.product_description}</td>
                  <td>{product.current_stock_level}</td>
                  <td>{product.status ? 'פעיל' : 'לא פעיל'}</td>
                  <td>{new Date(product.creation_date).toLocaleDateString()}</td>
                  <td>
                    {isAdmin && (
                      <button
                        onClick={() => handleEdit(product)}
                        className={styles.editButton}
                      >
                        עריכה
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : searchQuery ? (
        <div className={styles.noResults}>לא נמצאו מוצרים תואמים לחיפוש.</div>
      ) : null}

      {editingProduct && (
        <div className={styles.editModal}>
          <div className={styles.editModalContent}>
            <h2>עריכת מוצר</h2>
            <form onSubmit={handleEditSubmit}>
              <div className={styles.formGroup}>
                <label>שם המוצר:</label>
                <input
                  type="text"
                  name="product_name"
                  value={editForm.product_name}
                  onChange={handleEditChange}
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label>תיאור:</label>
                <textarea
                  name="product_description"
                  value={editForm.product_description}
                  onChange={handleEditChange}
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label>מלאי:</label>
                <input
                  type="number"
                  name="current_stock_level"
                  value={editForm.current_stock_level}
                  onChange={handleEditChange}
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
                  פעיל
                </label>
              </div>
              <div className={styles.modalButtons}>
                <button type="submit" className={styles.saveButton}>
                  שמירה
                </button>
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className={styles.cancelButton}
                >
                  ביטול
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductSearch; 
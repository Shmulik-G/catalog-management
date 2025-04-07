import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from './ProductList.module.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const PRODUCTS_PER_PAGE = 12;

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteError, setDeleteError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [editingProduct, setEditingProduct] = useState(null);
  const [editForm, setEditForm] = useState({
    product_name: '',
    product_description: '',
    current_stock_level: '',
    status: true
  });
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        console.log('Fetching products with token:', localStorage.getItem('token'));
        const response = await fetch(`${API_URL}/products`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error('Error response:', errorData);
          throw new Error(errorData.message || 'Failed to fetch products');
        }

        const data = await response.json();
        console.log('Fetched products:', data);
        setProducts(data);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleDelete = async (productId) => {
    try {
      console.log('Starting delete process for product:', {
        productId,
        allProducts: products.map(p => ({
          _id: p._id,
          product_id: p.product_id,
          product_name: p.product_name,
          fullProduct: p
        }))
      });

      const productToDelete = products.find(p => p.product_id === productId);
      if (!productToDelete) {
        console.error('Product not found in local state:', productId);
        setDeleteError('Product not found in local state');
        return;
      }

      if (window.confirm(`האם אתה בטוח שברצונך למחוק את המוצר "${productToDelete.product_name}"?`)) {
        const response = await fetch(`${API_URL}/products/${productToDelete.product_id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to delete product');
        }

        setProducts(products.filter(p => p.product_id !== productId));
        setDeleteError(null);
      }
    } catch (error) {
      console.error('Error in handleDelete:', error);
      if (error.message.includes('Authentication failed')) {
        localStorage.removeItem('token');
        navigate('/login');
      } else {
        setDeleteError(error.message);
      }
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

      console.log('Sending edit request for product:', {
        productId: editingProduct.product_id,
        editForm: editForm
      });

      const response = await fetch(`${API_URL}/products/${editingProduct.product_id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editForm)
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('המוצר לא נמצא במערכת');
        }
        const errorData = await response.json().catch(() => ({ message: 'שגיאת שרת' }));
        throw new Error(errorData.message || 'שגיאת שרת');
      }

      const updatedProduct = await response.json();
      console.log('Product updated successfully:', updatedProduct);
      
      // Update the product in the list
      setProducts(prevProducts => 
        prevProducts.map(product => 
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

  const totalPages = Math.ceil(products.length / PRODUCTS_PER_PAGE);
  const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE;
  const endIndex = startIndex + PRODUCTS_PER_PAGE;
  const currentProducts = products.slice(startIndex, endIndex);

  // Add console logs for debugging
  console.log('Debug info:', {
    totalProducts: products.length,
    productsPerPage: PRODUCTS_PER_PAGE,
    totalPages,
    currentPage,
    currentProductsCount: currentProducts.length,
    shouldShowPagination: products.length > PRODUCTS_PER_PAGE,
    userRole: user?.role
  });

  if (loading) {
    return <div className={styles.loading}>Loading products...</div>;
  }

  if (error) {
    if (error.includes('Invalid token') || error.includes('No token provided')) {
      return <div className={styles.welcome}>Welcome to the Catalog Management System</div>;
    }
    return <div className={styles.error}>Error: {error}</div>;
  }

  return (
    <div className={styles.productList}>
      <h2>Products</h2>
      {deleteError && <div className={styles.error}>{deleteError}</div>}
      {products.length === 0 ? (
        <div className={styles.noProducts}>No products found</div>
      ) : (
        <div className={styles.tableContainer}>
          <table className={styles.productTable}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Description</th>
                <th>Stock Level</th>
                <th>Status</th>
                <th>Created</th>
                {user?.role === 'admin' && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {currentProducts.map((product) => (
                <tr key={product._id}>
                  <td>{product.product_name}</td>
                  <td>{product.product_description}</td>
                  <td>{product.current_stock_level}</td>
                  <td>{product.status ? 'Active' : 'Inactive'}</td>
                  <td>{new Date(product.creation_date).toLocaleDateString()}</td>
                  {user?.role === 'admin' && (
                    <td className={styles.actionButtons}>
                      <button onClick={() => handleEdit(product)}>Edit</button>
                      <button 
                        onClick={() => handleDelete(product.product_id)}
                        className={styles.deleteButton}
                      >
                        Delete
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
          {products.length > PRODUCTS_PER_PAGE && (
            <div className={styles.pagination} style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
              <button 
                onClick={() => {
                  console.log('Previous page clicked');
                  setCurrentPage(prev => Math.max(prev - 1, 1));
                }}
                disabled={currentPage === 1}
                style={{ margin: '0 10px', padding: '8px 16px' }}
              >
                Previous
              </button>
              <span style={{ margin: '0 10px', lineHeight: '32px' }}>Page {currentPage} of {totalPages}</span>
              <button 
                onClick={() => {
                  console.log('Next page clicked');
                  setCurrentPage(prev => Math.min(prev + 1, totalPages));
                }}
                disabled={currentPage === totalPages}
                style={{ margin: '0 10px', padding: '8px 16px' }}
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}

      {editingProduct && (
        <div className={styles.editModal}>
          <div className={styles.editModalContent}>
            <h2>Edit Product</h2>
            <form onSubmit={handleEditSubmit}>
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
              <div className={styles.modalButtons}>
                <button type="submit" className={styles.saveButton}>
                  Save
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
        </div>
      )}
    </div>
  );
};

export default ProductList; 
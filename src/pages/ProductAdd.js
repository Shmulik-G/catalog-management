import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { addProduct } from '../services/productService';
import styles from './ProductAdd.module.css';

const ProductAdd = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    product_name: '',
    product_description: '',
    current_stock_level: 0,
    status: true,
    creation_date: new Date().toISOString()
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Check if user is authenticated when component mounts
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    console.log('Current token:', token); // Debug log
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? e.target.checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      // Validate and format the data
      const stockLevel = parseInt(formData.current_stock_level);
      if (isNaN(stockLevel) || stockLevel < 0) {
        throw new Error('Please enter a valid stock level');
      }

      // Trim whitespace from text fields
      const productData = {
        product_name: formData.product_name.trim(),
        product_description: formData.product_description.trim(),
        current_stock_level: stockLevel,
        status: formData.status,
        creation_date: new Date().toISOString()
      };

      // Validate required fields
      if (!productData.product_name || !productData.product_description) {
        throw new Error('Product name and description are required');
      }
      
      console.log('Submitting product:', productData);
      const response = await addProduct(productData);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add product');
      }

      setSuccess('Product added successfully!');
      // Clear form after successful submission
      setFormData({
        product_name: '',
        product_description: '',
        current_stock_level: 0,
        status: true,
        creation_date: new Date().toISOString()
      });
      
      // Navigate after a short delay to show the success message
      setTimeout(() => {
        navigate('/products');
      }, 2000);
    } catch (err) {
      console.error('Form submission error:', err);
      if (err.message.includes('log in again') || err.message.includes('No authentication token')) {
        // Clear token and redirect to login
        localStorage.removeItem('token');
        navigate('/login');
      } else {
        setError(err.message || 'Failed to add product. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <h2>Add New Product</h2>
      {error && <div className={styles.error}>{error}</div>}
      {success && <div className={styles.success}>{success}</div>}
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <label htmlFor="product_name">Product Name</label>
          <input
            type="text"
            id="product_name"
            name="product_name"
            value={formData.product_name}
            onChange={handleChange}
            required
            minLength="2"
            maxLength="100"
            placeholder="Enter product name"
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="product_description">Description</label>
          <textarea
            id="product_description"
            name="product_description"
            value={formData.product_description}
            onChange={handleChange}
            required
            minLength="10"
            maxLength="500"
            placeholder="Enter product description"
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="current_stock_level">Stock Level</label>
          <input
            type="number"
            id="current_stock_level"
            name="current_stock_level"
            value={formData.current_stock_level}
            onChange={handleChange}
            min="0"
            required
            placeholder="Enter stock level"
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              name="status"
              checked={formData.status}
              onChange={handleChange}
            />
            Active Status
          </label>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="creation_date">Creation Date</label>
          <input
            type="datetime-local"
            id="creation_date"
            name="creation_date"
            value={formData.creation_date.slice(0, 16)}
            onChange={handleChange}
            required
          />
        </div>

        <button 
          type="submit" 
          className={styles.submitButton}
          disabled={loading}
        >
          {loading ? 'Adding...' : 'Add Product'}
        </button>
      </form>
    </div>
  );
};

export default ProductAdd; 
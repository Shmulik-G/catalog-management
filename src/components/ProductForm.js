import React, { useState, useEffect } from 'react';
import styles from './ProductForm.module.css';

const ProductForm = ({ product, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    product_id: '',
    product_name: '',
    product_description: '',
    status: 'active',
    current_stock_level: 0
  });

  useEffect(() => {
    if (product) {
      setFormData({
        product_id: product.product_id || '',
        product_name: product.product_name || '',
        product_description: product.product_description || '',
        status: product.status || 'active',
        current_stock_level: product.current_stock_level || 0
      });
    }
  }, [product]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <h2>{product ? 'Edit Product' : 'Add New Product'}</h2>
      
      <div className={styles.formGroup}>
        <label>Product ID:</label>
        <input
          type="text"
          name="product_id"
          value={formData.product_id}
          onChange={handleChange}
          required
        />
      </div>

      <div className={styles.formGroup}>
        <label>Product Name:</label>
        <input
          type="text"
          name="product_name"
          value={formData.product_name}
          onChange={handleChange}
          required
        />
      </div>

      <div className={styles.formGroup}>
        <label>Description:</label>
        <textarea
          name="product_description"
          value={formData.product_description}
          onChange={handleChange}
          required
        />
      </div>

      <div className={styles.formGroup}>
        <label>Status:</label>
        <select
          name="status"
          value={formData.status}
          onChange={handleChange}
          required
        >
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      <div className={styles.formGroup}>
        <label>Stock Level:</label>
        <input
          type="number"
          name="current_stock_level"
          value={formData.current_stock_level}
          onChange={handleChange}
          min="0"
          required
        />
      </div>

      <div className={styles.buttonContainer}>
        <button type="submit" className={styles.submitButton}>
          {product ? 'Update' : 'Add'} Product
        </button>
        <button
          type="button"
          onClick={onCancel}
          className={styles.cancelButton}
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default ProductForm; 
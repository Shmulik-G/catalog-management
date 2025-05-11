import React, { useState, useEffect } from 'react';
import ProductSearch from '../components/ProductSearch';
import ProductList from '../components/ProductList';
import ProductForm from '../components/ProductForm';
import styles from './Products.module.css';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/products', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }

      const data = await response.json();
      setProducts(data);
    } catch (error) {
      setError('Error loading products');
    }
  };

  const handleSearch = async ({ term, type }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/products/search?term=${term}&type=${type}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Search failed');
      }

      const data = await response.json();
      setProducts(data);
    } catch (error) {
      setError('Error searching products');
    }
  };

  const handleAddProduct = async (productData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(productData)
      });

      if (!response.ok) {
        throw new Error('Failed to add product');
      }

      setSuccess('Product added successfully');
      setIsAddingProduct(false);
      fetchProducts();
    } catch (error) {
      setError('Error adding product');
    }
  };

  const handleEditProduct = async (productData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/products/${productData._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(productData)
      });

      if (!response.ok) {
        throw new Error('Failed to update product');
      }

      setSuccess('Product updated successfully');
      setEditingProduct(null);
      fetchProducts();
    } catch (error) {
      setError('Error updating product');
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/products/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete product');
      }

      setSuccess('Product deleted successfully');
      fetchProducts();
    } catch (error) {
      setError('Error deleting product');
    }
  };

  return (
    <div className={styles.productsContainer}>
      <h1>Products Management</h1>
      
      {error && <div className={styles.error}>{error}</div>}
      {success && <div className={styles.success}>{success}</div>}

      <div className={styles.actions}>
        <button
          className={styles.addButton}
          onClick={() => setIsAddingProduct(true)}
        >
          Add New Product
        </button>
      </div>

      <ProductSearch onSearch={handleSearch} />

      {isAddingProduct && (
        <ProductForm
          onSubmit={handleAddProduct}
          onCancel={() => setIsAddingProduct(false)}
        />
      )}

      {editingProduct && (
        <ProductForm
          product={editingProduct}
          onSubmit={handleEditProduct}
          onCancel={() => setEditingProduct(null)}
        />
      )}

      <ProductList
        products={products}
        onEdit={setEditingProduct}
        onDelete={handleDeleteProduct}
      />
    </div>
  );
};

export default Products; 
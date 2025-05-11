import React from 'react';
import styles from './ProductList.module.css';

const ProductList = ({ products, onEdit, onDelete }) => {
  return (
    <div className={styles.productList}>
      <table className={styles.productTable}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Description</th>
            <th>Status</th>
            <th>Stock Level</th>
            <th>Creation Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product._id}>
              <td>{product.product_id}</td>
              <td>{product.product_name}</td>
              <td>{product.product_description}</td>
              <td>{product.status}</td>
              <td>{product.current_stock_level}</td>
              <td>{new Date(product.creation_date).toLocaleDateString('en-GB')}</td>
              <td>
                <button
                  onClick={() => onEdit(product)}
                  className={styles.editButton}
                >
                  Edit
                </button>
                <button
                  onClick={() => onDelete(product._id)}
                  className={styles.deleteButton}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProductList; 
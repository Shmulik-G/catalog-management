const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const addProduct = async (productData) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    console.log('Adding product with data:', productData);
    console.log('Request details:', {
      url: `${API_URL}/products`,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(productData)
    });

    const response = await fetch(`${API_URL}/products`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(productData)
    });

    if (response.status === 401) {
      localStorage.removeItem('token');
      throw new Error('Authentication failed. Please log in again.');
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Failed to add product' }));
      throw new Error(errorData.message || 'Failed to add product');
    }

    return response;
  } catch (error) {
    console.error('Error in addProduct:', error);
    throw error;
  }
};

export const deleteProduct = async (productId) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    // Ensure productId is a string and remove any whitespace
    const stringProductId = String(productId).trim();
    
    const url = `${API_URL}/products/${stringProductId}`;
    console.log('Delete request details:', {
      url,
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      productId: stringProductId,
      token: token.substring(0, 10) + '...' // Log only part of the token for security
    });

    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('Delete response status:', response.status);
    console.log('Delete response headers:', Object.fromEntries(response.headers.entries()));
    
    // Try to get response body for better error handling
    let responseBody;
    try {
      responseBody = await response.text();
      console.log('Delete response body:', responseBody);
      if (responseBody) {
        responseBody = JSON.parse(responseBody);
      }
    } catch (e) {
      console.log('Could not parse response body:', e);
    }

    if (response.status === 401) {
      localStorage.removeItem('token');
      throw new Error('Authentication failed. Please log in again.');
    }

    if (response.status === 404) {
      // Log the full product data for debugging
      console.error('Product not found. Full product data:', {
        requestedId: stringProductId,
        responseBody,
        url: url
      });
      throw new Error(`Product with ID ${stringProductId} not found. Please check if the ID is correct.`);
    }

    if (response.status === 500) {
      throw new Error('Server error occurred. Please try again later.');
    }

    if (!response.ok) {
      throw new Error(responseBody?.message || 'Failed to delete product');
    }

    return response;
  } catch (error) {
    console.error('Error in deleteProduct:', error);
    throw error;
  }
}; 
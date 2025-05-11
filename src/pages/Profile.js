import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Profile.module.css';

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Profile form state
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    birth_date: ''
  });

  // Password form state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Helper function to format date
  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '';
      return date.toISOString().split('T')[0];
    } catch (error) {
      console.error('Error formatting date:', error);
      return '';
    }
  };

  // Helper function to display date
  const displayDate = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '';
      return date.toLocaleDateString('en-GB');
    } catch (error) {
      console.error('Error displaying date:', error);
      return '';
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    // Get user data from token
    const userData = JSON.parse(localStorage.getItem('user'));
    console.log('User data from localStorage:', userData);

    if (userData) {
      setUser(userData);
      const formattedBirthDate = formatDate(userData.birth_date);
      console.log('Formatted birth date:', formattedBirthDate);
      
      setFormData({
        first_name: userData.first_name || '',
        last_name: userData.last_name || '',
        email: userData.email || '',
        birth_date: formattedBirthDate
      });
    }
  }, [navigate]);

  const handleProfileChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value
    });
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error updating profile');
      }

      const updatedUserData = await response.json();
      console.log('Updated user data from server:', updatedUserData);
      
      // Update local storage with new user data
      const updatedUser = { ...user, ...updatedUserData };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      setSuccess('Profile updated successfully');
      setIsEditing(false);
    } catch (error) {
      setError(error.message || 'Error updating profile');
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/users/change-password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error changing password');
      }

      setSuccess('Password changed successfully');
      setIsChangingPassword(false);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      setError(error.message || 'Error changing password');
    }
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className={styles.profileContainer}>
      <h1>User Profile</h1>
      
      {error && <div className={styles.error}>{error}</div>}
      {success && <div className={styles.success}>{success}</div>}

      {!isEditing && !isChangingPassword && (
        <div className={styles.profileInfo}>
          <p><strong>Username:</strong> {user.user_name}</p>
          <p><strong>First Name:</strong> {user.first_name}</p>
          <p><strong>Last Name:</strong> {user.last_name}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Birth Date:</strong> {displayDate(user.birth_date)}</p>
          
          <div className={styles.buttonContainer}>
            <button 
              className={styles.editButton}
              onClick={() => setIsEditing(true)}
            >
              Edit Profile
            </button>
            <button 
              className={styles.passwordButton}
              onClick={() => setIsChangingPassword(true)}
            >
              Change Password
            </button>
          </div>
        </div>
      )}

      {isEditing && (
        <form onSubmit={handleProfileSubmit} className={styles.form}>
          <h2>Edit Profile</h2>
          <div className={styles.formGroup}>
            <label>First Name:</label>
            <input
              type="text"
              name="first_name"
              value={formData.first_name}
              onChange={handleProfileChange}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label>Last Name:</label>
            <input
              type="text"
              name="last_name"
              value={formData.last_name}
              onChange={handleProfileChange}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label>Email:</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleProfileChange}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label>Birth Date:</label>
            <input
              type="date"
              name="birth_date"
              value={formData.birth_date}
              onChange={handleProfileChange}
              required
            />
          </div>
          <div className={styles.buttonContainer}>
            <button type="submit" className={styles.saveButton}>Save</button>
            <button 
              type="button" 
              className={styles.cancelButton}
              onClick={() => setIsEditing(false)}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {isChangingPassword && (
        <form onSubmit={handlePasswordSubmit} className={styles.form}>
          <h2>Change Password</h2>
          <div className={styles.formGroup}>
            <label>Current Password:</label>
            <input
              type="password"
              name="currentPassword"
              value={passwordData.currentPassword}
              onChange={handlePasswordChange}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label>New Password:</label>
            <input
              type="password"
              name="newPassword"
              value={passwordData.newPassword}
              onChange={handlePasswordChange}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label>Confirm New Password:</label>
            <input
              type="password"
              name="confirmPassword"
              value={passwordData.confirmPassword}
              onChange={handlePasswordChange}
              required
            />
          </div>
          <div className={styles.buttonContainer}>
            <button type="submit" className={styles.saveButton}>Save</button>
            <button 
              type="button" 
              className={styles.cancelButton}
              onClick={() => setIsChangingPassword(false)}
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default Profile; 
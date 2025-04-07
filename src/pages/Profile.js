import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Profile.module.css';

const Profile = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      navigate('/login');
      return;
    }
    setUser(JSON.parse(userData));
  }, [navigate]);

  if (!user) {
    return <div className={styles.loading}>טוען...</div>;
  }

  return (
    <div className={styles.profile}>
      <h2>הפרופיל שלי</h2>
      <div className={styles.profileCard}>
        <div className={styles.profileHeader}>
          <div className={styles.avatar}>
            {user.first_name[0]}{user.last_name[0]}
          </div>
          <h3>{user.first_name} {user.last_name}</h3>
        </div>

        <div className={styles.profileInfo}>
          <div className={styles.infoGroup}>
            <label>שם משתמש</label>
            <p>{user.user_name}</p>
          </div>

          <div className={styles.infoGroup}>
            <label>אימייל</label>
            <p>{user.email}</p>
          </div>

          <div className={styles.infoGroup}>
            <label>תפקיד</label>
            <p>{user.isAdmin ? 'מנהל מערכת' : 'משתמש רגיל'}</p>
          </div>
        </div>

        <div className={styles.profileActions}>
          <button className={styles.editButton}>עריכת פרופיל</button>
          <button className={styles.changePasswordButton}>שינוי סיסמה</button>
        </div>
      </div>
    </div>
  );
};

export default Profile; 
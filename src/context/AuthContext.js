import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    console.log("AuthContext: useEffect - Checking for user in localStorage");
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (token && storedUser) {
      const parsedUser = JSON.parse(storedUser);
      console.log("AuthContext: useEffect - User found in localStorage:", parsedUser);
      // Add role based on isAdmin
      const userWithRole = {
        ...parsedUser,
        role: parsedUser.isAdmin ? 'admin' : 'user',
      };
      setUser(userWithRole);
    } else {
      console.log("AuthContext: useEffect - No user found in localStorage");
    }
    setLoading(false);
  }, []);

  const login = async (user_name, password) => {
    try {
      console.log("AuthContext: login - Attempting login for:", user_name);
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_name, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("AuthContext: login - Login failed:", errorData);
        throw new Error('Login failed');
      }

      const data = await response.json();
      console.log("AuthContext: login - Login successful, response:", data);
      // Add role based on isAdmin
      const userWithRole = {
        ...data.user,
        role: data.user.isAdmin ? 'admin' : 'user',
      };
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(userWithRole));
      setUser(userWithRole);
      navigate('/products');
      return data;
    } catch (error) {
      console.error('AuthContext: login - Login error:', error);
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      console.log("AuthContext: register - Attempting registration for:", userData.user_name);
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("AuthContext: register - Registration failed:", errorData);
        throw new Error('Registration failed');
      }

      const data = await response.json();
      console.log("AuthContext: register - Registration successful, response:", data);
      // Add role based on isAdmin
      const userWithRole = {
        ...data.user,
        role: data.user.isAdmin ? 'admin' : 'user',
      };
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(userWithRole));
      setUser(userWithRole);
      navigate('/products');
      return data;
    } catch (error) {
      console.error('AuthContext: register - Registration error:', error);
      throw error;
    }
  };

  const logout = () => {
    console.log("AuthContext: logout - Logging out");
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/');
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      login, 
      register, 
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

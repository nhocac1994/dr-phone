import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from '../config/axios';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      console.log('Found token, fetching user data');
      axios.get('/api/auth/me')
        .then(data => {
          console.log('User data:', data);
          setUser(data);
        })
        .catch((error) => {
          console.error('Error fetching user data:', error);
          localStorage.removeItem('token');
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      console.log('No token found');
      setLoading(false);
    }
  }, []);

  const login = async (username, password) => {
    try {
      console.log('Sending login request');
      const response = await axios.post('/api/auth/login', { username, password });
      console.log('Login response:', response);
      
      if (response?.token && response?.user) {
        localStorage.setItem('token', response.token);
        setUser(response.user);
        return response;
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error?.response?.data || error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const value = {
    user,
    loading,
    login,
    logout,
    isAdmin: user?.role === 'admin',
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}; 
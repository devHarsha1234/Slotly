import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const sess = sessionStorage.getItem('user');
      if (sess) return JSON.parse(sess);
      const loc = localStorage.getItem('user');
      if (loc) return JSON.parse(loc);
    } catch (e) {}
    return null;
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Optionally fetch /api/auth/me to verify token on load
    const verifyToken = async () => {
      if (user?.token) {
        try {
          await api.get('/auth/me');
        } catch (error) {
          logout();
        }
      }
      setLoading(false);
    };
    verifyToken();
  }, [user?.token]);

  const login = (userData) => {
    try {
      sessionStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('user', JSON.stringify(userData));
    } catch (e) {}
    setUser(userData);
  };

  const logout = () => {
    try {
      sessionStorage.removeItem('user');
      localStorage.removeItem('user');
    } catch (e) {}
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

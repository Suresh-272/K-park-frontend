// src/context/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('kpark_user');
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('kpark_token');
    if (token) {
      authAPI.getMe()
        .then(res => {
          setUser(res.data.data.user);
          localStorage.setItem('kpark_user', JSON.stringify(res.data.data.user));
        })
        .catch(() => logout())
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const res = await authAPI.login({ email, password });
    const { token, data } = res.data;
    localStorage.setItem('kpark_token', token);
    localStorage.setItem('kpark_user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };

  const register = async (formData) => {
    const res = await authAPI.register(formData);
    const { token, data } = res.data;
    localStorage.setItem('kpark_token', token);
    localStorage.setItem('kpark_user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem('kpark_token');
    localStorage.removeItem('kpark_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

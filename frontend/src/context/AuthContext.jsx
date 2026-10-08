import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('neurolens_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('neurolens_token'));
  const [loading, setLoading] = useState(true);
  const [geminiApiKey, setGeminiApiKeyState] = useState(() => {
    return localStorage.getItem('neurolens_gemini_key') || import.meta.env.VITE_GEMINI_API_KEY || '';
  });

  useEffect(() => {
    const checkAuth = async () => {
      if (token) {
        try {
          const res = await api.get('/auth/me');
          setUser(res.data);
          localStorage.setItem('neurolens_user', JSON.stringify(res.data));
        } catch (err) {
          console.error("Token verification failed:", err);
          logout();
        }
      }
      setLoading(false);
    };
    checkAuth();
  }, [token]);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const { access_token, user: userData } = res.data;
    localStorage.setItem('neurolens_token', access_token);
    localStorage.setItem('neurolens_user', JSON.stringify(userData));
    setToken(access_token);
    setUser(userData);
    return userData;
  };

  const register = async (name, email, password, role = 'doctor') => {
    const res = await api.post('/auth/register', { name, email, password, role });
    const { access_token, user: userData } = res.data;
    localStorage.setItem('neurolens_token', access_token);
    localStorage.setItem('neurolens_user', JSON.stringify(userData));
    setToken(access_token);
    setUser(userData);
    return userData;
  };

  const logout = () => {
    localStorage.removeItem('neurolens_token');
    localStorage.removeItem('neurolens_user');
    setToken(null);
    setUser(null);
  };

  const updateGeminiApiKey = (key) => {
    localStorage.setItem('neurolens_gemini_key', key);
    setGeminiApiKeyState(key);
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      login,
      register,
      logout,
      geminiApiKey,
      updateGeminiApiKey,
      isAuthenticated: !!token
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

import { createContext, useState, useEffect } from 'react';
import API from '../utils/api';

// Helper function to check if token is expired
const isTokenExpired = (token) => {
  if (!token) return true;

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Date.now() / 1000;
    return payload.exp < currentTime;
  } catch (error) {
    return true;
  }
};

// Helper function to get token expiration time
const getTokenExpiration = (token) => {
  if (!token) return null;

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return new Date(payload.exp * 1000);
  } catch (error) {
    return null;
  }
};

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkTokenAndSetUser = () => {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');

      if (token && userData) {
        // Check if token is expired
        if (isTokenExpired(token)) {
          // Token expired, clear storage and logout
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
        } else {
          // Token is valid, set user
          setUser(JSON.parse(userData));
        }
      } else {
        setUser(null);
      }
    };

    checkTokenAndSetUser();
    setLoading(false);

    // Check token expiration every minute
    const interval = setInterval(() => {
      const token = localStorage.getItem('token');
      if (token && isTokenExpired(token)) {
        console.log('Token expired, logging out...');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        // Redirect to login page
        if (window.location.pathname !== '/') {
          window.location.href = '/';
        }
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, []);

  const login = async (email, password) => {
    const res = await API.post('/auth/login', { email, password });
    localStorage.setItem('token', res.data.token);
    localStorage.setItem('user', JSON.stringify(res.data.user));
    setUser(res.data.user);
    return res.data;
  };

  const register = async (name, email, phone, password) => {
    const res = await API.post('/auth/register', { name, email, phone, password });
    localStorage.setItem('token', res.data.token);
    localStorage.setItem('user', JSON.stringify(res.data.user));
    setUser(res.data.user);
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const getSessionTimeRemaining = () => {
    const token = localStorage.getItem('token');
    if (!token) return null;

    const expiration = getTokenExpiration(token);
    if (!expiration) return null;

    const now = new Date();
    const remaining = expiration - now;

    if (remaining <= 0) return null;

    return {
      hours: Math.floor(remaining / (1000 * 60 * 60)),
      minutes: Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60)),
      seconds: Math.floor((remaining % (1000 * 60)) / 1000)
    };
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading, getSessionTimeRemaining }}>
      {children}
    </AuthContext.Provider>
  );
};
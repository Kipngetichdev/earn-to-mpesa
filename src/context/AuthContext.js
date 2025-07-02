import React, { createContext, useState, useEffect } from 'react';
import { getUserData } from '../services/auth';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (storedUser) {
      getUserData(storedUser.uid).then(({ data, error }) => {
        if (data) {
          setUser(storedUser);
          setUserData(data);
          console.log('AuthContext userData:', data); // Debug
        } else {
          console.error('AuthContext getUserData error:', error);
        }
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, []);

  const login = (user) => {
    setUser(user);
    localStorage.setItem('user', JSON.stringify(user));
    getUserData(user.uid).then(({ data }) => {
      if (data) {
        setUserData(data);
        console.log('AuthContext login userData:', data); // Debug
      }
    });
  };

  const logout = () => {
    setUser(null);
    setUserData(null);
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, userData, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
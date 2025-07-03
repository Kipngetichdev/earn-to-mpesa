import React, { createContext, useState, useEffect } from 'react';
import { signin, signout, getUserData } from '../services/auth';
import { onSnapshot, doc } from 'firebase/firestore';
import { db } from '../services/firebase';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user from localStorage and set up real-time listener
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (storedUser) {
      setUser(storedUser);
      const userRef = doc(db, 'users', storedUser.uid);
      const unsubscribe = onSnapshot(userRef, (doc) => {
        if (doc.exists()) {
          setUserData(doc.data());
          console.log('AuthContext real-time userData:', doc.data()); // Debug
        } else {
          setUser(null);
          setUserData(null);
          localStorage.removeItem('user');
          console.log('AuthContext: User not found, clearing session');
        }
        setLoading(false);
      }, (err) => {
        console.error('AuthContext real-time error:', err);
        setLoading(false);
      });
      return () => unsubscribe();
    } else {
      setLoading(false);
    }
  }, []);

  // Handle signin
  const handleSignin = async (identifier, password) => {
    const { user, error } = await signin({ identifier, password });
    if (user) {
      setUser(user);
      localStorage.setItem('user', JSON.stringify(user));
      const { data } = await getUserData(user.uid);
      if (data) {
        setUserData(data);
        console.log('AuthContext signin userData:', data); // Debug
      }
      return { user, error: null };
    }
    return { user: null, error };
  };

  // Handle signout
  const handleSignout = async () => {
    await signout();
    setUser(null);
    setUserData(null);
    localStorage.removeItem('user');
    console.log('AuthContext: User signed out'); // Debug
  };

  return (
    <AuthContext.Provider value={{ user, userData, loading, signin: handleSignin, signout: handleSignout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
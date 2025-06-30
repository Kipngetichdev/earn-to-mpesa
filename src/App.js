import React, { useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext } from './context/AuthContext';
import Reward from './components/Reward';
import Landing from './welcome/Landing';
import Signup from './welcome/Signup';
import Signin from './welcome/Signin';
import Home from './pages/Home';
import Tasks from './pages/Tasks';
import Earnings from './pages/Earnings';
import Refer from './pages/Refer';

const App = () => {
  const { user, loading } = useContext(AuthContext);

  if (loading) return null;

  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/signin" element={<Signin />} />
      <Route
        path="/reward"
        element={user ? <Reward /> : <Navigate to="/signin" />}
      />
      <Route
        path="/home"
        element={user ? <Home /> : <Navigate to="/signin" />}
      />
      <Route
        path="/tasks"
        element={user ? <Tasks /> : <Navigate to="/signin" />}
      />
      <Route
        path="/earnings"
        element={user ? <Earnings /> : <Navigate to="/signin" />}
      />
      <Route
        path="/refer"
        element={user ? <Refer /> : <Navigate to="/signin" />}
      />
    </Routes>
  );
};

export default App;

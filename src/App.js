import React, { useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext } from './context/AuthContext';
import BottomNav from './components/BottomNav';
import Reward from './components/Reward';
import Tasking from './components/Tasking';
import Landing from './welcome/Landing';
import Signup from './welcome/Signup';
import Signin from './welcome/Signin';
import Home from './pages/Home';
import Tasks from './pages/Tasks';
import Earnings from './pages/Earnings';
import Refer from './pages/Refer';

const App = () => {
  const { user, loading, userData } = useContext(AuthContext);

  if (loading) return null;

  return (
    <div className="min-h-screen bg-secondary font-roboto flex flex-col">
      <div className="flex-grow pb-16"> {/* Padding for BottomNav */}
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
            element={user ? <Home earnings={userData?.earnings || 0} /> : <Navigate to="/signin" />}
          />
          <Route
            path="/tasks"
            element={user ? <Tasks completeTask={() => {}} /> : <Navigate to="/signin" />}
          />
          <Route
            path="/tasks/:categoryId"
            element={user ? <Tasking /> : <Navigate to="/signin" />}
          />
          <Route
            path="/earnings"
            element={user ? <Earnings history={userData?.history || []} /> : <Navigate to="/signin" />}
          />
          <Route
            path="/refer"
            element={user ? <Refer completeTask={() => {}} /> : <Navigate to="/signin" />}
          />
          <Route
            path="/upgrade"
            element={user ? <div className="p-4 text-primary font-roboto">Upgrade page coming soon!</div> : <Navigate to="/signin" />}
          />
        </Routes>
      </div>
      <BottomNav />
    </div>
  );
};

export default App;
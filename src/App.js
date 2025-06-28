import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Landing from './welcome/Landing';
import Signup from './welcome/Signup';
import Signin from './welcome/Signin';
import Home from './pages/Home';
import Tasks from './pages/Tasks';
import Earnings from './pages/Earnings';
import Refer from './pages/Refer';
import './App.css';

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [earnings, setEarnings] = useState(0);
  const [history, setHistory] = useState([]);

  const completeTask = (reward, task) => {
    setEarnings(prev => prev + reward);
    setHistory(prev => [...prev, { task, reward, date: new Date().toLocaleString() }]);
  };

  const withdraw = () => {
    if (earnings >= 500) {
      alert(`Initiating withdrawal of KSh ${earnings} to M-Pesa...`);
      setEarnings(0);
      setHistory(prev => [...prev, { task: 'Withdrew to M-Pesa', reward: -earnings, date: new Date().toLocaleString() }]);
    } else {
      alert('Minimum withdrawal is KSh 500');
    }
  };

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-secondary font-roboto">
        {isAuthenticated && (
          <header className="bg-primary text-white p-4 text-center">
            <h1 className="text-2xl font-bold font-roboto">Earn to M-Pesa</h1>
            <p className="font-roboto">Balance: KSh {earnings}</p>
            <button
              className="bg-highlight text-white px-4 py-2 mt-2 rounded hover:bg-accent font-roboto"
              onClick={withdraw}
            >
              Withdraw to M-Pesa
            </button>
            <button
              className="bg-accent text-white px-4 py-2 mt-2 ml-2 rounded hover:bg-highlight font-roboto"
              onClick={() => setIsAuthenticated(false)}
            >
              Sign Out
            </button>
          </header>
        )}
        <main className="p-4 space-y-4">
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/signup" element={<Signup setIsAuthenticated={setIsAuthenticated} />} />
            <Route path="/signin" element={<Signin setIsAuthenticated={setIsAuthenticated} />} />
            <Route path="/dashboard" element={isAuthenticated ? <Home earnings={earnings} /> : <Landing />} />
            <Route path="/tasks" element={isAuthenticated ? <Tasks completeTask={completeTask} /> : <Landing />} />
            <Route path="/earnings" element={isAuthenticated ? <Earnings history={history} /> : <Landing />} />
            <Route path="/refer" element={isAuthenticated ? <Refer completeTask={completeTask} /> : <Landing />} />
          </Routes>
        </main>
        {isAuthenticated && <Navbar />}
      </div>
    </BrowserRouter>
  );
};

export default App;
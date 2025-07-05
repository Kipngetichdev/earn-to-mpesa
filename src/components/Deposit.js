import React, { useState, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../services/firebase';
import { CurrencyDollarIcon } from '@heroicons/react/24/solid';

const Deposit = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, userData } = useContext(AuthContext);
  const [amount, setAmount] = useState('');
  const [phone, setPhone] = useState(userData?.phone || '');
  const [depositError, setDepositError] = useState('');
  const [depositLoading, setDepositLoading] = useState(false);

  const validatePhone = (phone) => {
    const phoneRegex = /^(\+254|0)7\d{8}$/;
    return phoneRegex.test(phone);
  };

  const handleDeposit = async () => {
    if (!user) {
      setDepositError('Please sign in to deposit.');
      return;
    }
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount < 100) {
      setDepositError('Deposit amount must be at least KSh 100.');
      return;
    }
    if (!validatePhone(phone)) {
      setDepositError('Please enter a valid M-Pesa phone number (e.g., +2547XXXXXXXX or 07XXXXXXXX).');
      return;
    }

    setDepositLoading(true);
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        gamingEarnings: (userData?.gamingEarnings || 0) + numAmount,
        history: arrayUnion({
          task: 'M-Pesa Deposit',
          reward: numAmount,
          date: new Date().toLocaleString(),
        }),
      });
      console.log('Deposit initiated, amount:', numAmount, 'phone:', phone);
      alert(`Deposit of KSh ${numAmount.toFixed(2)} via ${phone} initiated successfully!`);
      navigate('/tasks', { replace: true });
    } catch (err) {
      console.error('Deposit error:', err);
      setDepositError('Failed to process deposit. Please try again.');
    }
    setDepositLoading(false);
  };

  const handleCancel = () => {
    const from = location.state?.from || '/tasks';
    console.log('Cancel redirecting to:', from);
    navigate(from, { replace: true });
  };

  return (
    <div className="min-h-screen bg-secondary font-roboto flex items-start justify-center px-4 pt-4 pb-20">
      <div className="w-full max-w-md">
        <h5 className="text-left font-bold text-primary font-roboto mb-4">
          Deposit to Your Account, {userData?.username || 'User'}!
        </h5>
        <div className="bg-primary text-white p-4 rounded-lg shadow-inner space-y-4">
          <p className="text-lg font-roboto">Enter the amount to deposit via M-Pesa</p>
          {depositError && (
            <p className="text-red-500 text-sm">{depositError}</p>
          )}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-roboto mb-1">Amount (KSh)</label>
              <input
                type="number"
                min="100"
                step="0.01"
                placeholder="Enter amount"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  setDepositError('');
                }}
                className="w-full bg-white text-primary px-3 py-2 rounded-lg font-roboto transition duration-300 focus:outline-none focus:ring-2 focus:ring-highlight"
              />
            </div>
            <div>
              <label className="block text-sm font-roboto mb-1">M-Pesa Phone Number</label>
              <input
                type="tel"
                placeholder="+2547XXXXXXXX or 07XXXXXXXX"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  setDepositError('');
                }}
                className="w-full bg-white text-primary px-3 py-2 rounded-lg font-roboto transition duration-300 focus:outline-none focus:ring-2 focus:ring-highlight"
              />
            </div>
          </div>
          <div className="flex justify-between gap-4 mt-4">
            <button
              onClick={handleDeposit}
              disabled={depositLoading || !user || !amount || amount < 100 || !validatePhone(phone)}
              className={`flex-1 bg-highlight text-white px-6 py-3 rounded-full font-roboto transition duration-300 flex items-center justify-center ${
                depositLoading || !user || !amount || amount < 100 || !validatePhone(phone)
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:bg-accent'
              }`}
            >
              <CurrencyDollarIcon className="w-5 h-5 mr-2" />
              {depositLoading ? 'Processing...' : 'Deposit'}
            </button>
            <button
              onClick={handleCancel}
              className="flex-1 bg-gray-400 text-white px-4 py-2 rounded-lg font-roboto transition duration-300 flex items-center justify-center hover:bg-gray-500"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Deposit;
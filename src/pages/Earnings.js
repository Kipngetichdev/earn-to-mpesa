import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../services/firebase';
import { ArrowUpIcon, ArrowDownIcon, WalletIcon } from '@heroicons/react/24/solid';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, LineElement, PointElement, LinearScale, CategoryScale, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(LineElement, PointElement, LinearScale, CategoryScale, Title, Tooltip, Legend);

const Earnings = ({ history }) => {
  const { user, userData } = useContext(AuthContext);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [depositAmount, setDepositAmount] = useState('');
  const [phone, setPhone] = useState(userData?.phone || '');
  const [error, setError] = useState('');
  const [chartLoading, setChartLoading] = useState(true);

  const totalBalance = (userData?.taskEarnings || 0) + (userData?.gamingEarnings || 0);

  // Process history for chart (last 7 days)
  const getChartData = () => {
    const days = 7;
    const today = new Date();
    const dates = Array.from({ length: days }, (_, i) => {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      return date.toISOString().split('T')[0]; // YYYY-MM-DD
    }).reverse();

    const earningsByDay = dates.reduce((acc, date) => ({ ...acc, [date]: 0 }), {});
    history.forEach(({ reward, date }) => {
      const parsedDate = new Date(date);
      if (isNaN(parsedDate)) {
        console.warn(`Invalid date in history: ${date}`);
        return;
      }
      const day = parsedDate.toISOString().split('T')[0];
      if (dates.includes(day)) {
        earningsByDay[day] = (earningsByDay[day] || 0) + reward;
      }
    });

    return {
      labels: dates.map(date => {
        const d = new Date(date);
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      }),
      datasets: [{
        label: 'Daily Earnings (KSh)',
        data: dates.map(date => earningsByDay[date] || 0),
        borderColor: '#03A6A1',
        backgroundColor: 'rgba(3, 166, 161, 0.2)',
        pointBackgroundColor: '#FF4F0F',
        pointBorderColor: '#FF4F0F',
        fill: true,
        tension: 0.4,
      }],
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: 'white',
          font: { family: 'Roboto', size: 14 },
        },
      },
      title: {
        display: true,
        text: 'Earnings Over Last 7 Days',
        color: 'white',
        font: { family: 'Roboto', size: 16, weight: 'bold' },
      },
      tooltip: {
        callbacks: {
          label: (context) => `KSh ${context.parsed.y.toFixed(2)}`,
        },
      },
    },
    scales: {
      x: {
        ticks: { color: 'white', font: { family: 'Roboto' } },
        grid: { color: 'rgba(255, 255, 255, 0.1)' },
      },
      y: {
        ticks: {
          color: 'white',
          font: { family: 'Roboto' },
          callback: (value) => `KSh ${value.toFixed(2)}`,
        },
        grid: { color: 'rgba(255, 255, 255, 0.1)' },
      },
    },
  };

  useEffect(() => {
    // Simulate chart data processing
    setTimeout(() => setChartLoading(false), 500);
  }, [history]);

  const validatePhone = (phone) => {
    return /^\+254\d{9}$/.test(phone);
  };

  const handleWithdraw = async () => {
    const amount = parseFloat(withdrawAmount);
    if (!amount || amount <= 0) {
      setError('Please enter a valid amount.');
      return;
    }
    if (amount > totalBalance) {
      setError('Amount exceeds total balance.');
      return;
    }
    if (!validatePhone(phone)) {
      setError('Please enter a valid phone number (+254 format).');
      return;
    }
    try {
      const userRef = doc(db, 'users', user.uid);
      let newGamingEarnings = userData?.gamingEarnings || 0;
      let newTaskEarnings = userData?.taskEarnings || 0;
      if (amount <= newGamingEarnings) {
        newGamingEarnings -= amount;
      } else {
        const remaining = amount - newGamingEarnings;
        newGamingEarnings = 0;
        newTaskEarnings = Math.max(0, newTaskEarnings - remaining);
      }
      await updateDoc(userRef, {
        gamingEarnings: newGamingEarnings,
        taskEarnings: newTaskEarnings,
        history: arrayUnion({
          task: `Withdrawal to M-Pesa (${phone})`,
          reward: -amount,
          date: new Date().toLocaleString(),
        }),
      });
      setShowWithdrawModal(false);
      setWithdrawAmount('');
      setPhone(userData?.phone || '');
      setError('');
    } catch (err) {
      console.error('Withdraw error:', err);
      setError('Failed to process withdrawal.');
    }
  };

  const handleDeposit = async () => {
    const amount = parseFloat(depositAmount);
    if (!amount || amount <= 0) {
      setError('Please enter a valid amount.');
      return;
    }
    if (!validatePhone(phone)) {
      setError('Please enter a valid phone number (+254 format).');
      return;
    }
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        taskEarnings: (userData.taskEarnings || 0) + amount,
        history: arrayUnion({
          task: `Deposit from M-Pesa (${phone})`,
          reward: amount,
          date: new Date().toLocaleString(),
        }),
      });
      setShowDepositModal(false);
      setDepositAmount('');
      setPhone(userData?.phone || '');
      setError('');
    } catch (err) {
      console.error('Deposit error:', err);
      setError('Failed to process deposit.');
    }
  };

  return (
    <div className="min-h-screen bg-secondary font-roboto flex items-start justify-center px-4 pt-4 pb-20">
      <div className="w-full max-w-md">
        <h2 className="text-left font-bold text-primary font-roboto mb-4">Earnings</h2>
        <div className="space-y-4">
          {/* Total Balance Card */}
          <div className="bg-primary text-white p-6 rounded-lg shadow-inner">
            <div className="flex items-center space-x-2 mb-4">
              <WalletIcon className="w-6 h-6 text-white" />
              <h3 className="text-lg font-bold font-roboto">Your Wallet</h3>
            </div>
            <p className="text-lg font-bold font-roboto">
              Total Balance: KSh {totalBalance.toFixed(2)}
            </p>
            <p className="text-sm font-roboto">
              Available Balance: KSh {totalBalance.toFixed(2)}
            </p>
          </div>
          {/* Withdraw and Deposit Buttons */}
          <div className="flex flex-col sm:flex-row gap-2">
            <button
              onClick={() => setShowWithdrawModal(true)}
              className="flex-1 bg-white text-primary px-4 py-2 rounded-lg font-roboto transition duration-300 hover:bg-accent hover:text-white flex items-center justify-center"
              disabled={totalBalance <= 0}
            >
              <ArrowUpIcon className="w-5 h-5 mr-2" />
              Withdraw
            </button>
            <button
              onClick={() => setShowDepositModal(true)}
              className="flex-1 bg-white text-primary px-4 py-2 rounded-lg font-roboto transition duration-300 hover:bg-accent hover:text-white flex items-center justify-center"
            >
              <ArrowDownIcon className="w-5 h-5 mr-2" />
              Deposit
            </button>
          </div>
          {/* Earnings Chart */}
          <div className="bg-primary text-white p-6 rounded-lg shadow-inner">
            {chartLoading ? (
              <p className="text-sm font-roboto text-center">Loading chart...</p>
            ) : (
              <div style={{ height: '200px' }}>
                <Line data={getChartData()} options={chartOptions} />
              </div>
            )}
          </div>
          {/* Earnings History Card */}
          <div className="bg-primary text-white p-6 rounded-lg shadow-inner">
            <h3 className="text-lg font-bold font-roboto mb-4">Earnings History</h3>
            {history.length === 0 ? (
              <p className="text-sm font-roboto">No earnings yet.</p>
            ) : (
              <div className="max-h-60 overflow-y-auto">
                <ul className="space-y-2">
                  {history.map((entry, index) => (
                    <li
                      key={index}
                      className="bg-gray-100 text-primary p-2 rounded font-roboto text-sm"
                    >
                      {entry.task}: KSh {entry.reward.toFixed(2)} ({entry.date})
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
        {/* Withdraw Modal */}
        {showWithdrawModal && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => {
              setShowWithdrawModal(false);
              setWithdrawAmount('');
              setPhone(userData?.phone || '');
              setError('');
            }}
          >
            <div
              className="bg-white rounded-lg p-6 w-full max-w-md mx-4 text-center shadow-lg animate-fade-in"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-bold text-primary font-roboto mb-4">Withdraw Funds</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-roboto text-primary mb-1">Amount (KSh)</label>
                  <input
                    type="number"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    placeholder="Enter amount"
                    className="w-full p-2 rounded-lg border border-gray-300 font-roboto text-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-roboto text-primary mb-1">M-Pesa Phone Number</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+254XXXXXXXXX"
                    className="w-full p-2 rounded-lg border border-gray-300 font-roboto text-primary"
                  />
                </div>
                {error && <p className="text-red-500 text-sm font-roboto">{error}</p>}
                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    onClick={handleWithdraw}
                    className="flex-1 bg-highlight text-white px-4 py-2 rounded-lg font-roboto transition duration-300 hover:bg-accent"
                  >
                    Confirm Withdrawal
                  </button>
                  <button
                    onClick={() => {
                      setShowWithdrawModal(false);
                      setWithdrawAmount('');
                      setPhone(userData?.phone || '');
                      setError('');
                    }}
                    className="flex-1 bg-gray-200 text-primary px-4 py-2 rounded-lg font-roboto transition duration-300 hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        {/* Deposit Modal */}
        {showDepositModal && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => {
              setShowDepositModal(false);
              setDepositAmount('');
              setPhone(userData?.phone || '');
              setError('');
            }}
          >
            <div
              className="bg-white rounded-lg p-6 w-full max-w-md mx-4 text-center shadow-lg animate-fade-in"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-bold text-primary font-roboto mb-4">Deposit Funds</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-roboto text-primary mb-1">Amount (KSh)</label>
                  <input
                    type="number"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    placeholder="Enter amount"
                    className="w-full p-2 rounded-lg border border-gray-300 font-roboto text-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-roboto text-primary mb-1">M-Pesa Phone Number</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+254XXXXXXXXX"
                    className="w-full p-2 rounded-lg border border-gray-300 font-roboto text-primary"
                  />
                </div>
                {error && <p className="text-red-500 text-sm font-roboto">{error}</p>}
                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    onClick={handleDeposit}
                    className="flex-1 bg-highlight text-white px-4 py-2 rounded-lg font-roboto transition duration-300 hover:bg-accent"
                  >
                    Confirm Deposit
                  </button>
                  <button
                    onClick={() => {
                      setShowDepositModal(false);
                      setDepositAmount('');
                      setPhone(userData?.phone || '');
                      setError('');
                    }}
                    className="flex-1 bg-gray-200 text-primary px-4 py-2 rounded-lg font-roboto transition duration-300 hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      <style jsx>{`
        .animate-fade-in {
          animation: fadeIn 0.3s ease-in;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default Earnings;
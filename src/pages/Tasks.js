import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wheel } from 'react-custom-roulette';
import { AuthContext } from '../context/AuthContext';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../services/firebase';
import { CurrencyDollarIcon } from '@heroicons/react/24/solid';
import surveyImage from '../assets/spin.png';
import { usePlayerData } from '../services/playerData';

const Tasks = () => {
  const navigate = useNavigate();
  const { user, userData } = useContext(AuthContext);
  const [mustSpin, setMustSpin] = useState(false);
  const [prizeNumber, setPrizeNumber] = useState(0);
  const [reward, setReward] = useState(null);
  const [withdrawalError, setWithdrawalError] = useState('');
  const [withdrawalLoading, setWithdrawalLoading] = useState(false);
  const [selectedStake, setSelectedStake] = useState(20); // Default stake: KSh 20
  const [stakeError, setStakeError] = useState('');

  const stakes = [20, 50, 100, 150, 300];

  const data = [
    { option: 'KSh 5.00', style: { backgroundColor: '#03A6A1', textColor: 'white' } },
    { option: 'KSh 105', style: { backgroundColor: '#FFE3BB', textColor: '#FF4F0F' } },
    { option: 'KSh 150', style: { backgroundColor: '#FFA673', textColor: 'white' } },
    { option: 'KSh 255', style: { backgroundColor: '#FF4F0F', textColor: 'white' } },
    { option: 'KSh 280', style: { backgroundColor: '#03A6A1', textColor: 'white' } },
    { option: 'KSh 320', style: { backgroundColor: '#FFE3BB', textColor: '#FF4F0F' } },
    { option: 'KSh 375', style: { backgroundColor: '#FFA673', textColor: 'white' } },
    { option: 'KSh 450', style: { backgroundColor: '#FF4F0F', textColor: 'white' } },
  ];

  const handleStakeSelect = (stake) => {
    setSelectedStake(stake);
    setStakeError('');
  };

  const handleStakeInput = (e) => {
    const value = e.target.value;
    if (value === '') {
      setSelectedStake(20); // Revert to default if input is cleared
      setStakeError('');
      return;
    }
    const numValue = parseFloat(value);
    if (isNaN(numValue) || numValue < 100) {
      setStakeError('Stake must be at least KSh 100.');
      setSelectedStake(20);
    } else {
      setSelectedStake(numValue);
      setStakeError('');
    }
  };

  const handleSpinClick = () => {
    if (!mustSpin) {
      const totalBalance = (userData?.gamingEarnings || 0) + (userData?.taskEarnings || 0);
      if (totalBalance < selectedStake) {
        setStakeError('Insufficient balance to spin with selected stake.');
        return;
      }
      if (selectedStake < 10) {
        setStakeError('Stake must be at least KSh 10.');
        return;
      }
      setStakeError('');
      const newPrizeNumber = Math.floor(Math.random() * data.length);
      setPrizeNumber(newPrizeNumber);
      setMustSpin(true);
    }
  };

  const onStopSpinning = async () => {
    setMustSpin(false);
    const winner = data[prizeNumber].option;
    const rewardValue = parseFloat(winner.replace('KSh ', ''));
    setReward(rewardValue);

    if (user) {
      const userRef = doc(db, 'users', user.uid);
      try {
        const newGamingEarnings = Math.max(0, (userData?.gamingEarnings || 0) - selectedStake);
        const newTaskEarnings =
          newGamingEarnings === 0 && selectedStake > (userData?.gamingEarnings || 0)
            ? Math.max(0, (userData?.taskEarnings || 0) - (selectedStake - (userData?.gamingEarnings || 0)))
            : userData?.taskEarnings || 0;

        await updateDoc(userRef, {
          gamingEarnings: newGamingEarnings + rewardValue,
          taskEarnings: newTaskEarnings,
          history: arrayUnion(
            {
              task: `Spin to Win (Stake KSh ${selectedStake}, ${userData?.username || 'User'})`,
              reward: -selectedStake,
              date: new Date().toLocaleString(),
            },
            {
              task: `Spin to Win (${userData?.username || 'User'})`,
              reward: rewardValue,
              date: new Date().toLocaleString(),
            }
          ),
        });
      } catch (err) {
        console.error('Spin to Win error:', err);
        alert('Failed to save reward. Please try again.');
      }
    }

    // setTimeout(() => {
    //   navigate('/home', { replace: true });
    // }, 3000);
  };

  const handleWithdrawal = async () => {
    if (!user) {
      setWithdrawalError('Please sign in to withdraw.');
      return;
    }
    if (!userData?.phone) {
      setWithdrawalError('M-Pesa phone number not found.');
      return;
    }
    const totalBalance = (userData?.gamingEarnings || 0) + (userData?.taskEarnings || 0);
    if (totalBalance < 10) {
      setWithdrawalError('Minimum withdrawal amount is KSh 10.');
      return;
    }

    setWithdrawalLoading(true);
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        gamingEarnings: 0,
        taskEarnings: 0,
        history: arrayUnion({
          task: 'M-Pesa Withdrawal',
          reward: -totalBalance,
          date: new Date().toLocaleString(),
        }),
      });
      alert(`Withdrawal of KSh ${totalBalance.toFixed(2)} to ${userData.phone} initiated successfully!`);
    } catch (err) {
      console.error('Withdrawal error:', err);
      setWithdrawalError('Failed to process withdrawal. Please try again.');
    }
    setWithdrawalLoading(false);
  };

  const handleDeposit = () => {
    console.log('Navigating to /deposit from /tasks');
    navigate('/deposit', { replace: true, state: { from: '/tasks' } });
  };

  const players = usePlayerData();

  return (
    <div className="min-h-screen bg-secondary font-roboto flex items-start justify-center px-4 pt-4 pb-20">
      <div className="w-full max-w-md">
        <h5 className="text-left font-bold text-primary font-roboto mb-4">
          Welcome, {userData?.username || 'User'}! Spin to Win!
        </h5>
        <div className="bg-primary text-white p-4 rounded-lg shadow-inner space-y-2">
          <div className="flex items-center">
            <img
              src={surveyImage}
              alt="Spin to Win"
              className="w-20 h-20 object-cover rounded-md mr-4"
            />
            <div className="flex flex-col flex-grow">
              <p className="text-lg font-roboto">
                Spin to Win for a chance to earn up to KSh 10,000!
              </p>
            </div>
          </div>
          <p className="text-lg font-roboto">
            Gaming Earnings: KSh {userData?.gamingEarnings ? userData.gamingEarnings.toFixed(2) : '0.00'}
          </p>
          <p className="text-lg font-roboto">
            Tasks Earnings: KSh {userData?.taskEarnings ? userData.taskEarnings.toFixed(2) : '0.00'}
          </p>
          <p className="text-lg font-bold font-roboto">
            Total: KSh {((userData?.gamingEarnings || 0) + (userData?.taskEarnings || 0)).toFixed(2)}
          </p>
          {withdrawalError && (
            <p className="text-red-500 text-sm">{withdrawalError}</p>
          )}
          <div className="flex justify-between gap-4 mt-4">
            <button
              onClick={handleWithdrawal}
              disabled={withdrawalLoading || !user || ((userData?.gamingEarnings || 0) + (userData?.taskEarnings || 0)) < 10}
              className={`flex-1 bg-white text-primary px-4 py-2 rounded-lg font-roboto transition duration-300 flex items-center justify-center ${
                withdrawalLoading || !user || ((userData?.gamingEarnings || 0) + (userData?.taskEarnings || 0)) < 10
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:bg-accent hover:text-white'
              }`}
            >
              <CurrencyDollarIcon className="w-5 h-5 mr-2" />
              {withdrawalLoading ? 'Processing...' : 'Withdraw to M-Pesa'}
            </button>
            <button
              onClick={handleDeposit}
              className="flex-1 bg-white text-primary px-4 py-2 rounded-lg font-roboto transition duration-300 flex items-center justify-center hover:bg-accent hover:text-white"
            >
              <CurrencyDollarIcon className="w-5 h-5 mr-2" />
              Deposit
            </button>
          </div>
        </div>
        <div className="mt-6 relative z-0">
          <Wheel
            mustStartSpinning={mustSpin}
            prizeNumber={prizeNumber}
            data={data}
            onStopSpinning={onStopSpinning}
            backgroundColors={['#03A6A1', '#FFE3BB', '#FFA673', '#FF4F0F']}
            textColors={['white', '#FF4F0F']}
            outerBorderColor="#03A6A1"
            outerBorderWidth={5}
            radiusLineColor="#03A6A1"
            radiusLineWidth={2}
            fontFamily="Roboto"
            fontSize={16}
            perpendicularText={true}
            spinDuration={0.6}
          />
        </div>
        {reward && (
          <p className="text-xl text-highlight font-roboto mt-4">
            You won KSh {reward.toFixed(2)}!
          </p>
        )}
        {stakeError && (
          <p className="text-red-500 text-sm mt-2">{stakeError}</p>
        )}
        <div className="bg-primary text-white p-4 rounded-lg shadow-inner space-y-2 mt-4">
          <p className="text-lg font-bold font-roboto">Choose Stake</p>
          <p className="text-sm font-roboto">Stake will be deducted from total balance</p>
          <div className="flex flex-wrap justify-center gap-2">
            {stakes.map((stake) => (
              <button
                key={stake}
                onClick={() => handleStakeSelect(stake)}
                className={`flex-1 px-3 py-2 rounded-lg font-roboto transition duration-300 min-w-[60px] ${
                  selectedStake === stake 
                    ? 'bg-highlight text-white font-bold shadow-md' 
                    : 'bg-white text-primary hover:bg-accent hover:text-white'
                }`}
              >
                KSh {stake}
              </button>
            ))}
            <input
              type="number"
              min="10"
              step="0.01"
              placeholder="Custom Stake"
              onChange={handleStakeInput}
              className="flex-1 bg-white text-primary px-3 py-2 rounded-lg font-roboto transition duration-300 min-w-[60px] focus:outline-none focus:ring-2 focus:ring-highlight"
            />
          </div>
          <button
            onClick={handleSpinClick}
            disabled={mustSpin || !user || ((userData?.gamingEarnings || 0) + (userData?.taskEarnings || 0)) < selectedStake || selectedStake < 10}
            className={`mt-4 bg-highlight text-white px-6 py-3 rounded-full font-roboto hover:bg-accent transition duration-300 w-full ${
              mustSpin || !user || ((userData?.gamingEarnings || 0) + (userData?.taskEarnings || 0)) < selectedStake || selectedStake < 10
                ? 'opacity-50 cursor-not-allowed'
                : ''
            }`}
          >
            {mustSpin ? 'Spinning...' : `Spin for KSh ${selectedStake.toFixed(2)}`}
          </button>
        </div>
        <div className="bg-primary text-white p-4 rounded-lg shadow-inner space-y-2 mt-4">
          <p className="text-lg font-bold font-roboto">Players</p>
          <div className="max-h-60 overflow-y-auto">
            <div className="grid grid-cols-4 gap-2 text-sm font-roboto font-bold text-primary bg-gray-100 p-2 rounded-t-lg">
              <span>User ID</span>
              <span>Result</span>
              <span>Stake</span>
              <span>Cashout</span>
            </div>
            {players.map((player, index) => (
              <div
                key={index}
                className="grid grid-cols-4 gap-2 text-sm font-roboto bg-white text-primary p-2 hover:bg-gray-100 transition duration-300"
              >
                <span>{player.userId}</span>
                <span className={player.result === 'Won' ? 'text-green-500' : 'text-red-500'}>
                  {player.result}
                </span>
                <span>KSh {player.stake.toFixed(2)}</span>
                <span>KSh {player.cashout.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Tasks;
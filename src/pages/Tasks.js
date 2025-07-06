import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wheel } from 'react-custom-roulette';
import { AuthContext } from '../context/AuthContext';
import { doc, updateDoc, arrayUnion, getDoc, runTransaction, onSnapshot } from 'firebase/firestore';
import { db } from '../services/firebase';
import { CurrencyDollarIcon, ExclamationTriangleIcon } from '@heroicons/react/24/solid';
import surveyImage from '../assets/spin.png';
import { usePlayerData } from '../services/playerData';

const Tasks = () => {
  const navigate = useNavigate();
  const { user, userData, loading: authLoading } = useContext(AuthContext);
  const [localUserData, setLocalUserData] = useState(userData); // Local state for Firestore data
  const [mustSpin, setMustSpin] = useState(false);
  const [prizeNumber, setPrizeNumber] = useState(0);
  const [reward, setReward] = useState(null);
  const [withdrawalError, setWithdrawalError] = useState('');
  const [withdrawalLoading, setWithdrawalLoading] = useState(false);
  const [selectedStake, setSelectedStake] = useState(20); // Default stake: KSh 20
  const [stakeError, setStakeError] = useState('');
  const [spinCount, setSpinCount] = useState(0);
  const [isBettingAccountActive, setIsBettingAccountActive] = useState(false);
  const [showActivationModal, setShowActivationModal] = useState(false);
  const [activationError, setActivationError] = useState('');
  const [activationLoading, setActivationLoading] = useState(false);
  const [phone, setPhone] = useState(userData?.phone || '');
  const [phoneError, setPhoneError] = useState('');
  const [balanceLoading, setBalanceLoading] = useState(true);

  const stakes = [20, 50, 100, 150, 200, 300];

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

  // Sync localUserData with userData when it changes
  useEffect(() => {
    setLocalUserData(userData);
    if (!authLoading && userData) {
      setBalanceLoading(false);
    }
  }, [userData, authLoading]);

  // Fetch user data and set up real-time listener
  useEffect(() => {
    if (!user || authLoading) {
      setBalanceLoading(false);
      setLocalUserData(null);
      setSpinCount(0);
      setIsBettingAccountActive(false);
      setPhone('');
      return;
    }

    const userRef = doc(db, 'users', user.uid);
    // Initial fetch
    const fetchUserData = async () => {
      try {
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const data = userSnap.data();
          setLocalUserData(data); // Update local state
          setSpinCount(data.spinCount || 0);
          setIsBettingAccountActive(data.isBettingAccountActive || false);
          setPhone(data.phone || '');
          if (data.spinCount >= 3 && !data.isBettingAccountActive) {
            setShowActivationModal(true);
          }
          console.log('Tasks fetched user data:', { 
            gamingEarnings: data.gamingEarnings, 
            taskEarnings: data.taskEarnings,
            spinCount: data.spinCount, 
            isBettingAccountActive: data.isBettingAccountActive 
          });
          setBalanceLoading(false);
        }
      } catch (err) {
        console.error('Tasks fetch user data error:', err);
        setBalanceLoading(false);
      }
    };

    // Real-time listener
    const unsubscribe = onSnapshot(userRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        setLocalUserData(data); // Update local state
        setSpinCount(data.spinCount || 0);
        setIsBettingAccountActive(data.isBettingAccountActive || false);
        setPhone(data.phone || '');
        if (data.spinCount >= 3 && !data.isBettingAccountActive) {
          setShowActivationModal(true);
        }
        console.log('Tasks onSnapshot user data:', { 
          gamingEarnings: data.gamingEarnings, 
          taskEarnings: data.taskEarnings,
          spinCount: data.spinCount, 
          isBettingAccountActive: data.isBettingAccountActive 
        });
        setBalanceLoading(false);
      }
    }, (err) => {
      console.error('Tasks onSnapshot error:', err);
      setBalanceLoading(false);
    });

    fetchUserData(); // Initial fetch
    return () => unsubscribe(); // Cleanup listener
  }, [user, authLoading]);

  const handleStakeSelect = (stake) => {
    setSelectedStake(stake);
    setStakeError('');
  };

  const handleStakeInput = (e) => {
    const value = e.target.value;
    if (value === '') {
      setSelectedStake(20); // Revert to default
      setStakeError('');
      return;
    }
    const numValue = parseFloat(value);
    if (isNaN(numValue) || numValue < 20) {
      setStakeError('Stake must be at least KSh 20.');
      setSelectedStake(20);
    } else {
      setSelectedStake(numValue);
      setStakeError('');
    }
  };

  const handlePhoneInput = (e) => {
    const value = e.target.value;
    setPhone(value);
    // Validate Kenyan phone number (+2547XXXXXXXX or 07XXXXXXXX)
    const phoneRegex = /^(\+2547\d{8}|07\d{8})$/;
    if (!phoneRegex.test(value)) {
      setPhoneError('Please enter a valid Kenyan phone number (e.g., +2547XXXXXXXX or 07XXXXXXXX).');
    } else {
      setPhoneError('');
    }
  };

  const handleSpinClick = async () => {
    if (mustSpin) return;
    if (!user) {
      setStakeError('Please sign in to spin.');
      return;
    }
    const totalBalance = (localUserData?.gamingEarnings || 0) + (localUserData?.taskEarnings || 0);
    if (totalBalance < selectedStake) {
      setStakeError('Insufficient balance to spin with selected stake.');
      return;
    }
    if (selectedStake < 20) {
      setStakeError('Stake must be at least KSh 20.');
      return;
    }
    if (spinCount >= 3 && !isBettingAccountActive) {
      setShowActivationModal(true);
      return;
    }

    setStakeError('');
    try {
      const userRef = doc(db, 'users', user.uid);
      await runTransaction(db, async (transaction) => {
        const userSnap = await transaction.get(userRef);
        if (!userSnap.exists()) {
          throw new Error('User not found');
        }
        const userData = userSnap.data();
        const newGamingEarnings = Math.max(0, (userData.gamingEarnings || 0) - selectedStake);
        const newTaskEarnings =
          newGamingEarnings === 0 && selectedStake > (userData.gamingEarnings || 0)
            ? Math.max(0, (userData.taskEarnings || 0) - (selectedStake - (userData.gamingEarnings || 0)))
            : userData.taskEarnings || 0;

        transaction.update(userRef, {
          gamingEarnings: newGamingEarnings,
          taskEarnings: newTaskEarnings,
          history: arrayUnion({
            task: `Spin to Win (Stake KSh ${selectedStake}, ${userData.username || 'User'})`,
            reward: -selectedStake,
            date: new Date().toLocaleString(),
          }),
        });
      });
      const newPrizeNumber = Math.floor(Math.random() * data.length);
      setPrizeNumber(newPrizeNumber);
      setMustSpin(true);
    } catch (err) {
      console.error('Stake deduction error:', err);
      setStakeError('Failed to deduct stake. Please try again.');
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
        const userSnap = await getDoc(userRef);
        const currentData = userSnap.exists() ? userSnap.data() : {};
        await updateDoc(userRef, {
          gamingEarnings: (currentData.gamingEarnings || 0) + rewardValue,
          spinCount: spinCount + 1,
          history: arrayUnion({
            task: `Spin to Win (${currentData.username || 'User'})`,
            reward: rewardValue,
            date: new Date().toLocaleString(),
          }),
        });
        setSpinCount(spinCount + 1);
        if (spinCount + 1 === 3 && !isBettingAccountActive) {
          setShowActivationModal(true);
        }
      } catch (err) {
        console.error('Spin to Win error:', err);
        alert('Failed to save reward. Please try again.');
      }
    }
  };

  const handleWithdrawal = async () => {
    if (!user) {
      setWithdrawalError('Please sign in to withdraw.');
      return;
    }
    if (!localUserData?.phone) {
      setWithdrawalError('M-Pesa phone number not found.');
      return;
    }
    const totalBalance = (localUserData?.gamingEarnings || 0) + (localUserData?.taskEarnings || 0);
    if (totalBalance < 10) {
      setWithdrawalError('Minimum withdrawal amount is KSh 10.');
      return;
    }

    setWithdrawalLoading(true);
    try {
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      const currentData = userSnap.exists() ? userSnap.data() : {};
      let newGamingEarnings = currentData.gamingEarnings || 0;
      let newTaskEarnings = currentData.taskEarnings || 0;
      if (totalBalance <= newGamingEarnings) {
        newGamingEarnings -= totalBalance;
      } else {
        const remaining = totalBalance - newGamingEarnings;
        newGamingEarnings = 0;
        newTaskEarnings = Math.max(0, newTaskEarnings - remaining);
      }
      await updateDoc(userRef, {
        gamingEarnings: newGamingEarnings,
        taskEarnings: newTaskEarnings,
        history: arrayUnion({
          task: `M-Pesa Withdrawal (${localUserData.phone})`,
          reward: -totalBalance,
          date: new Date().toLocaleString(),
        }),
      });
      alert(`Withdrawal of KSh ${totalBalance.toFixed(2)} to ${localUserData.phone} initiated successfully!`);
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

  const handleActivation = async () => {
    if (!user) {
      setActivationError('Please sign in to activate.');
      return;
    }
    if (!phone) {
      setActivationError('Please enter a phone number.');
      return;
    }
    const phoneRegex = /^(\+2547\d{8}|07\d{8})$/;
    if (!phoneRegex.test(phone)) {
      setActivationError('Please enter a valid Kenyan phone number (e.g., +2547XXXXXXXX or 07XXXXXXXX).');
      return;
    }
    const totalBalance = (localUserData?.gamingEarnings || 0) + (localUserData?.taskEarnings || 0);
    if (totalBalance < 150) {
      setActivationError('Insufficient balance to activate (KSh 150 required). Please deposit.');
      return;
    }

    setActivationLoading(true);
    try {
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      const currentData = userSnap.exists() ? userSnap.data() : {};
      const newGamingEarnings = Math.max(0, (currentData.gamingEarnings || 0) - 150);
      const newTaskEarnings =
        newGamingEarnings === 0 && 150 > (currentData.gamingEarnings || 0)
          ? Math.max(0, (currentData.taskEarnings || 0) - (150 - (currentData.gamingEarnings || 0)))
          : currentData.taskEarnings || 0;

      await updateDoc(userRef, {
        gamingEarnings: newGamingEarnings,
        taskEarnings: newTaskEarnings,
        isBettingAccountActive: true,
        phone: phone, // Update phone number in Firestore
        history: arrayUnion({
          task: 'Account Activation',
          reward: -150,
          date: new Date().toLocaleString(),
        }),
      });
      setIsBettingAccountActive(true);
      setShowActivationModal(false);
      alert('Betting account activated successfully! You can now spin and withdraw instantly.');
    } catch (err) {
      console.error('Activation error:', err);
      setActivationError('Failed to activate account. Please try again.');
    }
    setActivationLoading(false);
  };

  const players = usePlayerData();

  return (
    <div className="min-h-screen bg-secondary font-roboto flex items-start justify-center px-4 pt-4 pb-20">
      <div className="w-full max-w-md">
        <h5 className="text-left font-bold text-primary font-roboto mb-4">
          Welcome, {localUserData?.username || userData?.username || 'User'}! Spin to Win!
        </h5>
        <div className="bg-primary text-white p-4 rounded-lg shadow-inner space-y-2">
          {balanceLoading || authLoading ? (
            <p className="text-lg font-roboto text-center">Loading balance...</p>
          ) : (
            <>
              <div className="flex items-center">
                <img
                  src={surveyImage}
                  alt="Spin to Win"
                  className="w-20 h-20 object-cover rounded-md mr-4"
                />
                <div className="flex flex-col flex-grow">
                  <p className="text-lg font-roboto">
                    Spin to Win for a chance to earn up to KSh 450!
                  </p>
                </div>
              </div>
              <p className="text-lg font-roboto">
                Gaming Earnings: KSh {localUserData?.gamingEarnings ? localUserData.gamingEarnings.toFixed(2) : '0.00'}
              </p>
              <p className="text-lg font-roboto">
                Tasks Earnings: KSh {localUserData?.taskEarnings ? localUserData.taskEarnings.toFixed(2) : '0.00'}
              </p>
              <p className="text-lg font-bold font-roboto">
                Total: KSh {((localUserData?.gamingEarnings || 0) + (localUserData?.taskEarnings || 0)).toFixed(2)}
              </p>
              {withdrawalError && (
                <p className="text-red-500 text-sm">{withdrawalError}</p>
              )}
              <div className="flex justify-between gap-4 mt-4">
                <button
                  onClick={handleWithdrawal}
                  disabled={withdrawalLoading || !user || ((localUserData?.gamingEarnings || 0) + (localUserData?.taskEarnings || 0)) < 10}
                  className={`flex-1 bg-white text-primary px-4 py-2 rounded-lg font-roboto transition duration-300 flex items-center justify-center ${
                    withdrawalLoading || !user || ((localUserData?.gamingEarnings || 0) + (localUserData?.taskEarnings || 0)) < 10
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
            </>
          )}
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
              min="20"
              step="0.01"
              placeholder="Custom Stake"
              onChange={handleStakeInput}
              className="flex-1 bg-white text-primary px-3 py-2 rounded-lg font-roboto transition duration-300 min-w-[60px] focus:outline-none focus:ring-2 focus:ring-highlight"
            />
          </div>
          <button
            onClick={handleSpinClick}
            disabled={mustSpin || !user || ((localUserData?.gamingEarnings || 0) + (localUserData?.taskEarnings || 0)) < selectedStake || selectedStake < 20 || (spinCount >= 3 && !isBettingAccountActive)}
            className={`mt-4 bg-highlight text-white px-6 py-3 rounded-full font-roboto hover:bg-accent transition duration-300 w-full ${
              mustSpin || !user || ((localUserData?.gamingEarnings || 0) + (localUserData?.taskEarnings || 0)) < selectedStake || selectedStake < 20 || (spinCount >= 3 && !isBettingAccountActive)
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
        {/* Activation Modal */}
        {showActivationModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => {}}>
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 text-center shadow-lg">
              <ExclamationTriangleIcon className="h-12 w-12 text-highlight mx-auto mb-4" />
              <h2 className="text-lg font-bold text-primary font-roboto mb-4">
                Activate Your Betting Account
              </h2>
              <p className="text-primary font-roboto mb-4">
                You've completed your 3 free spins! Activate your betting account for only KSh 150 to continue spinning and enable instant withdrawals.
              </p>
              {activationError && (
                <p className="text-red-500 text-sm mb-4">{activationError}</p>
              )}
              {phoneError && (
                <p className="text-red-500 text-sm mb-4">{phoneError}</p>
              )}
              <div className="mb-4">
                <label className="block text-sm font-roboto mb-1 text-primary">M-Pesa Phone Number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={handlePhoneInput}
                  placeholder="e.g., +2547XXXXXXXX or 07XXXXXXXX"
                  className="w-full bg-white text-primary px-3 py-2 rounded-lg font-roboto transition duration-300 focus:outline-none focus:ring-2 focus:ring-highlight"
                />
              </div>
              <div className="flex justify-center gap-4">
                <button
                  onClick={handleActivation}
                  disabled={activationLoading || !user || phoneError || !phone || ((localUserData?.gamingEarnings || 0) + (localUserData?.taskEarnings || 0)) < 150}
                  className={`bg-highlight text-white px-4 py-2 rounded-lg font-roboto transition duration-300 flex items-center justify-center ${
                    activationLoading || !user || phoneError || !phone || ((localUserData?.gamingEarnings || 0) + (localUserData?.taskEarnings || 0)) < 150
                      ? 'opacity-50 cursor-not-allowed'
                      : 'hover:bg-accent'
                  }`}
                >
                  {activationLoading ? 'Processing...' : 'Activate Now (KSh 150)'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Tasks;
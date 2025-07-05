import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { CheckCircleIcon, XMarkIcon, CurrencyDollarIcon } from '@heroicons/react/24/solid';
import {
  PaintBrushIcon,
  FilmIcon,
  BookOpenIcon,
  TvIcon,
  UserGroupIcon,
  MusicalNoteIcon,
  TvIcon as AnimeIcon,
  SpeakerWaveIcon,
  GlobeAmericasIcon,
  BuildingLibraryIcon,
  SparklesIcon,
  StarIcon,
  PuzzlePieceIcon,
  TrophyIcon,
  LightBulbIcon,
  ComputerDesktopIcon,
  BeakerIcon,
  LockClosedIcon,
} from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import { doc, updateDoc, arrayUnion, getDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import QuizCategories from '../components/QuizCategories';
import UpgradeAccount from '../components/UpgradeAccount';
import surveyImage from '../assets/survey.png';

const BottomSheet = ({ isOpen, onClose, user, accessPlan }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTier, setSelectedTier] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [disabledCategories, setDisabledCategories] = useState({});
  const navigate = useNavigate();

  // Log props for debugging
  console.log('BottomSheet props:', { accessPlan });

  // Fallback to 'free' if accessPlan is undefined
  const effectivePlan = accessPlan || 'free';

  // Map icons to categories
  const iconMap = {
    'Art': PaintBrushIcon,
    'Entertainment: Books': BookOpenIcon,
    'Entertainment: Cartoon & Animations': TvIcon,
    'Entertainment: Comics': BookOpenIcon,
    'Entertainment: Film': FilmIcon,
    'Entertainment: Japanese Anime & Manga': AnimeIcon,
    'Entertainment: Music': MusicalNoteIcon,
    'Entertainment: Musicals & Theatres': SpeakerWaveIcon,
    'Entertainment: Television': TvIcon,
    'Entertainment: Video Games': PuzzlePieceIcon,
    'General Knowledge': LightBulbIcon,
    'Geography': GlobeAmericasIcon,
    'History': BuildingLibraryIcon,
    'Mythology': SparklesIcon,
    'Politics': StarIcon,
    'Science: Computers': ComputerDesktopIcon,
    'Science: Gadgets': ComputerDesktopIcon,
    'Science: Mathematics': BeakerIcon,
    'Science & Nature': BeakerIcon,
    'Sports': TrophyIcon,
  };

  // Generate random duration for Free (1.5–2 min), Standard (2–3 min), or Premium (3–4 min)
  const getRandomDuration = (tier) => {
    const range = tier === 'free' ? [1.5, 2] : tier === 'standard' ? [2, 3] : [3, 4];
    const duration = (Math.random() * (range[1] - range[0]) + range[0]).toFixed(1);
    return `${duration} min`;
  };

  // Generate random reward for Free (KSh 4–8), Standard (KSh 80–170), or Premium (KSh 200–350)
  const getRandomReward = (tier) => {
    const range = tier === 'free' ? [4, 8] : tier === 'standard' ? [80, 170] : [200, 350];
    const reward = (Math.random() * (range[1] - range[0]) + range[0]).toFixed(2);
    return `KSh ${reward}`;
  };

  // Generate unique rewards for Free, Standard, or Premium tier categories
  const generateUniqueRewards = (count, min, max) => {
    const rewards = new Set();
    while (rewards.size < count) {
      const reward = (Math.random() * (max - min) + min).toFixed(2);
      rewards.add(reward);
    }
    return Array.from(rewards).map(reward => `KSh ${reward}`);
  };

  // Get or set fixed Duration and Rewards for Free, Standard, or Premium tier from localStorage
  const getTierMetadata = (tier, categories = []) => {
    const key = `${tier}TierMetadata`;
    const stored = localStorage.getItem(key);
    if (stored) {
      return JSON.parse(stored);
    }
    const metadata = {
      duration: getRandomDuration(tier),
      rewards: categories.reduce((acc, category, index) => {
        const min = tier === 'free' ? 4 : tier === 'standard' ? 80 : 200;
        const max = tier === 'free' ? 8 : tier === 'standard' ? 170 : 350;
        acc[category.id] = generateUniqueRewards(categories.length, min, max)[index] || `KSh ${min.toFixed(2)}`;
        return acc;
      }, {}),
    };
    localStorage.setItem(key, JSON.stringify(metadata));
    return metadata;
  };

  // Shuffle array using Fisher-Yates algorithm
  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Fetch all categories and group by tier
  const fetchCategories = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('https://opentdb.com/api_category.php');
      const data = await response.json();
      const allCategories = data.trivia_categories.sort((a, b) => a.name.localeCompare(b.name));

      // Define fixed category sets for each tier
      const freeCategories = allCategories.slice(0, 5); // First 5
      const standardCategories = allCategories.slice(5, 15); // Next 10
      const premiumCategories = allCategories.slice(15, 20); // Next 5

      // Process categories for each tier
      const freeMetadata = getTierMetadata('free', freeCategories);
      const standardMetadata = getTierMetadata('standard', standardCategories);
      const premiumMetadata = getTierMetadata('premium', premiumCategories);

      const processedCategories = [
        ...shuffleArray(freeCategories).map(category => ({
          ...category,
          duration: freeMetadata.duration,
          reward: freeMetadata.rewards[category.id] || `KSh 4.00`,
          tier: 'free',
        })),
        ...shuffleArray(standardCategories).map(category => ({
          ...category,
          duration: standardMetadata.duration,
          reward: standardMetadata.rewards[category.id] || `KSh 80.00`,
          tier: 'standard',
        })),
        ...shuffleArray(premiumCategories).map(category => ({
          ...category,
          duration: premiumMetadata.duration,
          reward: premiumMetadata.rewards[category.id] || `KSh 200.00`,
          tier: 'premium',
        })),
      ];

      setCategories(processedCategories);
      console.log('BottomSheet fetched categories:', processedCategories); // Debug
    } catch (err) {
      setError('Failed to fetch categories.');
      console.error('BottomSheet fetch categories error:', err);
    }
    setLoading(false);
  };

  // Fetch user history to determine disabled categories
  const fetchUserHistory = async () => {
    if (user) {
      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const history = userDoc.data().history || [];
          const now = new Date();
          const disabled = {};
          history.forEach(({ categoryId, completedAt }) => {
            if (completedAt) {
              const completedTime = new Date(completedAt); // Parse ISO string
              const diffMinutes = (now - completedTime) / (1000 * 60);
              if (diffMinutes < 120) { // 2 hours = 120 minutes
                disabled[categoryId] = true;
              }
            }
          });
          setDisabledCategories(disabled);
          console.log('BottomSheet disabled categories:', disabled); // Debug
        }
      } catch (err) {
        console.error('BottomSheet fetch user history error:', err);
      }
    }
  };

  // Handle Start Survey button click
  const handleStartSurvey = (category) => {
    console.log('BottomSheet handleStartSurvey:', { effectivePlan, categoryTier: category.tier, isModalOpen }); // Debug
    // Access logic: 
    // - Free plan: only Free categories accessible
    // - Standard plan: Free and Standard categories accessible
    // - Premium plan: Free, Standard, and Premium categories accessible
    const isAccessible = 
      effectivePlan === 'premium' ||
      (effectivePlan === 'standard' && (category.tier === 'free' || category.tier === 'standard')) ||
      (effectivePlan === 'free' && category.tier === 'free');

    if (!isAccessible) {
      setSelectedTier(category.tier);
      setIsModalOpen(true);
      console.log('BottomSheet opening upgrade modal for tier:', category.tier); // Debug
    } else {
      setSelectedCategory(category);
      setShowModal(true);
      console.log('BottomSheet opening instruction modal for category:', category.name); // Debug
    }
  };

  // Handle Continue button in instruction modal
  const handleContinue = () => {
    if (selectedCategory) {
      navigate(`/tasks/${selectedCategory.id}`);
      setShowModal(false);
      console.log('BottomSheet navigating to tasks:', selectedCategory.id); // Debug
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchCategories();
      if (user) {
        fetchUserHistory();
      }
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50" onClick={onClose}></div>
      <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-lg max-w-md mx-auto p-6 max-h-[80vh] overflow-y-auto z-50 animate-slide-up">
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-lg font-bold text-primary font-roboto">All Survey Categories</h4>
          <button onClick={onClose}>
            <XMarkIcon className="h-6 w-6 text-primary" />
          </button>
        </div>
        {loading ? (
          <p className="text-primary font-roboto">Loading categories...</p>
        ) : error ? (
          <p className="text-highlight font-roboto">{error}</p>
        ) : categories.length > 0 ? (
          <div className="space-y-6">
            {['free', 'standard', 'premium'].map((tier) => (
              <div key={tier}>
                <h4 className="text-md font-bold text-primary font-roboto mb-2">
                  {tier.charAt(0).toUpperCase() + tier.slice(1)} Surveys
                </h4>
                {categories
                  .filter((category) => category.tier === tier)
                  .map((category) => {
                    const Icon = iconMap[category.name] || UserGroupIcon;
                    // Show lock icon if category is not accessible
                    const showLockIcon = 
                      (effectivePlan === 'free' && (category.tier === 'standard' || category.tier === 'premium')) ||
                      (effectivePlan === 'standard' && category.tier === 'premium');
                    // Check if category is disabled
                    const isDisabled = disabledCategories[category.id];
                    console.log('BottomSheet Category:', category.name, 'Tier:', category.tier, 'Show lock:', showLockIcon, 'Disabled:', isDisabled); // Debug
                    return (
                      <div
                        key={category.id}
                        className="bg-white border border-primary rounded p-2 text-primary font-roboto hover:bg-secondary transition duration-300 flex items-center mb-2"
                      >
                        <div className="flex flex-col items-center w-1/3">
                          <Icon className="h-8 w-8 text-primary mb-2" />
                          <p className="text-sm font-roboto">Duration: {category.duration}</p>
                          <p className="text-sm font-roboto">Reward: {category.reward}</p>
                        </div>
                        <div className="flex flex-col w-2/3 pl-4">
                          <p className="text-lg font-bold text-primary">{category.name}</p>
                          <button
                            className={`mt-2 px-4 py-1 rounded font-roboto transition duration-300 flex items-center justify-center ${
                              isDisabled
                                ? 'bg-gray-400 text-white cursor-not-allowed'
                                : 'bg-highlight text-white hover:bg-accent'
                            }`}
                            onClick={() => handleStartSurvey(category)}
                            disabled={isDisabled}
                          >
                            {showLockIcon && !isDisabled && <LockClosedIcon className="h-4 w-4 mr-2" />}
                            Start Survey
                          </button>
                        </div>
                      </div>
                    );
                  })}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-primary font-roboto">No categories available.</p>
        )}
        {/* Instruction Modal */}
        {showModal && selectedCategory && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 text-center shadow-lg">
              <h2 className="text-lg font-bold text-primary font-roboto mb-4">
                {selectedCategory.name} Quiz
              </h2>
              <p className="text-primary font-roboto mb-4">
                Answer questions in the {selectedCategory.name} quiz. Complete to earn {selectedCategory.reward} in {selectedCategory.duration}!
              </p>
              <div className="flex justify-center gap-4">
                <button
                  className="bg-highlight text-white px-4 py-2 rounded hover:bg-accent font-roboto transition duration-300"
                  onClick={handleContinue}
                >
                  Continue
                </button>
                <button
                  className="bg-white border border-primary text-primary px-4 py-2 rounded hover:bg-secondary font-roboto transition duration-300"
                  onClick={() => {
                    setShowModal(false);
                    console.log('BottomSheet instruction modal closed'); // Debug
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
        <UpgradeAccount
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            console.log('BottomSheet upgrade modal closed'); // Debug
          }}
          tier={selectedTier}
          user={user}
        />
      </div>
      <style jsx>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </>
  );
};

const Home = () => {
  const { user, userData } = useContext(AuthContext);
  const [selectedPlan, setSelectedPlan] = useState(userData?.plan || 'free');
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
  const [withdrawalError, setWithdrawalError] = useState('');
  const [withdrawalLoading, setWithdrawalLoading] = useState(false);
  const navigate = useNavigate();

  // Check userCollectedReward and redirect to /reward自在
  useEffect(() => {
    const checkUserCollectedReward = async () => {
      if (user) {
        try {
          // Fetch user document to ensure latest userCollectedReward
          const userRef = doc(db, 'users', user.uid);
          const userSnap = await getDoc(userRef);
          const userData = userSnap.exists() ? userSnap.data() : {};
          console.log('Home userCollectedReward:', userData.userCollectedReward); // Debug
          if (userData.userCollectedReward === false) {
            navigate('/reward', { replace: true });
          }
        } catch (err) {
          console.error('Home fetch userCollectedReward error:', err);
        }
      }
    };
    checkUserCollectedReward();
  }, [user, navigate]);

  // Debug userData and selectedPlan
  console.log('Home userData:', userData);
  console.log('Home selectedPlan:', selectedPlan);

  // Get current time in EAT (UTC+3) and greeting with emoji
  const getGreeting = () => {
    const date = new Date();
    const hours = date.getUTCHours() + 3; // Adjust for EAT
    if (hours < 12) return { text: `Habari za Asubuhi, ${userData?.username || 'User'}!`, emoji: '☀️' };
    if (hours < 18) return { text: `Habari za Mchana, ${userData?.username || 'User'}!`, emoji: '🌞' };
    return { text: `Habari za Usiku, ${userData?.username || 'User'}!`, emoji: '🌙' };
  };

  const { text: greetingText, emoji } = getGreeting();

  const handlePlanSelect = (plan) => {
    setSelectedPlan(plan);
    console.log('Selected plan:', plan); // Debug
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
    console.log('Navigating to /deposit from /home');
    navigate('/deposit', { replace: true, state: { from: '/home' } });
  };

  return (
    <div className="min-h-screen bg-secondary font-roboto flex items-start justify-center px-4 pt-4">
      <div className="w-full max-w-md">
        <h2 className="text-031 font-bold text-primary mb-4">
          {greetingText} {emoji}
        </h2>
        <div className="bg-primary text-white p-4 rounded-lg shadow-inner space-y-2">
          <div className="flex items-center">
            <img
              src={surveyImage}
              alt="Survey"
              className="w-20 h-20 object-cover rounded-md mr-4"
            />
            <div className="flex flex-col flex-grow">
              <p className="text-lg font-roboto">
                You qualify for multiple surveys
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
        <div className="flex items-center justify-between mt-4">
          <p className="text-primary font-roboto text-lg">Available Surveys</p>
          <button
            className="bg-highlight text-white px-4 py-2 rounded hover:bg-accent font-roboto transition duration-300"
            onClick={() => setIsBottomSheetOpen(true)}
          >
            See All
          </button>
        </div>
        <div className="flex justify-between mt-4 space-x-2">
          {['free', 'standard', 'premium'].map((plan) => (
            <button
              key={plan}
              className={`flex-1 px-4 py-2 rounded font-roboto transition duration-300 flex items-center justify-center ${
                selectedPlan === plan
                  ? 'bg-primary text-white'
                  : 'bg-white text-primary border border-primary hover:bg-secondary'
              }`}
              onClick={() => handlePlanSelect(plan)}
            >
              {plan.charAt(0).toUpperCase() + plan.slice(1)}
              {selectedPlan === plan && <CheckCircleIcon className="h-5 w-5 inline-block ml-1" />}
            </button>
          ))}
        </div>
        <QuizCategories plan={selectedPlan} accessPlan={userData?.plan || 'free'} user={user} />
        <BottomSheet
          isOpen={isBottomSheetOpen}
          onClose={() => setIsBottomSheetOpen(false)}
          user={user}
          accessPlan={userData?.plan || 'free'}
        />
      </div>
    </div>
  );
};

export default Home;
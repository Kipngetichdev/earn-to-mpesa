import React, { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useNavigate } from 'react-router-dom';
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
import UpgradeAccount from './UpgradeAccount';

const QuizCategories = ({ plan, accessPlan, user }) => {
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
  console.log('QuizCategories props:', { plan, accessPlan, user });

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

  // Fetch categories based on selected plan
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

      // Process categories based on selected plan
      let selectedCategories = [];
      let metadata;

      if (plan === 'free') {
        metadata = getTierMetadata('free', freeCategories);
        selectedCategories = shuffleArray(freeCategories).map(category => ({
          ...category,
          duration: metadata.duration,
          reward: metadata.rewards[category.id] || `KSh 4.00`,
          tier: 'free',
        }));
      } else if (plan === 'standard') {
        metadata = getTierMetadata('standard', standardCategories);
        selectedCategories = shuffleArray(standardCategories).map(category => ({
          ...category,
          duration: metadata.duration,
          reward: metadata.rewards[category.id] || `KSh 80.00`,
          tier: 'standard',
        }));
      } else if (plan === 'premium') {
        metadata = getTierMetadata('premium', premiumCategories);
        selectedCategories = shuffleArray(premiumCategories).map(category => ({
          ...category,
          duration: metadata.duration,
          reward: metadata.rewards[category.id] || `KSh 200.00`,
          tier: 'premium',
        }));
      }

      setCategories(selectedCategories);
      console.log('QuizCategories fetched categories:', selectedCategories); // Debug
    } catch (err) {
      setError('Failed to fetch categories.');
      console.error('QuizCategories fetch categories error:', err);
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
          console.log('QuizCategories disabled categories:', disabled); // Debug
        }
      } catch (err) {
        console.error('QuizCategories fetch user history error:', err);
      }
    }
  };

  // Handle Start Survey button click
  const handleStartSurvey = (category) => {
    console.log('QuizCategories handleStartSurvey:', { effectivePlan, categoryTier: category.tier }); // Debug
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
      console.log('QuizCategories opening upgrade modal for tier:', category.tier); // Debug
    } else {
      setSelectedCategory(category);
      setShowModal(true);
      console.log('QuizCategories opening instruction modal for category:', category.name); // Debug
    }
  };

  // Handle Continue button in instruction modal
  const handleContinue = () => {
    if (selectedCategory) {
      localStorage.setItem(`${selectedCategory.id}_reward`, selectedCategory.reward);
      navigate(`/home/${selectedCategory.id}`);
      setShowModal(false);
      console.log('QuizCategories navigating to tasks:', selectedCategory.id); // Debug
    }
  };

  useEffect(() => {
    fetchCategories();
    if (user) {
      fetchUserHistory();
    }
  }, [plan, user]);

  return (
    <div className="mt-4">
      <h3 className="text-lg font-bold text-primary mb-2">Quiz Categories</h3>
      {loading ? (
        <p className="text-primary font-roboto">Loading categories...</p>
      ) : error ? (
        <p className="text-highlight font-roboto">{error}</p>
      ) : categories.length > 0 ? (
        <div className="mb-4 overflow-y-auto space-y-2">
          {categories.map((category) => {
            const Icon = iconMap[category.name] || UserGroupIcon;
            // Show lock icon if category is not accessible
            const showLockIcon =
              (effectivePlan === 'free' && (category.tier === 'standard' || category.tier === 'premium')) ||
              (effectivePlan === 'standard' && category.tier === 'premium');
            // Check if category is disabled
            const isDisabled = disabledCategories[category.id];
            console.log('QuizCategories Category:', category.name, 'Tier:', category.tier, 'Show lock:', showLockIcon, 'Disabled:', isDisabled); // Debug
            return (
              <div
                key={category.id}
                className="bg-white border border-primary rounded p-2 text-primary font-roboto hover:bg-secondary transition duration-300 flex items-center"
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
                  {isDisabled && (
                    <p className="text-sm text-gray-500 font-roboto mt-1">Available again in 5Mins</p>
                  )}
                </div>
              </div>
            );
          })}
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
                  console.log('QuizCategories instruction modal closed'); // Debug
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
          console.log('QuizCategories upgrade modal closed'); // Debug
        }}
        tier={selectedTier}
        user={user}
      />
    </div>
  );
};

export default QuizCategories;
import React, { useState, useEffect } from 'react';
import { db } from '../services/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import {
  PaintBrushIcon,
  FilmIcon,
  BookOpenIcon,
  TvIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';

const QuizCategories = ({ plan, user }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Map icons to Free tier categories (first 5 after sorting)
  const iconMap = {
    'Art': PaintBrushIcon,
    'Entertainment: Books': BookOpenIcon,
    'Entertainment: Cartoon & Animations': TvIcon,
    'Entertainment: Comics': BookOpenIcon,
    'Entertainment: Film': FilmIcon,
  };

  // Generate random duration (1.5 to 2 minutes)
  const getRandomDuration = () => {
    const duration = (Math.random() * (2 - 1.5) + 1.5).toFixed(1);
    return `${duration} min`;
  };

  // Generate random reward (KSh 4 to 8)
  const getRandomReward = () => {
    const reward = (Math.random() * (8 - 4) + 4).toFixed(2);
    return `KSh ${reward}`;
  };

  // Get or set fixed Duration and Reward for Free tier from localStorage
  const getFreeTierMetadata = () => {
    const stored = localStorage.getItem('freeTierMetadata');
    if (stored) {
      return JSON.parse(stored);
    }
    const metadata = {
      duration: getRandomDuration(),
      reward: getRandomReward(),
    };
    localStorage.setItem('freeTierMetadata', JSON.stringify(metadata));
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

  // Fetch categories and assign fixed sets per tier
  const fetchCategories = async (plan) => {
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
      
      let selectedCategories;
      if (plan === 'free') {
        const { duration, reward } = getFreeTierMetadata();
        selectedCategories = shuffleArray(freeCategories).map(category => ({
          ...category,
          duration,
          reward,
        }));
      } else if (plan === 'standard') {
        selectedCategories = shuffleArray(standardCategories);
      } else {
        selectedCategories = shuffleArray(premiumCategories);
      }
      
      setCategories(selectedCategories);
      
      // Update Firestore with selected plan
      if (user) {
        await updateDoc(doc(db, 'users', user.uid), { plan });
      }
    } catch (err) {
      setError('Failed to fetch categories.');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCategories(plan);
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
            const Icon = iconMap[category.name] || UserGroupIcon; // Fallback icon
            return plan === 'free' ? (
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
                    className="mt-2 bg-highlight text-white px-4 py-1 rounded hover:bg-accent font-roboto transition duration-300"
                    onClick={() => alert('Start Survey functionality coming soon!')}
                  >
                    Start Survey
                  </button>
                </div>
              </div>
            ) : (
              <div
                key={category.id}
                className="bg-white border border-primary rounded p-2 text-primary font-roboto hover:bg-secondary transition duration-300"
              >
                {category.name}
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-primary font-roboto">No categories available.</p>
      )}
    </div>
  );
};

export default QuizCategories;
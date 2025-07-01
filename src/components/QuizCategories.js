import React, { useState, useEffect } from 'react';
import { db } from '../services/firebase';
import { doc, updateDoc } from 'firebase/firestore';

const QuizCategories = ({ plan, user }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
      const premiumCategories = allCategories.slice(15, 35); // Next 5
      
      let selectedCategories;
      if (plan === 'free') {
        selectedCategories = shuffleArray(freeCategories);
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
          {categories.map((category) => (
            <div
              key={category.id}
              className="bg-white border border-primary rounded p-2 text-primary font-roboto hover:bg-secondary transition duration-300"
            >
              {category.name}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-primary font-roboto">No categories available.</p>
      )}
    </div>
  );
};

export default QuizCategories;
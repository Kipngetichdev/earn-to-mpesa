import React, { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { CheckCircleIcon } from '@heroicons/react/24/solid';
import QuizCategories from '../components/QuizCategories';
import surveyImage from '../assets/survey.png';

const Home = ({ earnings }) => {
  const { user, userData } = useContext(AuthContext);
  const [selectedPlan, setSelectedPlan] = useState(userData?.plan || 'free');

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
  };

  return (
    <div className="min-h-screen bg-secondary font-roboto flex items-start justify-center px-4 pt-4">
      <div className=" w-full max-w-md">
        <h2 className="text-2xl font-bold text-primary mb-4">
          {greetingText} {emoji}
        </h2>
        <div className="flex items-center bg-primary rounded-lg p-4 shadow-sm">
          <img
            src={surveyImage}
            alt="Survey"
            className="w-20 h-20 object-cover rounded-md mr-4"
          />
          <div className="flex flex-col flex-grow">
            <p className="text-white font-roboto text-lg">
              You qualify for multiple surveys
            </p>
            <div className="flex items-center mt-2">
              <p className="text-white font-roboto font-bold">
                Bal: KSh {earnings.toFixed(2)}
              </p>
            </div>
            <button
              className="mt-4 bg-highlight text-white px-4 py-2 rounded hover:bg-accent font-roboto transition duration-300"
              onClick={() => alert('Withdraw functionality coming soon!')}
            >
              Withdraw
            </button>
          </div>
        </div>
        <div className="flex items-center justify-between mt-4">
          <p className="text-primary font-roboto text-lg">Available Surveys</p>
          <button
            className="bg-highlight text-white px-4 py-2 rounded hover:bg-accent font-roboto transition duration-300"
            onClick={() => alert('See Progress functionality coming soon!')}
          >
            See All
          </button>
        </div>
        <div className="flex justify-between mt-4 space-x-2">
          <button
            className={`flex-1 px-4 py-2 rounded font-roboto transition duration-300 flex items-center justify-center ${
              selectedPlan === 'free' ? 'bg-primary text-white' : 'bg-white text-primary border border-primary hover:bg-secondary'
            }`}
            onClick={() => handlePlanSelect('free')}
          >
            Free {selectedPlan === 'free' && <CheckCircleIcon className="h-5 w-5 inline-block ml-1" />}
          </button>
          <button
            className={`flex-1 px-4 py-2 rounded font-roboto transition duration-300 flex items-center justify-center ${
              selectedPlan === 'standard' ? 'bg-primary text-white' : 'bg-white text-primary border border-primary hover:bg-secondary'
            }`}
            onClick={() => handlePlanSelect('standard')}
          >
            Standard {selectedPlan === 'standard' && <CheckCircleIcon className="h-5 w-5 inline-block ml-1" />}
          </button>
          <button
            className={`flex-1 px-4 py-2 rounded font-roboto transition duration-300 flex items-center justify-center ${
              selectedPlan === 'premium' ? 'bg-primary text-white' : 'bg-white text-primary border border-primary hover:bg-secondary'
            }`}
            onClick={() => handlePlanSelect('premium')}
          >
            Premium {selectedPlan === 'premium' && <CheckCircleIcon className="h-5 w-5 inline-block ml-1" />}
          </button>
        </div>
        <QuizCategories plan={selectedPlan} user={user} />
      </div>
    </div>
  );
};

export default Home;
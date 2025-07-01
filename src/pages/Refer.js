import React from 'react';
import ReferAndEarn from '../components/ReferAndEarn';

const Refer = ({ completeTask }) => {
  return (
    <div className="min-h-screen bg-secondary font-roboto flex items-center justify-center px-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-xl font-bold font-roboto text-primary">Refer & Earn</h2>
        <ReferAndEarn completeTask={completeTask} />
      </div>
    </div>
  );
};

export default Refer;
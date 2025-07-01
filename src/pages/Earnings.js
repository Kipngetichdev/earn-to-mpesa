import React from 'react';

const Earnings = ({ history }) => {
  return (
    <div className="min-h-screen bg-secondary font-roboto flex items-center justify-center px-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-xl font-bold font-roboto text-primary">Earnings History</h2>
        {history.length === 0 ? (
          <p className="font-roboto text-primary mt-2">No earnings yet.</p>
        ) : (
          <ul className="space-y-2 mt-2">
            {history.map((entry, index) => (
              <li key={index} className="bg-secondary p-2 rounded shadow font-roboto text-primary">
                {entry.task}: KSh {entry.reward} ({entry.date})
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Earnings;
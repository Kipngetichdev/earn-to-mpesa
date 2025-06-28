import React from 'react';

const Earnings = ({ history }) => {
  return (
    <div>
      <h2 className="text-xl font-bold font-roboto text-primary">Earnings History</h2>
      {history.length === 0 ? (
        <p className="font-roboto text-primary">No earnings yet.</p>
      ) : (
        <ul className="space-y-2">
          {history.map((entry, index) => (
            <li key={index} className="bg-secondary p-2 rounded shadow font-roboto text-primary">
              {entry.task}: KSh {entry.reward} ({entry.date})
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Earnings;
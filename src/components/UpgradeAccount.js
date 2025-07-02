import React from 'react';
import { LockClosedIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';

const UpgradeAccount = ({ isOpen, onClose, tier }) => {
  const navigate = useNavigate();
  const message = tier === 'standard' 
    ? 'one-time fee KSh 150. No additional charges.'
    : 'one-time fee KSh 200. No additional charges.';

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 text-center">
        <LockClosedIcon className="h-6 w-6 text-primary mx-auto mb-4" />
        <h2 className="text-lg font-bold text-primary font-roboto mb-4">
          Access denied
        </h2>
        <p className="text-primary font-roboto mb-6">
          Upgrade account to {tier.charAt(0).toUpperCase() + tier.slice(1)} for a {message}
        </p>
        <div className="flex justify-center gap-4">
          <button
            className="bg-highlight text-white px-4 py-2 rounded hover:bg-accent font-roboto transition duration-300"
            onClick={() => navigate('/upgrade')}
          >
            Upgrade Now
          </button>
          <button
            className="bg-white border border-primary text-primary px-4 py-2 rounded hover:bg-secondary font-roboto transition duration-300"
            onClick={onClose}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpgradeAccount;
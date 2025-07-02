import React, { useState, useEffect } from 'react';
import { LockClosedIcon, PencilIcon, CheckIcon } from '@heroicons/react/24/outline';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../services/firebase';

const UpgradeAccount = ({ isOpen, onClose, tier, user }) => {
  const [showInput, setShowInput] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isPhoneValid, setIsPhoneValid] = useState(false);
  const [error, setError] = useState('');

  const fee = tier === 'standard' ? 150 : 200;
  const message = `one-time fee KSh ${fee}. No additional charges.`;

  // Validate Kenyan phone number: +254[0-9]{9}, 07[0-9]{8}, or 01[0-9]{8}
  const validatePhoneNumber = (phone) => {
    const regex = /^(?:\+254[0-9]{9}|07[0-9]{8}|01[0-9]{8})$/;
    return regex.test(phone);
  };

  // Normalize phone number to +254 format
  const normalizePhoneNumber = (phone) => {
    if (!phone) return phone;
    if (phone.startsWith('+254')) return phone;
    if (phone.startsWith('07') || phone.startsWith('01')) {
      return `+254${phone.slice(1)}`;
    }
    return phone;
  };

  // Fetch user phone number from Firestore
  useEffect(() => {
    const fetchPhoneNumber = async () => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const phone = userDoc.data().phone || '';
            const normalizedPhone = normalizePhoneNumber(phone);
            setPhoneNumber(normalizedPhone);
            setIsPhoneValid(validatePhoneNumber(phone));
            console.log('Fetched phone number:', phone, 'Normalized:', normalizedPhone); // Debug
          } else {
            setError('User data not found.');
            console.error('User doc not found for UID:', user.uid);
          }
        } catch (err) {
          setError('Failed to fetch phone number.');
          console.error('Fetch phone number error:', err);
        }
      }
    };
    if (isOpen) {
      fetchPhoneNumber();
    }
  }, [isOpen, user]);

  // Handle phone number change
  const handlePhoneChange = (e) => {
    const phone = e.target.value;
    const normalizedPhone = normalizePhoneNumber(phone);
    setPhoneNumber(phone); // Display raw input
    setIsPhoneValid(validatePhoneNumber(phone));
    console.log('Phone number updated:', phone, 'Normalized:', normalizedPhone, 'Valid:', validatePhoneNumber(phone)); // Debug
  };

  // Handle Save button click
  const handleSavePhone = async () => {
    if (isPhoneValid) {
      const normalizedPhone = normalizePhoneNumber(phoneNumber);
      try {
        await updateDoc(doc(db, 'users', user.uid), { phone: normalizedPhone });
        setPhoneNumber(normalizedPhone); // Update UI to show normalized format
        setIsEditing(false);
        setError('');
        console.log('Phone number saved to Firestore:', normalizedPhone); // Debug
      } catch (err) {
        setError('Failed to save phone number.');
        console.error('Save phone number error:', err);
      }
    } else {
      setError('Please enter a valid Kenyan phone number (+254123456789, 0712345678, or 0112345678).');
    }
  };

  // Handle Upgrade/Pay button click
  const handleUpgrade = async () => {
    if (!showInput) {
      setShowInput(true);
      console.log('Showing payment input'); // Debug
      return;
    }
    if (isPhoneValid) {
      try {
        await updateDoc(doc(db, 'users', user.uid), { plan: tier });
        console.log('User plan updated to:', tier); // Debug
        onClose(); // Close modal after successful update
      } catch (err) {
        setError('Failed to upgrade plan.');
        console.error('Upgrade plan error:', err);
      }
    } else {
      setError('Please enter a valid Kenyan phone number (+254123456789, 0712345678, or 0112345678).');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 text-center">
        <LockClosedIcon className="h-6 w-6 text-primary mx-auto mb-4" />
        <h2 className="text-lg font-bold text-primary font-roboto mb-4">
          Access denied
        </h2>
        <p className="text-primary font-roboto mb-4">
          Upgrade account to {tier.charAt(0).toUpperCase() + tier.slice(1)} for a {message}
        </p>
        {showInput && (
          <div className="mb-4">
            <label className="block text-primary font-roboto text-sm mb-2" htmlFor="phoneNumber">
              Payment Number
            </label>
            <div className="flex items-center justify-center gap-2">
              <input
                id="phoneNumber"
                type="text"
                value={phoneNumber}
                onChange={handlePhoneChange}
                disabled={!isEditing}
                className={`w-3/4 px-3 py-2 border rounded font-roboto text-primary ${
                  isPhoneValid ? 'border-primary' : 'border-highlight'
                } ${isEditing ? 'bg-white' : 'bg-gray-100'}`}
                placeholder="+254123456789 or 0712345678"
              />
              {isEditing ? (
                <button
                  onClick={handleSavePhone}
                  className="bg-highlight text-white p-2 rounded hover:bg-accent transition duration-300"
                >
                  <CheckIcon className="h-5 w-5" />
                </button>
              ) : (
                <button
                  onClick={() => {
                    setIsEditing(true);
                    console.log('Editing phone number'); // Debug
                  }}
                  className="bg-primary text-white p-2 rounded hover:bg-accent transition duration-300"
                >
                  <PencilIcon className="h-5 w-5" />
                </button>
              )}
            </div>
            {error && (
              <p className="text-highlight font-roboto text-sm mt-2">{error}</p>
            )}
          </div>
        )}
        <div className="flex justify-center gap-4">
          <button
            className="bg-highlight text-white px-4 py-2 rounded hover:bg-accent font-roboto transition duration-300"
            onClick={handleUpgrade}
          >
            {showInput && isPhoneValid ? `Pay KSh ${fee} Now` : 'Upgrade Now'}
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
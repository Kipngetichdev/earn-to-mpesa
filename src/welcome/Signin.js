import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png';

const Signin = ({ setIsAuthenticated }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ identifier: '', password: '' });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (
      !formData.identifier.match(/^[a-zA-Z0-9]{3,20}$/) &&
      !formData.identifier.match(/^\+?\d{10,12}$/)
    ) {
      newErrors.identifier =
        'Enter a valid username (3-20 alphanumeric characters) or phone number (e.g., +254123456789)';
    }
    if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      console.log('Signin:', formData);
      setIsAuthenticated(true);
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-secondary font-roboto flex items-center justify-center ">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <img src={logo} alt="Earn to M-Pesa Logo" className="w-24 h-24 mx-auto mb-4" />
        <p className="text-lg text-primary text-center font-roboto mb-4">
          Sign In to Continue Earning!
        </p>
        <h2 className="text-2xl font-bold text-primary text-center font-roboto">Sign In</h2>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-primary font-roboto">Username or M-Pesa Phone Number</label>
            <input
              type="text"
              name="identifier"
              value={formData.identifier}
              onChange={handleChange}
              className={`w-full p-2 border ${errors.identifier ? 'border-red-500' : 'border-primary'} rounded font-roboto text-primary`}
              required
            />
            {errors.identifier && <p className="text-red-500 text-sm mt-1">{errors.identifier}</p>}
          </div>
          <div>
            <label className="block text-primary font-roboto">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={`w-full p-2 border ${errors.password ? 'border-red-500' : 'border-primary'} rounded font-roboto text-primary`}
              required
            />
            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
          </div>
          <button
            type="submit"
            className="w-full bg-highlight text-white px-4 py-2 rounded hover:bg-accent font-roboto transition duration-300"
          >
            Sign In
          </button>
        </form>
        <p className="mt-4 text-center text-primary font-roboto">
          Don't have an account?{' '}
          <button
            className="text-highlight hover:underline"
            onClick={() => navigate('/signup')}
          >
            Sign Up
          </button>
        </p>
      </div>
    </div>
  );
};

export default Signin;
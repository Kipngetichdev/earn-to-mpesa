import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png';

const Signup = ({ setIsAuthenticated }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ username: '', email: '', password: '', phone: '' });
  const [errors, setErrors] = useState({});


  const validate = () => {
    const newErrors = {};
    if (!formData.username.match(/^[a-zA-Z0-9]{3,20}$/)) {
      newErrors.username = 'Username must be 3-20 characters, alphanumeric only';
    }
    if (!formData.email.match(/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/)) {
      newErrors.email = 'Invalid email format';
    }
    if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    if (!formData.phone.match(/^\+?\d{10,12}$/)) {
      newErrors.phone = 'Invalid phone number (e.g., +254123456789)';
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
      console.log('Signup:', formData);
      setIsAuthenticated(true);
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-secondary font-roboto flex items-center justify-center ">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <img
          src={logo}
          alt="Earn to M-Pesa Logo"
          className="w-24 h-24 mx-auto mb-4 "
        />
        <p className="text-lg text-primary text-center font-roboto mb-4">
          Create Your Account to Start Earning!
        </p>
        <h2 className="text-2xl font-bold text-primary text-center font-roboto">Sign Up</h2>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-primary font-roboto">Username</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className={`w-full p-2 border ${errors.username ? 'border-red-500' : 'border-primary'} rounded font-roboto text-primary`}
              required
            />
            {errors.username && <p className="text-red-500 text-sm mt-1">{errors.username}</p>}
          </div>
          <div>
            <label className="block text-primary font-roboto">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full p-2 border ${errors.email ? 'border-red-500' : 'border-primary'} rounded font-roboto text-primary`}
              required
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
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
          <div>
            <label className="block text-primary font-roboto">M-Pesa Phone Number</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className={`w-full p-2 border ${errors.phone ? 'border-red-500' : 'border-primary'} rounded font-roboto text-primary`}
              required
            />
            {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
          </div>
          <button
            type="submit"
            className="w-full bg-highlight text-white px-4 py-2 rounded hover:bg-accent font-roboto transition duration-300"
          >
            Sign Up
          </button>
        </form>
        <p className="mt-4 text-center text-primary font-roboto">
          Already have an account?{' '}
          <button
            className="text-highlight hover:underline"
            onClick={() => navigate('/signin')}
          >
            Sign In
          </button>
        </p>
      </div>
    </div>
  );
};

export default Signup;
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Signup = ({ setIsAuthenticated }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '', phone: '' });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Mock signup logic
    console.log('Signup:', formData);
    setIsAuthenticated(true);
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-secondary font-roboto flex items-center justify-center py-12 px-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold text-primary text-center font-roboto">Sign Up</h2>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-primary font-roboto">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full p-2 border border-primary rounded font-roboto text-primary"
              required
            />
          </div>
          <div>
            <label className="block text-primary font-roboto">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full p-2 border border-primary rounded font-roboto text-primary"
              required
            />
          </div>
          <div>
            <label className="block text-primary font-roboto">M-Pesa Phone Number</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full p-2 border border-primary rounded font-roboto text-primary"
              required
            />
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

import React from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png'; // Placeholder; replace with actual logo

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-secondary font-roboto">
      {/* Hero Section */}
      <section className="bg-primary text-white text-center py-16 px-4">
        <img src={logo} alt="Earn to M-Pesa Logo" className="w-24 h-24 mx-auto mb-4" />
        <h1 className="text-4xl font-bold font-roboto md:text-5xl">Welcome to Earn to M-Pesa</h1>
        <p className="text-lg mt-4 font-roboto md:text-xl">
          Earn up to <span className="text-highlight">KSh 3000</span> from home with simple tasks!
        </p>
        <div className="mt-6 space-x-4">
          <button
            className="bg-highlight text-white px-6 py-3 rounded-full font-roboto hover:bg-accent transition duration-300"
            onClick={() => navigate('/signup')}
          >
            Get Started
          </button>
          <button
            className="bg-accent text-white px-6 py-3 rounded-full font-roboto hover:bg-primary transition duration-300"
            onClick={() => navigate('/signin')}
          >
            Sign In
          </button>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 px-4">
        <h2 className="text-2xl font-bold text-primary text-center font-roboto md:text-3xl">How It Works</h2>
        <div className="grid grid-cols-1 gap-6 mt-8 md:grid-cols-2 lg:grid-cols-4">
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <div className="text-4xl mb-4">📋</div>
            <h3 className="text-xl font-bold text-primary font-roboto">Complete Surveys</h3>
            <p className="text-primary font-roboto mt-2">Answer simple questions and earn up to KSh 150.</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <div className="text-4xl mb-4">🎥</div>
            <h3 className="text-xl font-bold text-primary font-roboto">Watch Videos</h3>
            <p className="text-primary font-roboto mt-2">Watch short videos and earn up to KSh 250.</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <div className="text-4xl mb-4">🎰</div>
            <h3 className="text-xl font-bold text-primary font-roboto">Spin to Win</h3>
            <p className="text-primary font-roboto mt-2">Spin the wheel for a chance to win KSh 200!</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <div className="text-4xl mb-4">🤝</div>
            <h3 className="text-xl font-bold text-primary font-roboto">Refer & Earn</h3>
            <p className="text-primary font-roboto mt-2">Invite friends and earn KSh 50 per referral.</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-accent text-white text-center py-10 px-4">
        <h2 className="text-2xl font-bold font-roboto md:text-3xl">Start Earning Today!</h2>
        <p className="text-lg mt-4 font-roboto">Join thousands of users earning with M-Pesa withdrawals.</p>
        <button
          className="bg-highlight text-white px-6 py-3 mt-6 rounded-full font-roboto hover:bg-primary transition duration-300"
          onClick={() => navigate('/signup')}
        >
          Join Now
        </button>
      </section>

      {/* Footer */}
      <footer className="bg-primary text-white text-center py-6">
        <p className="font-roboto">© 2025 Earn to M-Pesa. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Landing;
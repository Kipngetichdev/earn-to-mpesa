import React from 'react';

const Home = ({ earnings }) => {
  return (
    <div>
      <h2 className="text-xl font-bold font-roboto text-primary">Welcome!</h2>
      <p className="font-roboto text-primary">Earn up to KSh 3000 from home with simple tasks!</p>
      <p className="font-roboto text-primary">Current Balance: KSh {earnings}</p>
    </div>
  );
};

export default Home;
import React from 'react';
import ReferAndEarn from '../components/ReferAndEarn';

const Refer = ({ completeTask }) => {
  return (
    <div>
      <ReferAndEarn completeTask={completeTask} />
    </div>
  );
};

export default Refer;
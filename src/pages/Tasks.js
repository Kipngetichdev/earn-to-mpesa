import React from 'react';
import SurveyTask from '../components/SurveyTask';
import VideoTask from '../components/VideoTask';
import SpinToWin from '../components/SpinToWin';

const Tasks = ({ completeTask }) => {
  return (
    <div className="space-y-6">
      <SurveyTask completeTask={completeTask} />
      <VideoTask completeTask={completeTask} />
      <SpinToWin completeTask={completeTask} />
    </div>
  );
};

export default Tasks;
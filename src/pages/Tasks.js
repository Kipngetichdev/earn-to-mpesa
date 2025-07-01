import React from 'react';
import SurveyTask from '../components/SurveyTask';
import VideoTask from '../components/VideoTask';
import SpinToWin from '../components/SpinToWin';

const Tasks = ({ completeTask }) => {
  return (
    <div className="min-h-screen bg-secondary font-roboto flex items-center justify-center px-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md space-y-6">
        <h2 className="text-xl font-bold font-roboto text-primary">Tasks</h2>
        <SurveyTask completeTask={completeTask} />
        <VideoTask completeTask={completeTask} />
        <SpinToWin completeTask={completeTask} />
      </div>
    </div>
  );
};

export default Tasks;
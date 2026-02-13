import React from 'react';
import ActiveProjects from './ActiveProjects';
import BlockedTasks from './BlockedTasks';
import DaysRemaining from './DaysRemaining';
import OverdueTasks from './OverdueTasks';
import PhaseStatus from './PhaseStatus';
import SprintOverview from './SprintOverview';
import SprintVelocity from './SprintVelocity';
import TaskProgress from './TaskProgress';

const DashboardCards = () => {
  return (
    <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      <PhaseStatus />
      <DaysRemaining />
      <TaskProgress />
      <ActiveProjects />
      <SprintOverview />
      <SprintVelocity />
      <OverdueTasks />
      <BlockedTasks />
    </div>
  );
};

export default DashboardCards;

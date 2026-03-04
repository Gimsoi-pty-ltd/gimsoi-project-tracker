import Cards from "../Common/Cards"
import BlockedTasks from "./BlockedTasks";
import ActiveProjects from "./ActiveProjects";
import TaskProgress from "./TaskProgress";
import SprintOverview from "./SprintOverview";
import OverdueTasks from "./OverdueTasks";
import DaysRemaining from "./DaysRemaining";
import PhaseStatus from "./PhaseStatus";
import SprintVelocity from "./SprintVelocity";

const DashboardCards = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-2 items-start">

      <ActiveProjects />

      <TaskProgress />
      <DaysRemaining />
      <OverdueTasks />




      <div className="lg:row-span-2">
        <BlockedTasks />
      </div>



      <SprintVelocity />
      <SprintOverview />
      <PhaseStatus />


    </div>
  );
};

export default DashboardCards;

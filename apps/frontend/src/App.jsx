import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// ─── AUTH PAGES ─────────────────────────────
import LoginPage from './Pages/LogInOut flow/LoginPage';
import SignUpPage from './Pages/LogInOut flow/SignUpPage';
import ResetPassword from './Pages/LogInOut flow/ResetPassword';
import EmailVerification from './Pages/LogInOut flow/EmailVerification';
import ForgotEmailPage from './Pages/LogInOut flow/ForgotEmailPage';
import GimsoiSignOut from './Pages/LogInOut flow/Logout';

// ─── DASHBOARD LAYOUT & PAGES  ─────────────────────────────
import DashboardLayout from "./Layouts/DashboardLayout";

// Dashboard & Overview
import Dashboard from './Pages/LoginOut Flow/Dashboard';
import DashboardCards from "./Components/Dashboard/DashboardCards";
import DaysRemainingPage from "./Components/Dashboard/DaysRemainingPage";
import SprintOverview from './Pages/Sprints/SprintOverview';
import SprintVelocityPage from './Pages/Sprints/SprintVelocity';

// Tasks
import TasksPage from './Pages/Tasks/TasksPage';
import BlockedTasks from './Pages/Tasks/blockedTasks';
import OverdueTasks from './Pages/Tasks/Overduetasks';
import ActiveProjects from './Pages/Tasks/ActiveProjects';

// Projects & Phases
import Projects from './Pages/Project Management/projects';
import ProjectPhasesGantt from "./Pages/Phases/Phases-of-tasks.jsx";

// Reports
import ReportsHub from './Pages/Reports and Exporting/reports';
import SprintReports from './Pages/Reports and Exporting/sprintReports';
import ProjectReport from './Pages/Reports and Exporting/projectReports';
import TeamPerformance from './Pages/Reports and Exporting/teamPerformance';

// Team & Insights
import TeamInsights from './Pages/Team Insights/teamInsights';

// Calendar & Documents
import Calendar from './Pages/Calendar/Calendar';
import Documents from './Pages/Documents/Documents';

// Profile & Search
import ProjectTrackerProfilePage from './Pages/Profile/Profile';
import SearchPage from './Pages/Profile/Search';

// Settings
import Settings from './Pages/Settings';
import ProfileSection from './Pages/Settings Page/ProfileSection';
import PreferencesSection from './Pages/Settings Page/PreferencesSection';
import ActivitySection from './Pages/Settings Page/ActivitySection';
import StorageSection from './Pages/Settings Page/StorageSection';
import SecuritySection from './Pages/Settings Page/SecuritySection';

// Help
import HelpSupport from './Pages/Help/HelpSupport';

// User Management
import Usermanagement from "./Pages/Users/UserManagementPage";
import Users from "./Pages/Users/Users";
import Teams from "./Pages/Users/Teams";
import Clients from "./Pages/Users/Clients";

// Kanban Board
import Kanban from "./Pages/KanbanBoard/KanbanBoard";

import { useAuthStore } from "./store/authStore";

// ─── Auth Guard Components  ─────────────────────────────
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to='/login' replace />;
  }

  if (!user?.isVerified) {
    return <Navigate to='/verify-email' replace />;
  }

  return children;
};

const RedirectAuthenticatedUser = ({ children }) => {
  const { isAuthenticated, user } = useAuthStore();

  if (isAuthenticated && user?.isVerified) {
    return <Navigate to='/dashboard' replace />;
  }

  return children;
};

// ─── Main App Component ─────────────────────────────
function App() {
  const { isCheckingAuth, checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (isCheckingAuth) return <div className="loading">Loading...</div>;

  return (
    <Router>
      <Routes>
        {/* === AUTH ROUTES  === */}
        <Route path="/login" element={
          <RedirectAuthenticatedUser>
            <LoginPage />
          </RedirectAuthenticatedUser>
        } />
        
        <Route path="/signup" element={
          <RedirectAuthenticatedUser>
            <SignUpPage />
          </RedirectAuthenticatedUser>
        } />
        
        <Route path="/verify-email" element={<EmailVerification />} />
        
        <Route path="/forgot-password" element={
          <RedirectAuthenticatedUser>
            <ForgotEmailPage />
          </RedirectAuthenticatedUser>
        } />
        
        <Route path="/reset-password/:token" element={
          <RedirectAuthenticatedUser>
            <ResetPassword />
          </RedirectAuthenticatedUser>
        } />

        <Route path="/logout" element={
          <GimsoiSignOut />
        } 
        />

        {/* === ROOT REDIRECT  === */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* === DASHBOARD ROUTES  === */}
        
        {/* Dashboard & Overview */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <DashboardLayout><Dashboard /></DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/dashboard/cards" element={
          <ProtectedRoute>
            <DashboardLayout><DashboardCards /></DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/days-remaining" element={
          <ProtectedRoute>
            <DashboardLayout><DaysRemainingPage /></DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/sprint-overview" element={
          <ProtectedRoute>
            <DashboardLayout><SprintOverview /></DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/sprint-velocity" element={
          <ProtectedRoute>
            <DashboardLayout><SprintVelocityPage /></DashboardLayout>
          </ProtectedRoute>
        } />

        {/* Tasks Group */}
        <Route path="/tasks" element={
          <ProtectedRoute>
            <DashboardLayout><TasksPage /></DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/tasks/blocked" element={
          <ProtectedRoute>
            <DashboardLayout><BlockedTasks /></DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/tasks/overdue" element={
          <ProtectedRoute>
            <DashboardLayout><OverdueTasks /></DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/tasks/active-projects" element={
          <ProtectedRoute>
            <DashboardLayout><ActiveProjects /></DashboardLayout>
          </ProtectedRoute>
        } />

        {/* Projects & Phases */}
        <Route path="/projects" element={
          <ProtectedRoute>
            <DashboardLayout><Projects /></DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/phases" element={
          <ProtectedRoute>
            <DashboardLayout><ProjectPhasesGantt /></DashboardLayout>
          </ProtectedRoute>
        } />

        {/* Reports Group */}
        <Route path="/reports" element={
          <ProtectedRoute>
            <DashboardLayout><ReportsHub /></DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/reports/sprint-report" element={
          <ProtectedRoute>
            <DashboardLayout><SprintReports /></DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/reports/project-report" element={
          <ProtectedRoute>
            <DashboardLayout><ProjectReport /></DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/reports/team-performance" element={
          <ProtectedRoute>
            <DashboardLayout><TeamPerformance /></DashboardLayout>
          </ProtectedRoute>
        } />

        {/* Team Insights */}
        <Route path="/teamInsights" element={
          <ProtectedRoute>
            <DashboardLayout><TeamInsights /></DashboardLayout>
          </ProtectedRoute>
        } />

        {/* Calendar & Documents */}
        <Route path="/calendar" element={
          <ProtectedRoute>
            <DashboardLayout><Calendar /></DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/documents" element={
          <ProtectedRoute>
            <DashboardLayout><Documents /></DashboardLayout>
          </ProtectedRoute>
        } />

        {/* Profile & Search */}
        <Route path="/profile" element={
          <ProtectedRoute>
            <DashboardLayout><ProjectTrackerProfilePage /></DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/search" element={
          <ProtectedRoute>
            <DashboardLayout><SearchPage /></DashboardLayout>
          </ProtectedRoute>
        } />

        {/* Settings Group */}
        <Route path="/settings" element={
          <ProtectedRoute>
            <DashboardLayout><Settings /></DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/settings/profile" element={
          <ProtectedRoute>
            <DashboardLayout><ProfileSection /></DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/settings/preferences" element={
          <ProtectedRoute>
            <DashboardLayout><PreferencesSection /></DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/settings/activity" element={
          <ProtectedRoute>
            <DashboardLayout><ActivitySection /></DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/settings/storage" element={
          <ProtectedRoute>
            <DashboardLayout><StorageSection /></DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/settings/security" element={
          <ProtectedRoute>
            <DashboardLayout><SecuritySection /></DashboardLayout>
          </ProtectedRoute>
        } />

        {/* Help */}
        <Route path="/help" element={
          <ProtectedRoute>
            <DashboardLayout><HelpSupport /></DashboardLayout>
          </ProtectedRoute>
        } />

        {/* User Management */}
        <Route path="/users" element= {
          <ProtectedRoute>
            <DashboardLayout><Usermanagement /></DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/clients" element= {
          <ProtectedRoute>
            <DashboardLayout><Clients /></DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/teams" element= {
          <ProtectedRoute>
            <DashboardLayout><Teams /></DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/users-list" element= {
          <ProtectedRoute>
            <DashboardLayout><Users /></DashboardLayout>
          </ProtectedRoute>
        } />

        {/* Kanban Board */}
        <Route path="/kanban-board" element={
          <ProtectedRoute>
            <DashboardLayout><Kanban /></DashboardLayout>
          </ProtectedRoute>
        } />

        {/* === CATCH-ALL: Redirect to login when unauthenticated === */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
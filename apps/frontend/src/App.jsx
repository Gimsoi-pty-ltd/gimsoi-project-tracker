import React, { useEffect, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// ─── AUTH PAGES ─────────────────────────────
const LoginPage = lazy(() => import('./Pages/LogInOut-flow/LoginPage'));
const SignUpPage = lazy(() => import('./Pages/LogInOut-flow/SignUpPage'));
const ResetPassword = lazy(() => import('./Pages/LogInOut-flow/ResetPassword'));
const EmailVerification = lazy(() => import('./Pages/LogInOut-flow/EmailVerification'));
const ForgotEmailPage = lazy(() => import('./Pages/LogInOut-flow/ForgotEmailPage'));

// ─── DASHBOARD LAYOUT & PAGES  ─────────────────────────────
import DashboardLayout from "./Layouts/DashboardLayout";

// Dashboard & Overview
const Dashboard = lazy(() => import('./Pages/LogInOut-flow/Dashboard'));
const DashboardCards = lazy(() => import("./Components/Dashboard/DashboardCards"));
const DaysRemainingPage = lazy(() => import("./Components/Dashboard/DaysRemainingPage"));
const SprintOverview = lazy(() => import('./Pages/Sprints/SprintOverview'));
const SprintVelocityPage = lazy(() => import('./Pages/Sprints/SprintVelocity'));

// Tasks
const TasksPage = lazy(() => import('./Pages/Tasks/TasksPage'));
const BlockedTasks = lazy(() => import('./Pages/Tasks/BlockedTasks'));
const OverdueTasks = lazy(() => import('./Pages/Tasks/OverdueTasks'));
const ActiveProjects = lazy(() => import('./Pages/Tasks/ActiveProjects'));

// Projects & Phases
const Projects = lazy(() => import('./Pages/Project-Management/projects'));
const ProjectOverview = lazy(() => import('./Pages/Project-Management/projectOverview'));
const ProjectPhasesGantt = lazy(() => import("./Pages/Phases/Phases-of-tasks.jsx"));

// Reports
const ReportsHub = lazy(() => import('./Pages/Reports-and-Exporting/reports'));
const SprintReports = lazy(() => import('./Pages/Reports-and-Exporting/sprintReports'));
const ProjectReport = lazy(() => import('./Pages/Reports-and-Exporting/projectReports'));
const TeamPerformance = lazy(() => import('./Pages/Reports-and-Exporting/teamPerformance'));

// Team & Insights
const TeamInsights = lazy(() => import('./Pages/Team-Insights/TeamInsights'));

// Calendar & Documents
const Calendar = lazy(() => import('./Pages/Calendar/Calendar'));
const Documents = lazy(() => import('./Pages/Documents/Documents'));

// Profile & Search
const ProjectTrackerProfilePage = lazy(() => import('./Pages/Profile/Profile'));
const SearchPage = lazy(() => import('./Pages/Profile/Search'));

// Settings
const Settings = lazy(() => import('./Pages/Settings'));
const ProfileSection = lazy(() => import('./Pages/Settings-Page/ProfileSection'));
const PreferencesSection = lazy(() => import('./Pages/Settings-Page/PreferencesSection'));
const ActivitySection = lazy(() => import('./Pages/Settings-Page/ActivitySection'));
const StorageSection = lazy(() => import('./Pages/Settings-Page/StorageSection'));
const SecuritySection = lazy(() => import('./Pages/Settings-Page/SecuritySection'));

// Help
const HelpSupport = lazy(() => import('./Pages/Help/HelpSupport'));

// User Management
const Usermanagement = lazy(() => import("./Pages/Users/UserManagementPage"));
const Users = lazy(() => import("./Pages/Users/Users"));
const Teams = lazy(() => import("./Pages/Users/Teams"));
const Clients = lazy(() => import("./Pages/Users/Clients"));

// Kanban Board
const Kanban = lazy(() => import("./Pages/KanbanBoard/KanbanBoard"));

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
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Suspense fallback={<div className="min-h-screen grid place-items-center text-slate-600">Loading...</div>}>
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

        {/* === ROOT REDIRECT  === */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* === DASHBOARD ROUTES  === */}

        {/* Dashboard & Overview */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <DashboardLayout><Dashboard /></DashboardLayout>
          </ProtectedRoute>
        } />

        {/* Tasks Group */}
        <Route path="/tasks" element={
          <ProtectedRoute>
            <DashboardLayout><TasksPage /></DashboardLayout>
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
        <Route path="/projects/:id" element={
          <ProtectedRoute>
            <DashboardLayout><ProjectOverview /></DashboardLayout>
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

        {/* Team-Insights */}
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
        <Route path="/users" element={
          <ProtectedRoute>
            <DashboardLayout><Usermanagement /></DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/clients" element={
          <ProtectedRoute>
            <DashboardLayout><Clients /></DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/teams" element={
          <ProtectedRoute>
            <DashboardLayout><Teams /></DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/users-list" element={
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
    </Suspense>
    </Router>
  );
}

export default App;
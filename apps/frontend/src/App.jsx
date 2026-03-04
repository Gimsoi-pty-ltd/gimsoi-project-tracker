import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';

// ─── AUTH PAGES ─────────────────────────────
import LoginPage from './Pages/LogInOut flow/LoginPage';
import SignUpPage from './Pages/LogInOut flow/SignUpPage';
import ResetPassword from './Pages/LogInOut flow/ResetPassword';
import EmailVerification from './Pages/LogInOut flow/EmailVerification';
import ForgotEmailPage from './Pages/LogInOut flow/ForgotEmailPage';

// ─── DASHBOARD PAGES  ─────────────────────────────
import DashboardLayout from "./Layouts/DashboardLayout";
import Dashboard from './Pages/LoginOut Flow/Dashboard';
import DashboardCards from "./Components/Dashboard/DashboardCards";
import ReportsHub from './Pages/Reports and Exporting/reports';
import SprintReports from './Pages/Reports and Exporting/sprintReports';
import ProjectReport from './Pages/Reports and Exporting/projectReports';
import TeamPerformance from './Pages/Reports and Exporting/teamPerformance';
import Calendar from './Pages/Calendar/Calendar';
import Documents from './Pages/Documents/Documents';
import HelpSupport from './Pages/Help/HelpSupport';

import { useAuthStore } from "./store/authStore";

// ─── Auth Guard Components — RESTORED ─────────────────────────────
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

                {/* === DASHBOARD ROUTES  === */}
                
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
                
                <Route path="/help" element={
                    <ProtectedRoute>
                        <DashboardLayout><HelpSupport /></DashboardLayout>
                    </ProtectedRoute>
                } />

                {/* === ROOT & CATCH-ALL — RESTORED === */}
                <Route path="/" element={<Navigate to="/login" replace />} />
                <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
        </Router>
    );
}

export default App;
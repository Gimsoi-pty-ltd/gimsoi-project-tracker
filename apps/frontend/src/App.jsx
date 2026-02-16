import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './Pages/LoginPage';
import SignUpPage from './Pages/SignUpPage';
import Dashboard from './Pages/Dashboard';
import ResetPassword from './Pages/ResetPassword';
import EmailVerification from './Pages/EmailVerification';
import ForgotEmailPage from './Pages/ForgotEmailPage';

import { useEffect } from "react";
import { useAuthStore } from "./store/authStore";

// protect routes that require authentication
const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, user } = useAuthStore();

    if (!isAuthenticated) {
        return <Navigate to='/login' replace />;
    }

    if (!user.isVerified) {
        return <Navigate to='/verify-email' replace />;
    }

    return children;
};

// redirect authenticated users to the home page
const RedirectAuthenticatedUser = ({ children }) => {
    const { isAuthenticated, user } = useAuthStore();

    if (isAuthenticated && user.isVerified) {
        return <Navigate to='/' replace />;
    }

    return children;
};

function App() {
    const { isCheckingAuth, checkAuth } = useAuthStore();

    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    if (isCheckingAuth) return null; // Or a loading spinner

    return (
        <Router>
            <Routes>
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
                <Route path="/dashboard" element={
                    <ProtectedRoute>
                        <Dashboard />
                    </ProtectedRoute>
                } />
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
            </Routes>
        </Router>
    );
}

export default App;

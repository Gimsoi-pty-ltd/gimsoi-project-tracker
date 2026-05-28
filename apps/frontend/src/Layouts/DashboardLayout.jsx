// src/Layouts/DashboardLayout.jsx
import { useState, useEffect } from "react";
import { Outlet, Navigate } from "react-router-dom";
import Sidebar from "../Components/Common/SideBar";
import TopBar from "../Components/Common/TopBar";
import { useAuthStore } from "../store/authStore";

const DashboardLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { checkAuth, isAuthenticated, isCheckingAuth } = useAuthStore();

 
  useEffect(() => {
    checkAuth();
  }, []);

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]" style={{ fontFamily: "Arial, sans-serif" }}>
      <TopBar onMenuClick={() => setSidebarOpen(true)} />

      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content */}
      <main className="p-4 md:p-6 lg:p-8">
        {children || <Outlet />}
      </main>
    </div>
  );
};

export default DashboardLayout;
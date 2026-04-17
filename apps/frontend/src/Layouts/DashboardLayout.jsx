import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../Components/Common/SideBar";
import TopBar from "../Components/Common/TopBar";



const DashboardLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  


  return (
    <div className="min-h-screen bg-[#F8FAFC]" style={{ fontFamily: 'Arial, sans-serif' }}>
      {/* Top Bar */}
      <TopBar onMenuClick={() => setSidebarOpen(true)} />

      {/* Sidebar Overlay/Drawer */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-[100] flex">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
            onClick={() => setSidebarOpen(false)}
          />
          {/* Drawer */}
          <div className="relative w-[280px] h-full shadow-2xl animate-in slide-in-from-left duration-300">
            <Sidebar onClose={() => setSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      {children || <Outlet />}
    </div>
  );
};



export default DashboardLayout;

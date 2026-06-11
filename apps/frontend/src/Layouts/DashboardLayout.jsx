import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../Components/Common/SideBar";
import TopBar from "../Components/Common/TopBar";

const DashboardLayout = ({ children }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen bg-[#F8FAFC]" style={{ fontFamily: "Arial, sans-serif" }}>
            <TopBar onMenuClick={() => setSidebarOpen(true)} />

            <Sidebar
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
            />

            {children || <Outlet />}
        </div>
    );
};

export default DashboardLayout;

import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../Components/Common/SideBar";
import TopBar from "../Components/Common/TopBar";
import NotificationsDrawer from "../Components/Common/NotificationsDrawer";

const DashboardLayout = ({ children }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen bg-[#F8FAFC]" style={{ fontFamily: "Arial, sans-serif" }}>
            <TopBar onMenuClick={() => setSidebarOpen(true)}
            onNotificationClick={() => setNotificationsOpen(true)}
            />

            <Sidebar
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
            />

         
            <div className="min-h-screen overflow-x-hidden">
                {children || <Outlet />}
            </div>
        </div>
    );
};

export default DashboardLayout;
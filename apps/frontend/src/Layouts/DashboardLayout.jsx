import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../Components/Common/SideBar";
import TopBar from "../Components/Common/TopBar";
import NotificationsDrawer from "../Components/Common/NotificationsDrawer";

const DashboardLayout = ({ children }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [notificationsOpen, setNotificationsOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [loadingActions, setLoadingActions] = useState({});
const handleNotificationAction = (notificationId, actionId) => {
    console.log("Notification action:", { notificationId, actionId });
};
    return (
        <div className="min-h-screen bg-[#F8FAFC]" style={{ fontFamily: "Arial, sans-serif" }}>
            <TopBar
                onMenuClick={() => setSidebarOpen(true)}
                 onNotificationClick={() => setNotificationsOpen(true)}
             unreadCount={notifications.filter((notification) => !notification.isRead).length}
/>

            <Sidebar
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
            />

           <NotificationsDrawer
            isOpen={notificationsOpen}
             onClose={() => setNotificationsOpen(false)}
             notifications={notifications}
            loadingActions={loadingActions}
             onAction={handleNotificationAction}
/>

            <div className="min-h-screen overflow-x-hidden">
                {children || <Outlet />}
            </div>
        </div>
    );
};

export default DashboardLayout;
import React from "react";
import { Link } from "react-router-dom";
import DashboardCards from "../../Components/Dashboard/DashboardCards";
import DashboardCards from "../../Components/Dashboard/DashboardCards";
import FocusNotification from "../../Components/FocusToday/FocusNotification";


const Dashboard = () => {
    return (
         <>
        <FocusNotification />
        <DashboardCards />
         </>
    );
};

export default Dashboard;
import React from "react";
import { Link } from "react-router-dom";
import DashboardCards from "../Components/Dashboard/DashboardCards";
import DashboardLayout from "../Layouts/DashboardLayout";

const Dashboard = () => {
    return (
        <DashboardLayout>
            
            <DashboardCards />

        </DashboardLayout>
    );
};

export default Dashboard;
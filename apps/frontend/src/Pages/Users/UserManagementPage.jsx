// src/Pages/Users/UserManagementPage.jsx
import { useEffect, useState } from "react";
import { useClientStore } from "../../store/clientStore";
import { resourceAPI } from "../../api/api";
import Users from "./Users";
import Teams from "./Teams";
import Clients from "./Clients";

export default function UserManagementPage() {
  const { clients, getClients } = useClientStore();
  const [activeTab, setActiveTab] = useState("users");
  const [userCount, setUserCount] = useState(null);
  const [teamCount, setTeamCount] = useState(null);

  useEffect(() => {
    getClients();
   
    resourceAPI.get("/users?limit=1")
      .then((r) => setUserCount(r.data.total || r.data.totalCount || r.data.users?.length || "—"))
      .catch(() => setUserCount("—"));
    
    resourceAPI.get("/projects?limit=1")
      .then((r) => setTeamCount(r.data.total || r.data.totalCount || r.data.projects?.length || "—"))
      .catch(() => setTeamCount("—"));
  }, []);

  const tabs = [
    { id: "users",   label: "Users" },
    { id: "teams",   label: "Teams" },
    { id: "clients", label: "Clients" },
  ];

  const statCards = [
    { label: "Total Users",   value: userCount ?? "—",        sub: "Team members" },
    { label: "Total Teams",   value: teamCount ?? "—",        sub: "Project teams" },
    { label: "Total Clients", value: clients.length || "—",   sub: "Client accounts" },
    { label: "Active Clients",value: clients.filter((c) => c.status === "Active" || c.status === "active").length || "—", sub: "Currently active" },
  ];

  return (
    <div className="bg-gray-50 min-h-screen">

      {/* Page Header */}
      <div className="bg-white border-b border-gray-200 px-4 md:px-8 py-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">User Management</h1>
        <p className="text-sm text-gray-500 mt-1">Manage users, teams, and clients across your organisation</p>
      </div>

      {/* Stats Cards */}
      <div className="px-4 md:px-8 py-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {statCards.map(({ label, value, sub }) => (
            <div key={label} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
              <p className="text-sm text-gray-500">{label}</p>
              <p className="text-2xl md:text-3xl font-bold text-gray-800 mt-1">{value}</p>
              <p className="text-xs text-gray-400 mt-1">{sub}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="flex border-b border-gray-200">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div>
            {activeTab === "users"   && <Users />}
            {activeTab === "teams"   && <Teams />}
            {activeTab === "clients" && <Clients />}
          </div>
        </div>
      </div>

    </div>
  );
}
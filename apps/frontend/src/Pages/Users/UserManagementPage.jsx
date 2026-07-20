import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDashboardStore } from "../../store/dashboardStore";

const SectionCard = ({ section }) => {
  const navigate = useNavigate();

  return (
    <div 
      onClick={() => navigate(section.route)}
      className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all cursor-pointer group"
    >
      {/* Content - Centered */}
      <h3 className="text-xl font-semibold text-gray-800 mb-2 text-center">{section.label}</h3>
      <p className="text-gray-600 text-sm mb-6 text-center">{section.description}</p>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {section.stats.map((stat, idx) => (
          <div key={idx} className="text-center">
            <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
            <p className="text-xs text-gray-500">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Action Button */}
      <button 
        onClick={(e) => {
          e.stopPropagation();
          navigate(section.route);
        }}
        className="w-full py-2 px-4 bg-gray-50 hover:bg-gray-100 text-gray-700 text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
      >
        Manage {section.label} →
      </button>
    </div>
  );
};

export default function UserManagement() {
  const { activities, isLoading, error, fetchOverview, getCounts } = useDashboardStore((state) => state);

  useEffect(() => {
    fetchOverview();
  }, [fetchOverview]);

  const counts = getCounts();

  const SECTIONS = [
    {
      id: "users",
      label: "Users",
      description: "Manage user accounts, roles, and permissions",
      route: "/users-list", 
      stats: [
        { label: "Total Users", value: counts.usersTotal },
        { label: "Verified", value: counts.usersVerified },
        { label: "Unverified", value: counts.usersUnverified },
      ],
    },
    {
      id: "clients",
      label: "Clients",
      description: "Manage client companies, contacts, and relationships",
      route: "/clients",
      stats: [
        { label: "Total Clients", value: counts.clientsTotal },
        { label: "New This Month", value: counts.clientsNewThisMonth },
        { label: "Active Projects", value: counts.projectsActive },
      ],
    },
    {
      id: "teams",
      label: "Teams",
      description: "Organize project teams, assignments, and workflows",
      route: "/teams", 
      stats: [
        { label: "Total Projects", value: counts.projectsTotal },
        { label: "Active", value: counts.projectsActive },
        { label: "Archived", value: counts.projectsArchived },
      ],
    },
  ];

  return (
    <div className="bg-gray-50 min-h-screen p-4 md:p-8">
      <div className="mx-auto">
        
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6">
            User Management
          </h1>
          <p className="text-gray-600">
            Overview and quick access to clients, teams, and user administration
          </p>
        </div>

        {/* Quick Actions Bar */}
        <div className="flex flex-wrap gap-3 mb-8">
          <button 
            onClick={() => alert("Add New action triggered - this would open the user creation modal.")}
            className="px-4 py-2 bg-[#002D62] text-white text-sm font-medium rounded-lg hover:bg-[#001f44] transition-colors flex items-center gap-2"
          >
            + Add New
          </button>
          <button 
            onClick={() => alert("Import Data action triggered - this would open the CSV upload interface.")}
            className="px-4 py-2 border text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
          >
            Import Data
          </button>
          <button 
            onClick={() => alert("Export Report action triggered - this generates and downloads a CSV report.")}
            className="px-4 py-2 border text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
          >
            Export Report
          </button>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>
        )}

        {/* Section Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading && SECTIONS.every((s) => s.stats.every((st) => !st.value)) ? (
            <p className="text-gray-400 col-span-full text-center py-8">Loading overview…</p>
          ) : (
            SECTIONS.map((section) => (
              <SectionCard key={section.id} section={section} />
            ))
          )}
        </div>

        {/* Recent Activity / Footer */}
        <div className="mt-12 bg-white border rounded-2xl p-6">
          <h3 className="font-semibold text-gray-800 mb-4">Recent Activity</h3>
          <div className="space-y-3 text-sm text-gray-600">
            {activities && activities.length > 0 ? (
              activities.slice(0, 5).map((act) => (
                <p key={act.id}>
                  • {act.action} - <span className="text-gray-400 text-xs">{act.createdAt ? new Date(act.createdAt).toLocaleString() : ""}</span>
                </p>
              ))
            ) : (
              <p className="text-gray-400">No recent activities logged.</p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
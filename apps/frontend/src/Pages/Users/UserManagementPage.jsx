import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Building2, Briefcase, Users as UsersIcon } from "lucide-react";
import { resourceAPI } from "../../api/api";
import { useAuthStore } from "../../store/authStore";


const SectionCard = ({ section }) => {
  const navigate = useNavigate();
  const Icon = section.icon;

  const colorClasses = {
    blue: "bg-blue-50 text-blue-600 border-blue-200",
    purple: "bg-purple-50 text-purple-600 border-purple-200",
    green: "bg-green-50 text-green-600 border-green-200",
  };

  return (
    <div 
      onClick={() => navigate(section.route)}
      className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all cursor-pointer group"
    >
      {/* Header with Icon & Title centered on same line */}
      <div className="flex items-center justify-center gap-3 mb-4">
        <div className={`p-3 rounded-xl border ${colorClasses[section.color]}`}>
          <Icon size={24} />
        </div>
        <h3 className="text-xl font-semibold text-gray-800">{section.label}</h3>
      </div>

      {/* Description */}
      <p className="text-gray-600 text-sm mb-6">{section.description}</p>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {section.stats.map((stat, idx) => (
          <div key={idx}>
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
  const [usersCount, setUsersCount] = useState(0);
  const [clientsCount, setClientsCount] = useState(0);
  const [activeProjects, setActiveProjects] = useState(0);
  const [onHoldProjects, setOnHoldProjects] = useState(0);
  const { userActivities = [], fetchActivities } = useAuthStore((state) => state);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, clientsRes, projectsRes] = await Promise.all([
          resourceAPI.get('/users').catch(() => ({ data: { data: [] } })),
          resourceAPI.get('/clients').catch(() => ({ data: { data: [] } })),
          resourceAPI.get('/projects').catch(() => ({ data: { data: [] } }))
        ]);
        
        const users = usersRes.data?.data || usersRes.data?.users || [];
        setUsersCount(users.length);

        const clients = clientsRes.data?.data || clientsRes.data?.clients || [];
        setClientsCount(clients.length);

        const projects = projectsRes.data?.data || projectsRes.data?.projects || [];
        setActiveProjects(projects.filter(p => p.status === 'ACTIVE').length);
        setOnHoldProjects(projects.filter(p => p.status === 'ON_HOLD').length);

        fetchActivities();

      } catch (error) {
        console.error("Failed to load user management stats", error);
      }
    };
    fetchData();
  }, [fetchActivities]);

  const SECTIONS = [
    {
      id: "users",
      label: "Users",
      description: "Manage user accounts, roles, and permissions",
      icon: UsersIcon,
      route: "/users-list", 
      stats: [
        { label: "Total Users", value: usersCount },
        { label: "Active", value: usersCount },
        { label: "Pending", value: "0" },
      ],
      color: "green",
    },
    {
      id: "clients",
      label: "Clients",
      description: "Manage client companies, contacts, and relationships",
      icon: Building2,
      route: "/clients",
      stats: [
        { label: "Total Clients", value: clientsCount },
        { label: "Active", value: clientsCount },
        { label: "Onboarding", value: "0" },
      ],
      color: "blue",
    },
    {
      id: "teams",
      label: "Teams",
      description: "Organize project teams, assignments, and workflows",
      icon: Briefcase,
      route: "/teams", 
      stats: [
        { label: "Total Teams", value: "0" },
        { label: "Active Projects", value: activeProjects },
        { label: "On Hold", value: onHoldProjects },
      ],
      color: "purple",
    },
  ];

  return (
    <div className="bg-gray-50 min-h-screen p-4 md:p-8">
      <div className=" mx-auto">
        
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

        {/* Section Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {SECTIONS.map((section) => (
            <SectionCard key={section.id} section={section} />
          ))}
        </div>

        {/* Recent Activity / Footer */}
        <div className="mt-12 bg-white border rounded-2xl p-6">
          <h3 className="font-semibold text-gray-800 mb-4">Recent Activity</h3>
          <div className="space-y-3 text-sm text-gray-600">
            {userActivities && userActivities.length > 0 ? (
              userActivities.slice(0, 5).map((act, i) => (
                <p key={i}>
                  • {act.action} - <span className="text-gray-400 text-xs">{new Date(act.timestamp).toLocaleString()}</span>
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

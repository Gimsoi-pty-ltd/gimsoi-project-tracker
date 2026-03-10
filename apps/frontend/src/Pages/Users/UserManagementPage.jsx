import React from "react";
import { useNavigate } from "react-router-dom";
import { Building2, Briefcase, Users as UsersIcon, ArrowRight } from "lucide-react";



const SECTIONS = [
  {
    id: "users",
    label: "Users",
    description: "Manage user accounts, roles, and permissions",
    icon: UsersIcon,
    route: "/users-list", 
    stats: [
      { label: "Total Users", value: "156" },
      { label: "Active", value: "142" },
      { label: "Pending", value: "8" },
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
      { label: "Total Clients", value: "24" },
      { label: "Active", value: "18" },
      { label: "Onboarding", value: "3" },
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
      { label: "Total Teams", value: "12" },
      { label: "Active Projects", value: "8" },
      { label: "On Hold", value: "2" },
    ],
    color: "purple",
  },
  
];


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
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-xl border ${colorClasses[section.color]}`}>
          <Icon size={24} />
        </div>
        <ArrowRight 
          size={20} 
          className="text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all" 
        />
      </div>

      {/* Content */}
      <h3 className="text-xl font-semibold text-gray-800 mb-2">{section.label}</h3>
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
  return (
    <div className="bg-gray-50 min-h-screen p-4 md:p-8">
      <div className=" mx-auto">
        
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
            User Management
          </h1>
          <p className="text-gray-600">
            Overview and quick access to clients, teams, and user administration
          </p>
        </div>

        {/* Quick Actions Bar */}
        <div className="flex flex-wrap gap-3 mb-8">
          <button className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
            + Add New
          </button>
          <button className="px-4 py-2 border text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors">
            Import Data
          </button>
          <button className="px-4 py-2 border text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors">
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
            <p>• Client "Acme Corp" was updated by Sarah Chen</p>
            <p>• New user "jane@company.co" pending approval</p>
            <p>• Team "Alpha" completed Project Ares milestone</p>
          </div>
        </div>

      </div>
    </div>
  );
}
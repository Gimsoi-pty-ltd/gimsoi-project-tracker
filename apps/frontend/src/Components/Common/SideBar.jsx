import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, FolderKanban, ListTodo, Users, PieChart, X, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import NavyButton from "../NavyButton";

export default function Sidebar({ onClose, onLogout }) {
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    { label: "Home", icon: Home, href: "/" },
    { label: "Projects", icon: FolderKanban, href: "/projects" },
    { label: "Phases", icon: ListTodo, href: "/phases" },
  ];

  const insightItems = [
    { label: "Team Insights", icon: Users, href: "/teamInsights" },
    { label: "Reports", icon: PieChart, href: "/reports" },
  ];

  return (
    <div className="h-full w-[280px] max-w-[85vw] bg-[#002D62] pt-6 md:pt-8 shadow-2xl flex flex-col border-r border-blue-500/30">
      <div className="flex justify-between items-center px-5 md:px-8 mb-8 md:mb-10">
        <span className="text-white font-bold text-base md:text-lg tracking-tight">Project Tracker</span>
        <button
          className="p-1.5 md:p-2 hover:bg-blue-500 rounded-xl transition-colors text-blue-100"
          onClick={onClose}
        >
          <X size={24} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-3 md:px-4">
        <div className="mb-8 md:mb-10">
          <p className="px-4 md:px-6 mb-2 text-xs font-bold tracking-[1px] uppercase text-blue-200/60">
            Dashboard
          </p>
          <nav className="space-y-1 md:space-y-2">
            {menuItems.map((item) => (
              <Link
                key={item.label}
                to={item.href}
                className={`flex items-center gap-3 px-4 md:px-5 py-2.5 md:py-3 text-sm font-medium rounded-xl no-underline transition-all duration-200 group ${
                  location.pathname === item.href
                    ? "bg-white/20 text-white"
                    : "text-blue-50 hover:bg-white/10"
                }`}
                onClick={onClose}
              >
                <item.icon
                  size={18}
                  className={`${
                    location.pathname === item.href ? "text-white" : "text-blue-300 group-hover:text-white"
                  } transition-colors flex-shrink-0`}
                />
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="h-[1px] bg-blue-500/50 mx-4 md:mx-6 mb-8 md:mb-10"></div>

        <div className="mb-8 md:mb-10">
          <p className="px-4 md:px-6 mb-2 text-xs font-bold tracking-[1px] uppercase text-blue-200/60">
            Insights
          </p>
          <nav className="space-y-1 md:space-y-2">
            {insightItems.map((item) => (
              <Link
                key={item.label}
                to={item.href}
                className={`flex items-center gap-3 px-4 md:px-5 py-2.5 md:py-3 text-sm font-medium rounded-xl no-underline transition-all duration-200 group ${
                  location.pathname === item.href
                    ? "bg-white/20 text-white"
                    : "text-blue-50 hover:bg-white/10"
                }`}
                onClick={onClose}
              >
                <item.icon
                  size={18}
                  className={`${
                    location.pathname === item.href ? "text-white" : "text-blue-300 group-hover:text-white"
                  } transition-colors flex-shrink-0`}
                />
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* Logout */}
      <div className="px-3 md:px-4 py-4 md:py-6 border-t border-blue-500/30">
        <NavyButton
          onClick={() => navigate("/logout")}
          className="flex items-center gap-3 w-full px-4 md:px-5 py-2.5 md:py-3"
        >
          <LogOut size={18} />
          Logout
        </NavyButton>
      </div>
    </div>
  );
}
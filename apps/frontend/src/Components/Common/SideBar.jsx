import React from "react";
import { Home, FolderKanban, ListTodo, Users, PieChart, X, LogOut } from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import { useNavigate } from "react-router-dom";

export default function Sidebar({ onClose }) {
  const { logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error(error);
    }
  };

  const menuItems = [
    { label: "Home", icon: Home, href: "/dashboard" },
    { label: "Projects", icon: FolderKanban, href: "#" },
    { label: "Tasks", icon: ListTodo, href: "#" },
  ];

  const insightItems = [
    { label: "Team Insights", icon: Users, href: "#" },
    { label: "Reports", icon: PieChart, href: "#" },
  ];

  return (
    <div className="h-full w-[280px] bg-blue-600 pt-[32px] shadow-2xl flex flex-col border-r border-blue-500/30">
      <div className="flex justify-between items-center px-8 mb-10">
        <span className="text-white font-bold text-lg tracking-tight">Project Tracker</span>
        <button
          className="p-2 hover:bg-blue-500 rounded-xl transition-colors text-blue-100"
          onClick={onClose}
        >
          <X size={28} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4">
        <div className="mb-10">
          <p className="px-6 mb-2 text-xs font-bold tracking-[1px] uppercase text-blue-200/60">
            Dashboard
          </p>

          <nav className="space-y-2">
            {menuItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="flex items-center gap-3 px-5 py-3 text-sm font-medium text-blue-50 rounded-xl hover:bg-white/10 no-underline transition-all duration-200 group"
              >
                <item.icon size={20} className="text-blue-300 group-hover:text-white transition-colors" />
                {item.label}
              </a>
            ))}
          </nav>
        </div>

        <div className="h-[1px] bg-blue-500/50 mx-6 mb-10"></div>

        <div className="mb-10">
          <p className="px-6 mb-2 text-xs font-bold tracking-[1px] uppercase text-blue-200/60">
            Insights
          </p>

          <nav className="space-y-2">
            {insightItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="flex items-center gap-3 px-5 py-3 text-sm font-medium text-blue-50 rounded-xl hover:bg-white/10 no-underline transition-all duration-200 group"
              >
                <item.icon size={20} className="text-blue-300 group-hover:text-white transition-colors" />
                {item.label}
              </a>
            ))}
          </nav>
        </div>
      </div>

      {/* Logout Button */}
      <div className="p-4 border-t border-blue-500/30">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-5 py-3 text-sm font-bold text-white rounded-xl bg-red-500 hover:bg-red-600 transition-all duration-200 shadow-lg active:scale-95"
        >
          <LogOut size={20} />
          Logout
        </button>
      </div>
    </div>
  );
}


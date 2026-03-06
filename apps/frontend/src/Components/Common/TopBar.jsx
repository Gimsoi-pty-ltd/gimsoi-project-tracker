import React from "react";
import { Link, useLocation } from "react-router-dom";
import { HelpCircle, Search, Settings, Menu } from "lucide-react";
import logo from "../../assets/Gimsoi AI.jpg";

export default function TopBar({ onMenuClick }) {
  const location = useLocation();

  const navItems = [
    { label: "Dashboard", href: "/" },
    { label: "Tasks", href: "/tasks" },
    { label: "Users", href: "#" },
    { label: "Reports", href: "/reports" },
    { label: "Documents", href: "/documents" },
    { label: "Phases", href: "/phases" },
    { label: "Calendar", href: "/calendar" },
  ];

   const buttonItems = [
    { button: <HelpCircle size={24} />, href: "/help" },
    { button: <Search size={24} />, href: "/search" },
    { button: <Settings size={24} />, href: "/settings" },
  ];

  return (
    <div className="bg-[#002D62] px-[32px] py-[18px] shadow-[0_4px_20px_rgba(37,99,235,0.2)] sticky top-0 z-30 border-b border-blue-500/30">
      <div className="flex items-center justify-between w-full">

        {/* LEFT */}
        <div className="flex items-start gap-[24px]">
          <button
            className="p-2 hover:bg-blue-500 rounded-xl transition-all text-blue-100 hover:text-white active:scale-95"
            onClick={onMenuClick}
            aria-label="Menu"
          >
            <Menu size={24} />
          </button>

          <Link to="/" className="flex items-center gap-3 cursor-pointer hover:opacity-90 no-underline transition group">
            <img
              src={logo}
              alt="Gimsoi AI Logo"
              className="w-10 h-10 object-contain rounded-lg shadow-sm group-hover:scale-105 transition-transform"
            />
            <span className="font-bold text-xl tracking-tight text-white">
              Gimsoi AI
            </span>
          </Link>
        </div>

        {/* CENTER */}
        <div className="hidden lg:flex gap-1 bg-blue-700/40 p-1 rounded-xl backdrop-blur-sm border border-blue-400/20">
          {navItems.map((item) => (
            <Link
              key={item.label}
              to={item.href}
              className={`px-5 py-2 rounded-lg text-sm no-underline transition-all duration-200 ${location.pathname === item.href
                ? "bg-white text-blue-600 font-bold shadow-sm"
                : "text-blue-100 font-semibold hover:bg-white/10 hover:text-white"
                }`}
            >
              {item.label}
            </Link>
          ))}
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-[28px]">
          <div className="flex items-center gap-[12px]">
            {buttonItems.map((item, index) => (
    <Link key={index} to={item.href}>
      <button className="p-3 hover:bg-blue-500 rounded-full transition-all text-blue-100 hover:text-white active:scale-90">
        {item.button}
      </button>
    </Link>
  ))}
</div>

          <Link to="/profile" className="w-[48px] h-[48px] rounded-2xl bg-white flex items-center justify-center text-[20px] font-extrabold text-blue-600 cursor-pointer shadow-lg hover:scale-110 active:scale-95 transition-all" aria-label="Profile">
            R
          </Link>
        </div>

      </div>
    </div>
  );
}



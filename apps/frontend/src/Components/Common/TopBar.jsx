import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { HelpCircle, Search, Settings, Menu } from "lucide-react";
import logo from "../../assets/Gimsoi-AI.png";
import { useAuthStore } from "../../store/authStore";

const getInitials = (name) => {
  if (!name) return "?";
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
};

export default function TopBar({ onMenuClick }) {
  const location = useLocation();
  const user = useAuthStore((state) => state.user);
  const initials = getInitials(user?.fullName || user?.name);
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (moreRef.current && !moreRef.current.contains(e.target)) {
        setMoreOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navItems = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Tasks",     href: "/tasks" },
    { label: "Kanban",    href: "/kanban-board" },
    { label: "Users",     href: "/users" },
    { label: "Reports",   href: "/reports" },
    { label: "Documents", href: "/documents" },
    { label: "Phases",    href: "/phases" },
    { label: "Calendar",  href: "/calendar" },
  ];

  const buttonItems = [
    { button: <HelpCircle size={20} />, href: "/help",     label: "Help" },
    { button: <Search size={20} />,     href: "/search",   label: "Search" },
    { button: <Settings size={20} />,   href: "/settings", label: "Settings" },
  ];

  return (
    <div className="bg-[#002D62] px-4 sm:px-8 py-3 shadow-[0_4px_20px_rgba(37,99,235,0.2)] sticky top-0 z-30 border-b border-blue-500/30">
      <div className="flex items-center justify-between w-full gap-3">

        {/* LEFT — hamburger always, logo+name hidden on mobile */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <button
            className="p-2 hover:bg-blue-500 rounded-xl text-blue-100 hover:text-white"
            onClick={onMenuClick}
          >
            <Menu size={22} />
          </button>

          <Link to="/dashboard" className="hidden sm:flex items-center gap-2 no-underline">
            <img src={logo} alt="logo" className="w-9 h-9 rounded-lg" />
            <span className="font-bold text-lg text-white">Gimsoi</span>
          </Link>
        </div>

        {/* NAVIGATION */}
        <div className="flex items-center gap-1 bg-blue-700/40 p-1 rounded-xl border border-blue-400/20 flex-shrink min-w-0">

          {/* Desktop — all items */}
          <div className="hidden xl:flex">
            {navItems.map((item) => (
              <Link
                key={item.label}
                to={item.href}
                className={`px-4 py-2 rounded-lg text-sm no-underline whitespace-nowrap ${
                  location.pathname === item.href
                    ? "bg-white text-blue-600 font-bold"
                    : "text-blue-100 hover:bg-white/10 hover:text-white"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Tablet — first 3 */}
          <div className="hidden lg:flex xl:hidden">
            {navItems.slice(0, 3).map((item) => (
              <Link
                key={item.label}
                to={item.href}
                className={`px-4 py-2 rounded-lg text-sm no-underline whitespace-nowrap ${
                  location.pathname === item.href
                    ? "bg-white text-blue-600 font-bold"
                    : "text-blue-100 hover:bg-white/10 hover:text-white"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Mobile — Dashboard only */}
          <div className="flex lg:hidden">
            <Link
              to="/dashboard"
              className={`px-3 py-2 rounded-lg text-sm no-underline whitespace-nowrap ${
                location.pathname === "/dashboard"
                  ? "bg-white text-blue-600 font-bold"
                  : "text-blue-100 hover:bg-white/10 hover:text-white"
              }`}
            >
              Dashboard
            </Link>
          </div>

          {/* MORE dropdown */}
          <div className="relative xl:hidden" ref={moreRef}>
            <button
              onClick={() => setMoreOpen(!moreOpen)}
              className="px-3 py-2 text-sm text-blue-100 hover:bg-white/10 rounded-lg whitespace-nowrap"
            >
              More
            </button>

            {moreOpen && (
              <div className="absolute right-0 top-12 bg-white rounded-xl shadow-lg w-[200px] overflow-hidden z-50">

                {/* Tablet: remaining nav items */}
                <div className="hidden lg:block xl:hidden">
                  {navItems.slice(3).map((item) => (
                    <Link key={item.label} to={item.href}
                      className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 no-underline"
                      onClick={() => setMoreOpen(false)}>
                      {item.label}
                    </Link>
                  ))}
                </div>

                {/* Mobile: remaining nav items + divider + Help/Search/Settings */}
                <div className="lg:hidden">
                  {navItems.slice(1).map((item) => (
                    <Link key={item.label} to={item.href}
                      className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 no-underline"
                      onClick={() => setMoreOpen(false)}>
                      {item.label}
                    </Link>
                  ))}

                  <div className="h-[1px] bg-gray-100 mx-3 my-1" />

                  {buttonItems.map((item, index) => (
                    <Link key={index} to={item.href}
                      className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 no-underline"
                      onClick={() => setMoreOpen(false)}>
                      <span className="text-blue-600">{item.button}</span>
                      {item.label}
                    </Link>
                  ))}
                </div>

              </div>
            )}
          </div>
        </div>

        {/* RIGHT — icons hidden on mobile */}
        <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
          <div className="hidden sm:flex items-center gap-1">
            {buttonItems.map((item, index) => (
              <Link key={index} to={item.href}>
                <button className="p-2 hover:bg-blue-500 rounded-full text-blue-100 hover:text-white">
                  {item.button}
                </button>
              </Link>
            ))}
          </div>

          <Link
            to="/profile"
            title={user?.fullName || user?.name || "Profile"}
            className="w-9 h-9 sm:w-11 sm:h-11 rounded-2xl bg-white flex items-center justify-center text-sm sm:text-lg font-extrabold text-blue-600 flex-shrink-0"
          >
            {initials}
          </Link>
        </div>

      </div>
    </div>
  );
}
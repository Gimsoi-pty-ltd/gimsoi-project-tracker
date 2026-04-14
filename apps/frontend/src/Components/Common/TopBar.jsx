import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { HelpCircle, Search, Settings, Menu } from "lucide-react";
import logo from "../../assets/Gimsoi AI.jpg";

export default function TopBar({ onMenuClick }) {
  const location = useLocation();
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef(null);

  // Close dropdown when clicking outside of it
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
    { label: "Dashboard", href: "/" },
    { label: "Tasks", href: "/tasks" },
    { label: "Users", href: "/users" },
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
    <div className="bg-[#002D62] px-[20px] sm:px-[32px] py-[18px] shadow-[0_4px_20px_rgba(37,99,235,0.2)] sticky top-0 z-30 border-b border-blue-500/30">
      <div className="flex items-center justify-between w-full">

        {/* LEFT */}
        <div className="flex items-center gap-[16px] sm:gap-[24px]">
          <button
            className="p-2 hover:bg-blue-500 rounded-xl text-blue-100 hover:text-white"
            onClick={onMenuClick}
          >
            <Menu size={24} />
          </button>

          <Link to="/" className="flex items-center gap-2 sm:gap-3 no-underline">
            <img
              src={logo}
              alt="logo"
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg"
            />
            <span className="font-bold text-lg sm:text-xl text-white">
              Gimsoi AI
            </span>
          </Link>
        </div>

        {/* NAVIGATION */}
        <div className="flex items-center gap-1 bg-blue-700/40 p-1 rounded-xl border border-blue-400/20">

          {/* Desktop */}
          <div className="hidden xl:flex">
            {navItems.map((item) => (
              <Link
                key={item.label}
                to={item.href}
                className={`px-5 py-2 rounded-lg text-sm no-underline ${
                  location.pathname === item.href
                    ? "bg-white text-blue-600 font-bold"
                    : "text-blue-100 hover:bg-white/10 hover:text-white"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Tablet */}
          <div className="hidden lg:flex xl:hidden">
            {navItems.slice(0, 3).map((item) => (
              <Link
                key={item.label}
                to={item.href}
                className={`px-4 py-2 rounded-lg text-sm no-underline ${
                  location.pathname === item.href
                    ? "bg-white text-blue-600 font-bold"
                    : "text-blue-100 hover:bg-white/10 hover:text-white"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Mobile */}
          <div className="flex lg:hidden">
            <Link
              to="/"
              className={`px-4 py-2 rounded-lg text-sm no-underline ${
                location.pathname === "/"
                  ? "bg-white text-blue-600 font-bold"
                  : "text-blue-100 hover:bg-white/10 hover:text-white"
              }`}
            >
              Dashboard
            </Link>
          </div>

          {/* MORE MENU */}
          <div className="relative xl:hidden" ref={moreRef}>
            <button
              onClick={() => setMoreOpen(!moreOpen)}
              className="px-4 py-2 text-sm text-blue-100 hover:bg-white/10 rounded-lg"
            >
              More
            </button>

            {moreOpen && (
              <div className="absolute right-0 top-12 bg-white rounded-xl shadow-lg w-[200px] overflow-hidden z-50">
                {/* Tablet dropdown */}
                <div className="hidden lg:block xl:hidden">
                  {navItems.slice(3).map((item) => (
                    <Link
                      key={item.label}
                      to={item.href}
                      className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 no-underline"
                      onClick={() => setMoreOpen(false)}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>

                {/* Mobile dropdown */}
                <div className="lg:hidden">
                  {navItems.slice(1).map((item) => (
                    <Link
                      key={item.label}
                      to={item.href}
                      className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 no-underline"
                      onClick={() => setMoreOpen(false)}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-[10px] sm:gap-[20px]">
          <div className="flex items-center gap-[6px] sm:gap-[12px]">
            {buttonItems.map((item, index) => (
              <Link key={index} to={item.href}>
                <button className="p-2 sm:p-3 hover:bg-blue-500 rounded-full text-blue-100 hover:text-white">
                  {item.button}
                </button>
              </Link>
            ))}
          </div>

          <Link
            to="/profile"
            className="w-[40px] h-[40px] sm:w-[48px] sm:h-[48px] rounded-2xl bg-white flex items-center justify-center text-[18px] sm:text-[20px] font-extrabold text-blue-600"
          >
            R
          </Link>
        </div>
      </div>
    </div>
  );
}
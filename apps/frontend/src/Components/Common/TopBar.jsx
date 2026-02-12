import React from "react";
import { HelpCircle, Search, Settings, Menu } from "lucide-react";
import logo from "../../assets/Gimsoi AI.jpg";

export default function TopBar({ onMenuClick }) {
  return (
    <div className="bg-blue-600 px-[32px] py-[18px] shadow-[0_4px_20px_rgba(37,99,235,0.2)] sticky top-0 z-30 border-b border-blue-500/30">
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

          <div className="flex items-center gap-3 cursor-pointer hover:opacity-90 transition group">
            <img
              src={logo}
              alt="Gimsoi AI Logo"
              className="w-10 h-10 object-contain rounded-lg shadow-sm group-hover:scale-105 transition-transform"
            />
            <span className="font-bold text-xl tracking-tight text-white">
              Gimsoi AI
            </span>
          </div>
        </div>

        {/* CENTER */}
        <div className="hidden lg:flex gap-1 bg-blue-700/40 p-1 rounded-xl backdrop-blur-sm border border-blue-400/20">
          <div className="px-5 py-2 rounded-lg text-sm font-bold bg-white text-blue-600 cursor-pointer shadow-sm hover:translate-y-[-1px] transition-all">
            Dashboard
          </div>

          {[
            "Tasks",
            "Users",
            "Reports",
            "Documents",
            "Phases",
            "Calendar",
          ].map((item) => (
            <div
              key={item}
              className="px-5 py-2 rounded-lg text-sm font-semibold text-blue-100 cursor-pointer hover:bg-white/10 hover:text-white transition-all duration-200"
            >
              {item}
            </div>
          ))}
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-[28px]">
          <div className="flex items-center gap-[12px]">
            <button className="p-3 hover:bg-blue-500 rounded-full transition-all text-blue-100 hover:text-white active:scale-90">
              <HelpCircle size={24} />
            </button>
            <button className="p-3 hover:bg-blue-500 rounded-full transition-all text-blue-100 hover:text-white active:scale-90">
              <Search size={24} />
            </button>
            <button className="p-3 hover:bg-blue-500 rounded-full transition-all text-blue-100 hover:text-white active:scale-90">
              <Settings size={24} />
            </button>
          </div>

          <div className="w-[48px] h-[48px] rounded-2xl bg-white flex items-center justify-center text-[20px] font-extrabold text-blue-600 cursor-pointer shadow-lg hover:scale-110 active:scale-95 transition-all">
            R
          </div>
        </div>

      </div>
    </div>
  );
}


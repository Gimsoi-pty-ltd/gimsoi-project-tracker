import React from "react";

export default function Footer() {
  return (
    <footer className="w-full bg-[#002D62] text-blue-200 py-6 px-4 md:px-8 border-t border-blue-500/20 mt-auto">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs md:text-sm">
        <div>
          <p className="font-semibold text-white">&copy; {new Date().getFullYear()} Gimsoi. All rights reserved.</p>
          <p className="text-blue-300/60 mt-0.5">Streamlining project tracking and team insights.</p>
        </div>
        <div className="flex items-center gap-6">
          <a href="/help" className="hover:text-white transition-colors no-underline">Help & Support</a>
          <a href="/settings" className="hover:text-white transition-colors no-underline">Settings</a>
          <span className="text-blue-500">|</span>
          <span className="text-blue-300/80">v1.0.0</span>
        </div>
      </div>
    </footer>
  );
}

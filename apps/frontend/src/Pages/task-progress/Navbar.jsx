import { Menu } from "lucide-react";
import gimsoi from "../../assets/gimsoi-ai.png";

const Navbar = ({ onToggleSidebar }) => {
  return (
    <nav className="h-14 bg-[#002D62] flex items-center px-6 sticky top-0 z-50">

      {/* Hamburger */}
      <button onClick={onToggleSidebar} className="text-white mr-4 cursor-pointer hover:text-white/70 transition-colors">
        <Menu size={22} />
      </button>

      {/* Logo */}
      <div className="flex items-center gap-3 text-white font-semibold text-sm">
        <div className="w-8 h-8 rounded-md overflow-hidden flex items-center justify-center">
          <img src={gimsoi} alt="Gimsoi AI" className="w-full h-full object-cover" />
        </div>
        Gimsoi AI
      </div>

      {/* Navigation Links */}
      <ul className="flex gap-6 text-white/80 text-sm font-medium mx-auto">
        {[
          "Dashboard",
          "Tasks",
          "Users",
          "Reports",
          "Documents",
          "Phases",
          "Calendar",
        ].map((item) => (
          <li key={item} className="text-white/80 cursor-pointer px-3 py-1 rounded transition-colors hover:bg-white hover:text-[#002D62]">
            {item}
          </li>
        ))}
      </ul>

      {/* Action Icons */}
      <div className="flex items-center gap-3">

        {/* Help */}
        <button
          className="w-8 h-8 flex items-center justify-center rounded-md text-white/80 hover:bg-white/20 hover:text-white transition"
          title="Help"
        >
          <svg
            width="17"
            height="17"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        </button>

        {/* Search */}
        <button
          className="w-8 h-8 flex items-center justify-center rounded-md text-white/80 hover:bg-white/20 hover:text-white transition"
          title="Search"
        >
          <svg
            width="17"
            height="17"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </button>

        {/* Settings */}
        <button
          className="w-8 h-8 flex items-center justify-center rounded-md text-white/80 hover:bg-white/20 hover:text-white transition"
          title="Settings"
        >
          <svg
            width="17"
            height="17"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        </button>

        {/* Avatar */}
        <div className="w-8 h-8 bg-white rounded-md flex items-center justify-center text-black font-semibold text-sm">
          R
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

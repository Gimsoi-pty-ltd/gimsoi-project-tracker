import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Home, FolderKanban, ListTodo, Users, PieChart, X, LogOut, ChevronDown } from "lucide-react";
import { useProjectStore } from "../../store/projectStore";
import { useAuthStore } from "../../store/authStore";

const PROJECT_DOT_COLORS = {
    ACTIVE: "bg-blue-500",
    COMPLETED: "bg-emerald-500",
    DRAFT: "bg-gray-400",
    PLANNING: "bg-purple-500",
    "ON HOLD": "bg-orange-400",
};

const getProjectDotColor = (status) =>
    PROJECT_DOT_COLORS[(status || "DRAFT").toUpperCase()] || "bg-gray-400";

const getInitials = (name) => {
    if (!name) return "?";
    return name
        .split(" ")
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();
};

const isNavActive = (pathname, href) => {
    if (href === "/dashboard") {
        return pathname === "/dashboard" || pathname === "/dashboard/cards" || pathname === "/";
    }
    return pathname === href || pathname.startsWith(`${href}/`);
};

export default function Sidebar({ isOpen, onClose }) {
    const location = useLocation();
    const navigate = useNavigate();

    const projects = useProjectStore((state) => state.projects);
    const currentProject = useProjectStore((state) => state.currentProject);
    const fetchProjects = useProjectStore((state) => state.fetchProjects);
    const switchProject = useProjectStore((state) => state.switchProject);

    const authUser = useAuthStore((state) => state.user);
    const logout = useAuthStore((state) => state.logout);
    const isLoggingOut = useAuthStore((state) => state.isLoading);

    const [dropdownOpen, setDropdownOpen] = useState(false);

    useEffect(() => {
        const initProjects = async () => {
            try {
                if (!useProjectStore.getState().projects.length) {
                    await fetchProjects({ limit: 50 });
                }
                const { currentProject, projects: list } = useProjectStore.getState();
                const exists = currentProject && list.some((p) => p.id === currentProject.id);
                if ((!currentProject || !exists) && list.length > 0) {
                    const savedPid = localStorage.getItem('gimsoi_active_project_id');
                    const targetId = (savedPid && list.some(p => p.id === savedPid)) ? savedPid : list[0].id;
                    await switchProject(targetId);
                }
            } catch (err) {
                throw new Error("Sidebar initProjects failed: " + err.message);
            }
        };
        initProjects().catch(() => {});
    }, [fetchProjects, switchProject]);

    const activeProject = currentProject || projects[0] || null;

    const user = {
        name: authUser?.fullName || "User",
        role: authUser?.role || "—",
        initials: getInitials(authUser?.fullName),
    };

    const handleLogout = async () => {
        try {
            await logout();
            localStorage.removeItem("user");
            localStorage.removeItem("token");
            navigate("/login");
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    const handleProjectSelect = (project) => {
        switchProject(project.id);
        setDropdownOpen(false);
        onClose?.();
    };

    const menuItems = [
        { label: "Home", icon: Home, href: "/dashboard" },
        { label: "Kanban", icon: FolderKanban, href: "/kanban-board" },
        { label: "Projects", icon: FolderKanban, href: "/projects" },
        { label: "Phases", icon: ListTodo, href: "/phases" },
    ];

    const insightItems = [
        { label: "Team Insights", icon: Users, href: "/teamInsights" },
        { label: "Reports", icon: PieChart, href: "/reports" },
    ];

    return (
        <>
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/40 z-40 lg:hidden"
                    onClick={onClose}
                />
            )}

            <div
                className={`
        fixed top-0 left-0 h-full z-50
        transform transition-transform duration-300
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
      `}
            >
                <div className="h-full w-[280px] max-w-[85vw] bg-[#002D62] pt-6 md:pt-8 shadow-2xl flex flex-col border-r border-blue-500/30">
                    <div className="flex justify-between items-center px-5 md:px-8 mb-8 md:mb-10">
                        <span className="text-white font-bold text-base md:text-lg tracking-tight">
                            Project Tracker
                        </span>
                        <button
                            type="button"
                            className="p-1.5 md:p-2 hover:bg-blue-500 rounded-xl transition-colors text-blue-100"
                            onClick={onClose}
                        >
                            <X size={24} />
                        </button>
                    </div>

                    <div className="px-5 md:px-8 mb-8 md:mb-10 relative">
                        <p className="text-xs font-bold tracking-[1px] uppercase text-blue-200/60 mb-2">
                            Current Project
                        </p>
                        {activeProject ? (
                            <>
                                <button
                                    type="button"
                                    onClick={() => setDropdownOpen((prev) => !prev)}
                                    className="w-full bg-blue-800/40 hover:bg-blue-800/60 border border-blue-400/30 rounded-xl px-4 py-3 flex items-center justify-between transition-all duration-200 group"
                                >
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div
                                            className={`w-3 h-3 ${getProjectDotColor(activeProject.status)} rounded-sm flex-shrink-0`}
                                        />
                                        <span className="text-white text-sm font-medium truncate">
                                            {activeProject.name}
                                        </span>
                                    </div>
                                    <ChevronDown
                                        size={16}
                                        className={`text-blue-300 group-hover:text-white flex-shrink-0 transition-all duration-200 ${dropdownOpen ? "rotate-180" : ""}`}
                                    />
                                </button>

                                {dropdownOpen && (
                                    <div className="absolute left-5 right-5 md:left-8 md:right-8 top-full mt-1 bg-[#003580] border border-blue-400/30 rounded-xl shadow-xl z-50 overflow-hidden max-h-60 overflow-y-auto">
                                        {projects.map((project) => (
                                            <button
                                                key={project.id}
                                                type="button"
                                                onClick={() => handleProjectSelect(project)}
                                                className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-all duration-150 ${
                                                    activeProject.id === project.id
                                                        ? "bg-white/20 text-white"
                                                        : "text-blue-100 hover:bg-white/10"
                                                }`}
                                            >
                                                <div
                                                    className={`w-3 h-3 ${getProjectDotColor(project.status)} rounded-sm flex-shrink-0`}
                                                />
                                                <span className="truncate">{project.name}</span>
                                                <span className="ml-auto text-xs text-blue-400">
                                                    {project.status}
                                                </span>
                                                {activeProject.id === project.id && (
                                                    <span className="text-xs text-blue-300 font-medium">Active</span>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </>
                        ) : (
                            <p className="text-sm text-blue-200/80">No projects yet</p>
                        )}
                    </div>

                    <div className="flex-1 overflow-y-auto px-3 md:px-4">
                        <div className="mb-8 md:mb-10">
                            <p className="px-4 md:px-6 mb-2 text-xs font-bold tracking-[1px] uppercase text-blue-200/60">
                                Dashboard
                            </p>
                            <nav className="space-y-1 md:space-y-2">
                                {menuItems.map((item) => {
                                    const active = isNavActive(location.pathname, item.href);
                                    return (
                                        <Link
                                            key={item.label}
                                            to={item.href}
                                            className={`flex items-center gap-3 px-4 md:px-5 py-2.5 md:py-3 text-sm font-medium rounded-xl no-underline transition-all duration-200 group ${
                                                active
                                                    ? "bg-white/20 text-white"
                                                    : "text-blue-50 hover:bg-white/10"
                                            }`}
                                            onClick={onClose}
                                        >
                                            <item.icon
                                                size={18}
                                                className={`${
                                                    active
                                                        ? "text-white"
                                                        : "text-blue-300 group-hover:text-white"
                                                } transition-colors flex-shrink-0`}
                                            />
                                            {item.label}
                                        </Link>
                                    );
                                })}
                            </nav>
                        </div>

                        <div className="h-[1px] bg-blue-500/50 mx-4 md:mx-6 mb-8 md:mb-10" />

                        <div className="mb-8 md:mb-10">
                            <p className="px-4 md:px-6 mb-2 text-xs font-bold tracking-[1px] uppercase text-blue-200/60">
                                Insights
                            </p>
                            <nav className="space-y-1 md:space-y-2">
                                {insightItems.map((item) => {
                                    const active = isNavActive(location.pathname, item.href);
                                    return (
                                        <Link
                                            key={item.label}
                                            to={item.href}
                                            className={`flex items-center gap-3 px-4 md:px-5 py-2.5 md:py-3 text-sm font-medium rounded-xl no-underline transition-all duration-200 group ${
                                                active
                                                    ? "bg-white/20 text-white"
                                                    : "text-blue-50 hover:bg-white/10"
                                            }`}
                                            onClick={onClose}
                                        >
                                            <item.icon
                                                size={18}
                                                className={`${
                                                    active
                                                        ? "text-white"
                                                        : "text-blue-300 group-hover:text-white"
                                                } transition-colors flex-shrink-0`}
                                            />
                                            {item.label}
                                        </Link>
                                    );
                                })}
                            </nav>
                        </div>
                    </div>

                    <div className="px-3 md:px-4 py-4 md:py-6 border-t border-blue-500/30">
                        <div className="flex items-center gap-3 px-2 mb-4">
                            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                                {user.initials}
                            </div>
                            <div className="min-w-0">
                                <p className="text-white text-sm font-medium truncate">{user.name}</p>
                                <p className="text-blue-300 text-xs truncate">{user.role}</p>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={handleLogout}
                            disabled={isLoggingOut}
                            className="w-full flex items-center justify-center gap-2 px-5 py-3 text-sm font-medium rounded-xl transition-all duration-200 bg-red-500/20 text-red-100 hover:bg-red-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <LogOut size={18} className="text-red-300" />
                            <span>{isLoggingOut ? "Logging out…" : "LogOut"}</span>
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}

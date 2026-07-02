import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus, Search, MoreHorizontal, Pencil, Trash2, ChevronDown, Zap } from "lucide-react";
import NavyButton from "../../Components/Buttons";
import ProjectForm from "../../Components/ProjectForm/ProjectForm";
import { useProjectStore } from "../../store/projectStore";
import EmptyState from "../../Components/EmptyState";
import ErrorAlert from "../../Components/ErrorAlert";
import LoadingSpinner from "../../Components/LoadingSpinner";

// ─── Status config ────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  ACTIVE:    { label: "Active",   dot: "bg-blue-500",    text: "text-blue-600",    bg: "bg-blue-50"    },
  COMPLETED: { label: "Complete", dot: "bg-emerald-500", text: "text-emerald-600", bg: "bg-emerald-50" },
  "ON HOLD": { label: "On Hold",  dot: "bg-orange-400",  text: "text-orange-600",  bg: "bg-orange-50"  },
  DRAFT:     { label: "Draft",    dot: "bg-gray-400",    text: "text-gray-600",    bg: "bg-gray-100"   },
  PLANNING:  { label: "Planning", dot: "bg-purple-500",  text: "text-purple-600",  bg: "bg-purple-50"  },
};

const getStatusCfg = (status) =>
  STATUS_CONFIG[(status || "DRAFT").toUpperCase()] || STATUS_CONFIG.DRAFT;

const PROGRESS_COLOR = (pct) => {
  if (pct >= 100) return "bg-emerald-500";
  if (pct >= 60)  return "bg-blue-500";
  return "bg-orange-400";
};

// ─── Status Badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const cfg = getStatusCfg(status);

  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  return (
    <div className="relative inline-block" ref={ref} onClick={(e) => e.stopPropagation()}>
      <button
        onClick={() => setOpen((p) => !p)}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${cfg.bg} ${cfg.text} transition-all hover:opacity-80`}
      >
        <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
        {cfg.label}
        <ChevronDown className="w-3 h-3 opacity-60" />
      </button>
      {open && (
        <div className="absolute left-0 top-9 z-30 w-36 bg-white rounded-xl shadow-xl border border-gray-100 py-1 overflow-hidden">
          {Object.entries(STATUS_CONFIG).map(([key, val]) => (
            <button
              key={key}
              onClick={() => { onChange && onChange(key); setOpen(false); }}
              className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <span className={`w-2 h-2 rounded-full ${val.dot}`} />
              {val.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Project Row ──────────────────────────────────────────────────────────────
function ProjectRow({ project, onNavigate, onDelete, onStatusChange }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const pct = project.progress || 0;

  useEffect(() => {
    const h = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const clientName = typeof project.client === "object" ? project.client?.name : project.client;
  return (
    <div
      className="grid grid-cols-[1fr_1.2fr_1fr_0.8fr_1.4fr_44px] items-center px-6 py-4 hover:bg-slate-50 transition-colors cursor-pointer border-b border-gray-100 last:border-0 group"
      onClick={() => onNavigate(project)}
    >
      <div className="text-sm font-medium text-gray-700 truncate pr-4">{clientName || "—"}</div>
      <div className="text-sm font-semibold text-gray-900 truncate pr-4">{project.name || "Unnamed Project"}</div>

      <div onClick={(e) => e.stopPropagation()}>
        <StatusBadge status={project.status} onChange={(s) => onStatusChange(project.id, s)} />
      </div>

      <div className="text-sm text-gray-500 pr-4">
        {project.sprint
          ? <span className="px-2 py-1 bg-gray-100 rounded-lg text-xs font-medium text-gray-600">{project.sprint}</span>
          : "—"}
      </div>

      <div className="flex items-center gap-3 pr-4">
        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            style={{ width: `${Math.min(pct, 100)}%` }}
            className={`h-full rounded-full transition-all duration-500 ${PROGRESS_COLOR(pct)}`}
          />
        </div>
        <span className="text-sm font-semibold text-gray-500 w-9 text-right tabular-nums">{pct}%</span>
      </div>

      <div onClick={(e) => e.stopPropagation()} ref={menuRef} className="relative flex justify-center">
        <button
          onClick={() => setMenuOpen((p) => !p)}
          className="p-1.5 text-gray-300 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
        >
          <MoreHorizontal className="w-4 h-4" />
        </button>
        {menuOpen && (
          <div className="absolute right-0 top-8 z-30 w-36 bg-white rounded-xl shadow-xl border border-gray-100 py-1">
            <button
              onClick={() => { setMenuOpen(false); onNavigate(project); }}
              className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
            >
              <Pencil className="w-4 h-4" /> View / Edit
            </button>
            <button
              onClick={() => { setMenuOpen(false); onDelete(project.id); }}
              className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors"
            >
              <Trash2 className="w-4 h-4" /> Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Delete Modal ─────────────────────────────────────────────────────────────
function DeleteModal({ onCancel, onConfirm }) {
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6">
        <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mb-4">
          <Trash2 className="w-5 h-5 text-red-500" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-1">Delete Project</h3>
        <p className="text-gray-500 text-sm mb-6">Are you sure? This cannot be undone.</p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-gray-700 font-medium hover:bg-gray-50 text-sm transition-colors">Cancel</button>
          <button onClick={onConfirm} className="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 text-sm transition-colors">Delete</button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Projects Page ───────────────────────────────────────────────────────
export default function Projects() {
  const navigate = useNavigate();
  const { projects, isLoading, error, fetchProjects, deleteProject, updateProject, clearError } = useProjectStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => { fetchProjects(); }, [fetchProjects]);

  const filteredProjects = projects.filter((p) =>
    (p.name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
    (p.client?.toLowerCase() || "").includes(searchTerm.toLowerCase())
  );

  const handleNavigate = (project) => {
    useProjectStore.getState().setCurrentProject(project);
    navigate(`/projects/${project.id}`);
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirm) return;
    try {
      await deleteProject(deleteConfirm);
      setDeleteConfirm(null);
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const handleStatusChange = async (projectId, newStatus) => {
    try {
      const project = projects.find((p) => p.id === projectId);
      if (project) await updateProject(projectId, { ...project, status: newStatus });
    } catch (err) {
      console.error("Status update failed:", err);
    }
  };

  return (
    <div className="bg-[#f5f7fb] min-h-screen font-sans">
      <div className="max-w-7xl mx-auto px-6 py-8">

        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6">Projects</h1>
            <p className="text-gray-400 text-sm mt-0.5">Manage and track your ongoing projects</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none w-56 bg-white shadow-sm transition-all"
              />
            </div>
            <NavyButton
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow-sm transition-colors"
            >
              <Plus className="w-4 h-4" /> New Project
            </NavyButton>

            <Link to="/kanban-board">
              <NavyButton className="flex items-center gap-2 px-4 py-2 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow-sm transition-colors">
                <Zap className="w-4 h-4" /> Kanban Board
              </NavyButton>
            </Link>
          </div>
        </div>

        {/* ── Error ── */}
        {error && (
          <div className="mb-6">
            <ErrorAlert
              message={error}
              type="error"
              onDismiss={() => clearError()}
              actions={[{ label: "Retry", onClick: () => fetchProjects() }]}
            />
          </div>
        )}

        {/* ── Table ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="grid grid-cols-[1fr_1.2fr_1fr_0.8fr_1.4fr_44px] px-6 py-3 border-b border-gray-100 bg-gray-50/60">
            {["CLIENT", "PROJECT NAME", "STATUS", "SPRINT", "PROGRESS", ""].map((h) => (
              <div key={h} className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{h}</div>
            ))}
          </div>

          {/* Loading */}
          {isLoading && !projects.length && (
            <LoadingSpinner size="md" message="Loading projects..." />
          )}

          {/* Empty */}
          {!isLoading && !filteredProjects.length && (
            <EmptyState
              title={searchTerm ? "No matching projects" : "No projects yet"}
              message={
                searchTerm
                  ? `No projects found for "${searchTerm}". Try a different search.`
                  : "Create your first project to get started tracking work."
              }
              onAction={searchTerm ? undefined : () => setShowCreateModal(true)}
              actionLabel="New Project"
            />
          )}

          {/* Rows */}
          {filteredProjects.map((project) => (
            <ProjectRow
              key={project.id}
              project={project}
              onNavigate={handleNavigate}
              onDelete={setDeleteConfirm}
              onStatusChange={handleStatusChange}
            />
          ))}
        </div>
      </div>

      {deleteConfirm && (
        <DeleteModal
          onCancel={() => setDeleteConfirm(null)}
          onConfirm={handleConfirmDelete}
        />
      )}

      <ProjectForm
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        project={null}
        onSuccess={() => { fetchProjects(); setShowCreateModal(false); }}
      />
    </div>
  );
}
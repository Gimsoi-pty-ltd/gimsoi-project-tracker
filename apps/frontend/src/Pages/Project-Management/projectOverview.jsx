import { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Trash2, Edit2, CheckCircle2, Clock, ChevronRight, Users, Calendar, Zap } from "lucide-react";
import ProjectForm from "../../Components/ProjectForm/ProjectForm";
import { useProjectStore } from "../../store/projectStore";
import EmptyState from "../../Components/EmptyState";
import ErrorAlert from "../../Components/ErrorAlert";
import LoadingSpinner from "../../Components/LoadingSpinner";
import NavyButton from "../../Components/Buttons";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  ACTIVE:    { label: "Active",   dot: "bg-blue-500",    badge: "bg-blue-50 text-blue-700 border-blue-200"         },
  COMPLETED: { label: "Complete", dot: "bg-emerald-500", badge: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  "ON HOLD": { label: "On Hold",  dot: "bg-orange-400",  badge: "bg-orange-50 text-orange-700 border-orange-200"   },
  ON_HOLD:   { label: "On Hold",  dot: "bg-orange-400",  badge: "bg-orange-50 text-orange-700 border-orange-200"   },
  DRAFT:     { label: "Draft",    dot: "bg-gray-400",    badge: "bg-gray-50 text-gray-700 border-gray-200"          },
  PLANNED:   { label: "Planned",  dot: "bg-purple-400",  badge: "bg-purple-50 text-purple-700 border-purple-200"   },
};
const getStatusCfg = (status) =>
  STATUS_CONFIG[(status || "DRAFT").toUpperCase()] || STATUS_CONFIG.DRAFT;

const MILESTONE_CONFIG = {
  Done:        { icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-50" },
  "In Progress": { icon: Clock,      color: "text-blue-500",    bg: "bg-blue-50"    },
  Upcoming:    { icon: ChevronRight, color: "text-gray-400",    bg: "bg-gray-100"   },
};

const AVATAR_COLORS = [
  "bg-blue-500", "bg-emerald-500", "bg-purple-500",
  "bg-orange-400", "bg-pink-500", "bg-teal-500",
];

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, color = "text-gray-900" }) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">{label}</p>
      <p className={`text-3xl font-bold ${color}`}>{value ?? 0}</p>
    </div>
  );
}

// ─── Delete Modal ─────────────────────────────────────────────────────────────
function DeleteModal({ projectName, onCancel, onConfirm, isLoading }) {
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6">
        <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mb-4">
          <Trash2 className="w-5 h-5 text-red-500" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-1">Delete Project</h3>
        <p className="text-gray-500 text-sm mb-1">
          Are you sure you want to delete{" "}
          <span className="font-semibold text-gray-700">"{projectName}"</span>?
        </p>
        <p className="text-gray-400 text-xs mb-6">This action cannot be undone.</p>
        <div className="flex gap-3">
          <NavyButton
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-gray-700 font-medium text-sm transition-colors disabled:opacity-50"
          >
            Cancel
          </NavyButton>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 text-sm transition-colors disabled:opacity-50"
          >
            {isLoading ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function ProjectOverview() {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    currentProject, projectProgress, isLoading, error,
    getProjectById, getProjectProgress, deleteProject, clearError,
  } = useProjectStore();

  const [showEditForm, setShowEditForm]     = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading]   = useState(false);

  useEffect(() => {
    if (id) {
      getProjectById(id);
      getProjectProgress(id);
    }
  }, [id, getProjectById, getProjectProgress]);

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      await deleteProject(currentProject.id);
      navigate("/projects");
    } catch (err) {
      console.error("Delete failed:", err);
      setDeleteLoading(false);
    }
  };

  // ── Full-page loading (first load) ──
  if (isLoading && !currentProject) {
    return (
      <div className="min-h-screen bg-[#f5f7fb]">
        <LoadingSpinner size="lg" message="Loading project..." />
      </div>
    );
  }

  // ── Error state ──
  if (error && !currentProject) {
    return (
      <div className="min-h-screen bg-[#f5f7fb] flex items-center justify-center p-6">
        <div className="max-w-md w-full space-y-4">
          <ErrorAlert
            message={error}
            type="error"
            onDismiss={clearError}
            actions={[
              { label: "Retry", onClick: () => { clearError(); getProjectById(id); } },
              { label: "Back to Projects", onClick: () => navigate("/projects") },
            ]}
          />
        </div>
      </div>
    );
  }

  // ── Not found ──
  if (!currentProject) {
    return (
      <div className="min-h-screen bg-[#f5f7fb] flex items-center justify-center p-6">
        <EmptyState
          title="Project not found"
          message="This project may have been deleted or you don't have access to it."
          onAction={() => navigate("/projects")}
          actionLabel="Back to Projects"
        />
      </div>
    );
  }

  const p   = currentProject;
  const prog = projectProgress;
  const cfg  = getStatusCfg(p.status);

  const pct = prog?.totalTasks > 0
    ? Math.round((prog.completedTasks / prog.totalTasks) * 100)
    : (p.progress || 0);

  const progressBarColor =
    pct >= 100 ? "bg-emerald-500" : pct >= 60 ? "bg-blue-500" : "bg-orange-400";

  return (
    <div className="min-h-screen bg-[#f5f7fb] font-sans">
      <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">

        {/* ── Back + Title ── */}
        <div>
          <Link
            to="/projects"
            className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-blue-600 transition-colors mb-3"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Projects
          </Link>

          <div className="flex items-start justify-between flex-wrap gap-3">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{p.name}</h1>
              {p.client && (
                <p className="text-sm text-gray-400 mt-0.5">
                  Client:{" "}
                   <span className="text-gray-600 font-medium">
                    {typeof p.client === 'object'
                      ? p.client?.name
                      : p.client
                    }
                    </span>
                </p>
              )}
            </div>

            {/* Action buttons using NavyButton + plain red */}
            <div className="flex items-center gap-2">
              <NavyButton
                onClick={() => setShowEditForm(true)}
                className="!min-w-0 !px-4 !py-2 !rounded-xl flex items-center gap-2 !text-sm"
              >
                <Edit2 className="w-4 h-4" />
                Edit Project
              </NavyButton>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 hover:border-red-200 transition-colors shadow-sm"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          </div>
        </div>

        {/* ── Inline error (non-blocking) ── */}
        {error && (
          <ErrorAlert
            message={error}
            type="error"
            onDismiss={clearError}
            actions={[{ label: "Retry", onClick: () => getProjectById(id) }]}
          />
        )}

        {/* ── Project Header Card ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex flex-wrap items-center gap-3 mb-5">
            <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold border ${cfg.badge}`}>
              <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
              Status: {cfg.label}
            </span>

            {p.deadline && (
              <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-full text-sm text-gray-600">
                <Calendar className="w-3.5 h-3.5 text-gray-400" />
                Deadline: {p.deadline}
              </span>
            )}

            {p.sprint && (
              <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-full text-sm text-gray-600">
                <Zap className="w-3.5 h-3.5 text-gray-400" />
                {p.sprint}
              </span>
            )}
          </div>

          {p.description && (
            <p className="text-sm text-gray-500 mb-5 leading-relaxed">{p.description}</p>
          )}

          {/* Progress bar */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-gray-700">Progress Bar:</span>
              <span className="text-sm font-bold text-gray-600">{pct}%</span>
            </div>
            <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${progressBarColor}`}
                style={{ width: `${Math.min(pct, 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* ── Task Stats ── */}
        {prog ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard label="Total Tasks"  value={prog.totalTasks}      color="text-gray-900"    />
            <StatCard label="Completed"    value={prog.completedTasks}  color="text-emerald-600" />
            <StatCard label="In Progress"  value={prog.inProgressTasks} color="text-blue-600"    />
            <StatCard label="Blocked"      value={prog.blockedTasks}    color="text-orange-500"  />
          </div>
        ) : !isLoading && (
          <EmptyState
            title="No task data yet"
            message="Tasks will appear here once they are added to this project."
          />
        )}

        {/* ── Milestones ── */}
        {p.milestones?.length > 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-5">
              Milestones (Timeline View)
            </h2>
            <div className="space-y-3">
              {p.milestones.map((m, i) => {
                const mc   = MILESTONE_CONFIG[m.status] || MILESTONE_CONFIG.Upcoming;
                const Icon = mc.icon;
                return (
                  <div key={i} className="flex items-center gap-4">
                    <div className={`w-7 h-7 rounded-full ${mc.bg} flex items-center justify-center flex-shrink-0`}>
                      <Icon className={`w-4 h-4 ${mc.color}`} />
                    </div>
                    <div className="flex-1 flex items-center justify-between flex-wrap gap-2">
                      <span className="text-sm font-medium text-gray-800">
                        {m.label}
                        <span className={`ml-2 text-xs font-semibold ${mc.color}`}>— {m.status}</span>
                      </span>
                      {m.date && (
                        <span className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded-lg border border-gray-100">
                          {m.date}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-2">
              Milestones (Timeline View)
            </h2>
            <EmptyState
              title="No milestones yet"
              message="Add milestones to track key project phases."
            />
          </div>
        )}

        {/* ── Sprint Details ── */}
        {(p.sprint || p.sprintGoal) && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-4">
              Current Sprint
            </h2>
            <div className="space-y-2 text-sm text-gray-600">
              {p.sprint      && <p><span className="font-semibold text-gray-800">Sprint:</span> {p.sprint}</p>}
              {p.sprintGoal  && <p><span className="font-semibold text-gray-800">Goal:</span> {p.sprintGoal}</p>}
              {prog          && (
                <p>
                  <span className="font-semibold text-gray-800">Tasks:</span>{" "}
                  {prog.completedTasks}/{prog.totalTasks} completed
                </p>
              )}
            </div>
          </div>
        )}

        {/* ── Team Members ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Users className="w-4 h-4" />
            Team Members
          </h2>

          {p.team?.length > 0 ? (
            <div className="flex flex-wrap gap-3">
              {p.team.map((member, i) => {
                const [name, role] = (member || "").split("(");
                const initials = (name || "?")
                  .trim().split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
                return (
                  <div key={i} className="flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl">
                    <div className={`w-7 h-7 rounded-full ${AVATAR_COLORS[i % AVATAR_COLORS.length]} flex items-center justify-center text-white text-xs font-bold`}>
                      {initials}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">{name?.trim()}</p>
                      {role && <p className="text-xs text-gray-400">{role.replace(")", "").trim()}</p>}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyState
              title="No team members assigned"
              message="Edit the project to assign team members."
              onAction={() => setShowEditForm(true)}
              actionLabel="Edit Project"
            />
          )}
        </div>

      </div>

      {/* ── Modals ── */}
      {showDeleteModal && (
        <DeleteModal
          projectName={p.name}
          onCancel={() => setShowDeleteModal(false)}
          onConfirm={handleDelete}
          isLoading={deleteLoading}
        />
      )}

      <ProjectForm
        isOpen={showEditForm}
        onClose={() => setShowEditForm(false)}
        project={currentProject}
        onSuccess={() => { setShowEditForm(false); if (id) getProjectById(id); }}
      />
    </div>
  );
}
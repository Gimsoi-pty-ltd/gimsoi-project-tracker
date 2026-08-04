import React from 'react';

export default function TaskForm({
  formData,
  setFormData,
  userOptions = [],
  parentTaskOptions = [],
  sprintOptions = [],
  phaseOptions = [],
}) {
  const toggleSelection = (field, value) => {
    setFormData((prev) => {
      const current = prev[field] || [];
      return {
        ...prev,
        [field]: current.includes(value)
          ? current.filter((item) => item !== value)
          : [...current, value],
      };
    });
  };

  const safeOwnerIds = Array.isArray(formData?.ownerIds)
    ? formData.ownerIds
    : [];
  const safeTeamIds = Array.isArray(formData?.teamIds)
    ? formData.teamIds
    : [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

      {/* Left Column */}
      <div className="space-y-4">

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Title *
          </label>
          <input
            type="text"
            required
            className="w-full border border-gray-300 rounded-lg p-2.5 text-sm"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            className="w-full border border-gray-300 rounded-lg p-2.5 text-sm h-24"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              className="w-full border border-gray-300 rounded-lg p-2.5 text-sm bg-white"
              value={formData.status}
              onChange={(e) =>
                setFormData({ ...formData, status: e.target.value })
              }
            >
              <option value="TODO">To Do</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="BLOCKED">Blocked</option>
              <option value="DONE">Done</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Priority
            </label>
            <select
              className="w-full border border-gray-300 rounded-lg p-2.5 text-sm bg-white"
              value={formData.priority}
              onChange={(e) =>
                setFormData({ ...formData, priority: e.target.value })
              }
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="URGENT">Urgent</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Due Date
            </label>
            <input
              type="date"
              className="w-full border border-gray-300 rounded-lg p-2.5 text-sm"
              value={formData.dueDate}
              onChange={(e) =>
                setFormData({ ...formData, dueDate: e.target.value })
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Story Points
            </label>
            <input
              type="number"
              min="0"
              placeholder="e.g. 5"
              className="w-full border border-gray-300 rounded-lg p-2.5 text-sm"
              value={formData.storyPoints}
              onChange={(e) =>
                setFormData({ ...formData, storyPoints: e.target.value })
              }
            />
          </div>
        </div>

      </div>

      {/* Right Column */}
      <div className="space-y-4">

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sprint
            </label>
            <select
              className="w-full border border-gray-300 rounded-lg p-2.5 text-sm bg-white"
              value={formData.sprintId || ''}
              onChange={(e) =>
                setFormData({ ...formData, sprintId: e.target.value || null })
              }
            >
              <option value="">No sprint (backlog)</option>
              {sprintOptions.map((sprint) => (
                <option key={sprint.id} value={sprint.id}>
                  {sprint.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phase
            </label>
            <select
              className="w-full border border-gray-300 rounded-lg p-2.5 text-sm bg-white"
              value={formData.phaseId || ''}
              onChange={(e) =>
                setFormData({ ...formData, phaseId: e.target.value || null })
              }
            >
              <option value="">No phase</option>
              {phaseOptions.map((phase) => (
                <option key={phase.id} value={phase.id}>
                  {phase.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Parent Task
          </label>
          <select
            className="w-full border border-gray-300 rounded-lg p-2.5 text-sm bg-white"
            value={formData.parentTaskId}
            onChange={(e) =>
              setFormData({ ...formData, parentTaskId: e.target.value })
            }
          >
            <option value="">None</option>
            {parentTaskOptions.map((taskItem) => (
              <option key={taskItem.id} value={taskItem.id}>
                {taskItem.title}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Assignee
          </label>
          <select
            className="w-full border border-gray-300 rounded-lg p-2.5 text-sm bg-white"
            value={formData.assigneeId}
            onChange={(e) =>
              setFormData({ ...formData, assigneeId: e.target.value })
            }
          >
            <option value="">Unassigned</option>
            {userOptions.map((user) => (
              <option key={user.id} value={user.id}>
                {user.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Owners
          </label>
          <div className="border border-gray-200 rounded-lg p-3 h-36 overflow-y-auto">
            {userOptions.length === 0 && (
              <p className="text-sm text-gray-500">
                No users available yet.
              </p>
            )}

            {userOptions.map((user) => (
              <label
                key={user.id}
                className="flex items-center gap-2 text-sm py-1"
              >
                <input
                  type="checkbox"
                  checked={safeOwnerIds.includes(user.id)}
                  onChange={() => toggleSelection("ownerIds", user.id)}
                />
                {user.label}
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Team Members
          </label>
          <div className="border border-gray-200 rounded-lg p-3 h-36 overflow-y-auto">
            {userOptions.length === 0 && (
              <p className="text-sm text-gray-500">
                No users available yet.
              </p>
            )}

            {userOptions.map((user) => (
              <label
                key={user.id}
                className="flex items-center gap-2 text-sm py-1"
              >
                <input
                  type="checkbox"
                  checked={safeTeamIds.includes(user.id)}
                  onChange={() => toggleSelection("teamIds", user.id)}
                />
                {user.label}
              </label>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
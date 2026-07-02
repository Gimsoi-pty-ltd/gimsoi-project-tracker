import React, { useState, useEffect } from 'react';
import { useTaskStore } from '../../store/taskStore';
import { useProjectStore } from '../../store/projectStore';
import { X } from 'lucide-react';

const UI_TO_STATUS = {
  todo: 'TODO',
  inProgress: 'IN_PROGRESS',
  done: 'DONE',
  blocked: 'BLOCKED',
  cancelled: 'CANCELLED'
};

const UI_TO_PRIORITY = {
  Critical: 'URGENT',
  High: 'HIGH',
  Medium: 'MEDIUM',
  Low: 'LOW'
};

export default function TaskModal({ isOpen, onClose, task = null }) {
  const createTask = useTaskStore(state => state.createTask);
  const updateTask = useTaskStore(state => state.updateTask);
  const currentProject = useProjectStore(state => state.currentProject);
  const activeSprint = useProjectStore(state => state.activeSprint);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'TODO',
    priority: 'MEDIUM',
    dueDate: '',
    storyPoints: ''
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || '',
        description: task.description || '',
        status: UI_TO_STATUS[task.status] || task.status || 'TODO',
        priority: UI_TO_PRIORITY[task.priority] || task.priority || 'MEDIUM',
        dueDate: task.dueDate && task.dueDate !== '—' ? new Date(task.dueDate).toISOString().split('T')[0] : '',
        storyPoints: task.storyPoints !== undefined && task.storyPoints !== null ? String(task.storyPoints) : ''
      });
    } else {
      setFormData({
        title: '',
        description: '',
        status: 'TODO',
        priority: 'MEDIUM',
        dueDate: '',
        storyPoints: ''
      });
    }
  }, [task, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentProject) {
        setError("No project selected.");
        return;
    }
    setIsSubmitting(true);
    setError('');
    try {
      const taskData = {
        ...formData,
        projectId: currentProject.id,
        sprintId: activeSprint?.id || null,
        storyPoints: formData.storyPoints ? Number(formData.storyPoints) : null
      };
      
      if (!taskData.dueDate) {
          taskData.dueDate = null;
      } else {
          taskData.dueDate = new Date(taskData.dueDate).toISOString();
      }
      
      if (task) {
        // Edit mode
        const updateData = {
          title: taskData.title,
          description: taskData.description || null,
          status: taskData.status,
          priority: taskData.priority,
          dueDate: taskData.dueDate,
          storyPoints: taskData.storyPoints,
          version: task.version,
        };
        await updateTask(task.id, updateData);
      } else {
        // Create mode
        await createTask(taskData);
      }
      
      // Refresh dashboard state to update charts immediately
      await useProjectStore.getState().fetchDashboard();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to save task');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-800">{task ? 'Edit Task' : 'Create New Task'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-200">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
              <input
                type="text"
                required
                className="w-full border border-gray-300 rounded-lg p-2.5 text-sm"
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                className="w-full border border-gray-300 rounded-lg p-2.5 text-sm h-24"
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  className="w-full border border-gray-300 rounded-lg p-2.5 text-sm bg-white"
                  value={formData.status}
                  onChange={e => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="TODO">To Do</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="BLOCKED">Blocked</option>
                  <option value="DONE">Done</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <select
                  className="w-full border border-gray-300 rounded-lg p-2.5 text-sm bg-white"
                  value={formData.priority}
                  onChange={e => setFormData({ ...formData, priority: e.target.value })}
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                <input
                  type="date"
                  className="w-full border border-gray-300 rounded-lg p-2.5 text-sm"
                  value={formData.dueDate}
                  onChange={e => setFormData({ ...formData, dueDate: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Story Points</label>
                <input
                  type="number"
                  min="0"
                  placeholder="e.g. 5"
                  className="w-full border border-gray-300 rounded-lg p-2.5 text-sm"
                  value={formData.storyPoints}
                  onChange={e => setFormData({ ...formData, storyPoints: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : (task ? 'Save Changes' : 'Create Task')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

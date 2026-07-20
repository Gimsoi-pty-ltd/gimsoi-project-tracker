import React, { useState, useEffect } from 'react';
import { useTaskStore } from '../../store/taskStore';
import { useProjectStore } from '../../store/projectStore';
import { resourceAPI } from '../../api/api';
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

import TaskForm from '../../Components/Tasks/TaskForm';

export default function TaskModal({ isOpen, onClose, task = null, initialSprintId = null }) {
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
    storyPoints: '',
    parentTaskId: '',
    assigneeId: '',
    ownerIds: [],
    teamIds: []
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userOptions, setUserOptions] = useState([]);
  const [parentTaskOptions, setParentTaskOptions] = useState([]);

  useEffect(() => {
    if (!isOpen || !currentProject?.id) return;

    const fetchOptions = async () => {
      try {
        const [usersRes, tasksRes] = await Promise.all([
          resourceAPI.get('/users'),
          resourceAPI.get(`/tasks?projectId=${currentProject.id}&limit=100`)
        ]);
        const users = usersRes.data.users || usersRes.data.data || [];
        const tasks = tasksRes.data.data || tasksRes.data.tasks || [];
        setUserOptions(users.map((user) => ({
          id: user.id,
          label: user.fullName || user.email || 'Unknown user'
        })));
        setParentTaskOptions(tasks.filter((item) => item.id !== task?.id));
      } catch (err) {
        console.error('Failed to fetch task options:', err);
      }
    };

    fetchOptions();
  }, [isOpen, currentProject?.id, task?.id]);

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || '',
        description: task.description || '',
        status: UI_TO_STATUS[task.status] || task.status || 'TODO',
        priority: UI_TO_PRIORITY[task.priority] || task.priority || 'MEDIUM',
        dueDate: task.dueDate && task.dueDate !== '—' ? new Date(task.dueDate).toISOString().split('T')[0] : '',
        storyPoints: task.storyPoints !== undefined && task.storyPoints !== null ? String(task.storyPoints) : '',
        parentTaskId: task.parentTaskId || '',
        assigneeId: task.assigneeId || '',
        ownerIds: Array.isArray(task.ownerIds) ? task.ownerIds : [],
        teamIds: Array.isArray(task.teamIds) ? task.teamIds : []
      });
    } else {
      setFormData({
        title: '',
        description: '',
        status: 'TODO',
        priority: 'MEDIUM',
        dueDate: '',
        storyPoints: '',
        parentTaskId: '',
        assigneeId: '',
        ownerIds: [],
        teamIds: []
      });
    }
  }, [task, isOpen]);

  if (!isOpen) return null;

  const toggleSelection = (field, value) => {
    setFormData((prev) => {
      const current = prev[field] || [];
      return {
        ...prev,
        [field]: current.includes(value) ? current.filter((item) => item !== value) : [...current, value]
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentProject) {
      setError('No project selected.');
      return;
    }
    setIsSubmitting(true);
    setError('');
    try {
      const taskData = {
        ...formData,
        projectId: currentProject.id,
        sprintId: initialSprintId || activeSprint?.id || null,
        assigneeId: formData.assigneeId || null,
        parentTaskId: formData.parentTaskId || null,
        ownerIds: formData.ownerIds.filter(Boolean),
        teamIds: formData.teamIds.filter(Boolean),
        storyPoints: formData.storyPoints ? Number(formData.storyPoints) : null
      };

      if (!taskData.dueDate) {
        taskData.dueDate = null;
      } else {
        taskData.dueDate = new Date(taskData.dueDate).toISOString();
      }

      if (task) {
        const updateData = {
          title: taskData.title,
          description: taskData.description || null,
          status: taskData.status,
          priority: taskData.priority,
          dueDate: taskData.dueDate,
          storyPoints: taskData.storyPoints,
          parentTaskId: taskData.parentTaskId,
          assigneeId: taskData.assigneeId,
          ownerIds: taskData.ownerIds,
          teamIds: taskData.teamIds,
          version: task.version,
        };
        await updateTask(task.id, updateData);
      } else {
        await createTask(taskData);
      }

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
       <div className="bg-white rounded-2xl shadow-xl w-full max-w-5xl">
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

          <TaskForm formData={formData} setFormData={setFormData} userOptions={userOptions} parentTaskOptions={parentTaskOptions} />

          <div className="mt-8 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 border rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 text-sm font-medium text-white bg-blue-900 hover:bg-blue-600 rounded-lg disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : (task ? 'Save Changes' : 'Create Task')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

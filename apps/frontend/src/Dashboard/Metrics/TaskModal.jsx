import React, { useState, useEffect } from 'react';
import { useTaskStore } from '../../store/taskStore';
import { useProjectStore } from '../../store/projectStore';
import { resourceAPI } from '../../api/api';
import { fetchAllPages } from '../../api/fetchAllPages';
import { X } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { hasPermission } from '../../utils/accessControl';
import { DEPARTMENT_LABELS } from '../../utils/departmentLabels';

const UI_TO_STATUS = {
  todo: 'TODO',
  inProgress: 'IN_PROGRESS',
  review: 'REVIEW',
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

export default function TaskModal({ isOpen, onClose, task = null, initialSprintId = null, onSuccess = null, readOnly = false }) {
  const createTask = useTaskStore(state => state.createTask);
  const updateTask = useTaskStore(state => state.updateTask);
  const currentProject = useProjectStore(state => state.currentProject);
  const activeSprint = useProjectStore(state => state.activeSprint);
  const user = useAuthStore(state => state.user);
  const canManageProjectLabels = hasPermission(user?.role, 'MANAGE_PROJECTS');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'TODO',
    isBlocked: false,
    priority: 'MEDIUM',
    dueDate: '',
    storyPoints: '',
    parentTaskId: '',
    assigneeId: '',
    sprintId: '',
    phaseId: '',
    labelIds: [],
    ownerIds: [],
    teamIds: []
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userOptions, setUserOptions] = useState([]);
  const [parentTaskOptions, setParentTaskOptions] = useState([]);
  const [sprintOptions, setSprintOptions] = useState([]);
  const [phaseOptions, setPhaseOptions] = useState([]);
  const [departmentOptions, setDepartmentOptions] = useState([]);
  const [optionsLoading, setOptionsLoading] = useState(false);
  const [optionsError, setOptionsError] = useState('');
  const [optionsVersion, setOptionsVersion] = useState(0);

  useEffect(() => {
    if (!isOpen || !currentProject?.id) return;

    let cancelled = false;
    const fetchOptions = async () => {
      setOptionsLoading(true);
      setOptionsError('');
      const results = await Promise.allSettled([
        resourceAPI.get(`/projects/${currentProject.id}/members`),
        fetchAllPages('/tasks', { projectId: currentProject.id }),
        fetchAllPages('/sprints', { projectId: currentProject.id }),
        fetchAllPages('/phases', { projectId: currentProject.id }),
        resourceAPI.get(`/projects/${currentProject.id}/labels`),
      ]);

      if (cancelled) return;
      const [membersResult, tasksResult, sprintsResult, phasesResult, labelsResult] = results;
      const failures = [];
      const members = membersResult.status === 'fulfilled'
        ? (membersResult.value.data?.data || [])
        : (failures.push('project members'), []);
      const tasks = tasksResult.status === 'fulfilled'
        ? tasksResult.value.filter((item) => item.id !== task?.id)
        : (failures.push('tasks'), []);
      const sprints = sprintsResult.status === 'fulfilled'
        ? sprintsResult.value
        : (failures.push('sprints'), []);
      const phases = phasesResult.status === 'fulfilled'
        ? phasesResult.value
        : (failures.push('phases'), []);
      let labels = labelsResult.status === 'fulfilled'
        ? (labelsResult.value.data?.data || [])
        : (failures.push('department tags'), []);

      const memberUsers = members
        .map((member) => member.user)
        .filter((member) => member?.id);
      setUserOptions(memberUsers.map((member) => ({
        id: member.id,
        label: member.fullName || member.email || 'Project member',
      })));
      setParentTaskOptions(tasks);
      setSprintOptions(sprints);
      setPhaseOptions(phases);

      if (canManageProjectLabels && labelsResult.status === 'fulfilled') {
        const existingNames = new Set(labels.map((label) => label.name.toLowerCase()));
        const missingDepartments = DEPARTMENT_LABELS.filter((department) => !existingNames.has(department.name.toLowerCase()));
        const createdLabels = await Promise.allSettled(missingDepartments.map((department) =>
          resourceAPI.post('/labels', { projectId: currentProject.id, ...department }),
        ));
        labels = [
          ...labels,
          ...createdLabels
            .filter((result) => result.status === 'fulfilled')
            .map((result) => result.value.data?.data)
            .filter(Boolean),
        ];
      }

      const departmentNames = new Set(DEPARTMENT_LABELS.map((department) => department.name.toLowerCase()));
      setDepartmentOptions(labels.filter((label) => departmentNames.has(label.name.toLowerCase())));
      setOptionsError(failures.length ? `Could not load ${failures.join(', ')}. Retry to load missing options.` : '');
      setOptionsLoading(false);
    };

    fetchOptions();
    return () => { cancelled = true; };
  }, [isOpen, currentProject?.id, task?.id, canManageProjectLabels, optionsVersion]);

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || '',
        description: task.description || '',
        status: UI_TO_STATUS[task.status] || task.status || 'TODO',
        isBlocked: Boolean(task.isBlocked),
        priority: UI_TO_PRIORITY[task.priority] || task.priority || 'MEDIUM',
        dueDate: task.dueDate && task.dueDate !== '—' ? new Date(task.dueDate).toISOString().split('T')[0] : '',
        storyPoints: task.storyPoints !== undefined && task.storyPoints !== null ? String(task.storyPoints) : '',
        parentTaskId: task.parentTaskId || '',
        assigneeId: task.assigneeId || '',
        sprintId: task.sprintId || '',
        phaseId: task.phaseId || '',
        labelIds: Array.isArray(task.labels) ? task.labels.map((label) => label.id).filter(Boolean) : [],
        ownerIds: Array.isArray(task.ownerIds) ? task.ownerIds : [],
        teamIds: Array.isArray(task.teamIds) ? task.teamIds : []
      });
    } else {
      setFormData({
        title: '',
        description: '',
        status: 'TODO',
        isBlocked: false,
        priority: 'MEDIUM',
        dueDate: '',
        storyPoints: '',
        parentTaskId: '',
        assigneeId: '',
        sprintId: initialSprintId || activeSprint?.id || '',
        phaseId: '',
        labelIds: [],
        ownerIds: [],
        teamIds: []
      });
    }
  }, [task, isOpen, initialSprintId, activeSprint?.id]);

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
    if (readOnly) return;
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
        sprintId: formData.sprintId || null,
        phaseId: formData.phaseId || null,
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

      let savedTask;
      if (task) {
        const updateData = {
          title: taskData.title,
          description: taskData.description || null,
          status: taskData.status,
          isBlocked: taskData.isBlocked,
          priority: taskData.priority,
          dueDate: taskData.dueDate,
          storyPoints: taskData.storyPoints,
          parentTaskId: taskData.parentTaskId,
          assigneeId: taskData.assigneeId,
          sprintId: taskData.sprintId,
          phaseId: taskData.phaseId,
          ownerIds: taskData.ownerIds,
          teamIds: taskData.teamIds,
          version: task.version,
        };
        savedTask = await updateTask(task.id, updateData);
      } else {
        savedTask = await createTask(taskData);
      }

      const savedTaskId = task?.id || savedTask?.data?.id || savedTask?.id;
      if (savedTaskId && departmentOptions.length > 0) {
        await resourceAPI.post(`/tasks/${savedTaskId}/labels`, {
          labelIds: formData.labelIds || [],
        });
      }

      await useProjectStore.getState().fetchDashboard();
      if (onSuccess) onSuccess(task ? 'updated' : 'created');
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to save task');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
       <div className="bg-white rounded-2xl shadow-xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b border-gray-100 shrink-0">
          <h2 className="text-xl font-bold text-gray-800">{readOnly ? 'Task details' : task ? 'Edit Task' : 'Create New Task'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="p-6 overflow-y-auto flex-1">
            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-200">
                {error}
              </div>
            )}

            {optionsError && (
              <div role="alert" className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                <span>{optionsError}</span>
                <button type="button" onClick={() => setOptionsVersion((version) => version + 1)} className="font-semibold underline">Retry</button>
              </div>
            )}

            {optionsLoading && <p role="status" className="mb-4 text-sm text-gray-500">Loading project members, tasks, sprints, phases, and tags...</p>}

            <fieldset disabled={readOnly} className="min-w-0 disabled:opacity-100">
              <TaskForm
                formData={formData}
                setFormData={setFormData}
                userOptions={userOptions}
                parentTaskOptions={parentTaskOptions}
                sprintOptions={sprintOptions}
                phaseOptions={phaseOptions}
                departmentOptions={departmentOptions}
              />
            </fieldset>
          </div>

          <div className="flex justify-end gap-3 p-6 border-t border-gray-100 shrink-0">
            {readOnly ? (
              <button type="button" onClick={onClose} className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 border rounded-lg">Close</button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 border rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || optionsLoading || Boolean(optionsError)}
                  className="px-5 py-2.5 text-sm font-medium text-white bg-blue-900 hover:bg-blue-600 rounded-lg disabled:opacity-50"
                >
                  {optionsLoading ? 'Loading options...' : isSubmitting ? 'Saving...' : (task ? 'Save Changes' : 'Create Task')}
                </button>
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
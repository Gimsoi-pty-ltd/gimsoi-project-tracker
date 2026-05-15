import * as projectService from "../services/project.service.js";
import { parsePagination, buildPage } from "../utils/pagination.js";
import { updateProjectSchema, createProjectSchema } from "../schemas/project.schema.js";

export const createProject = async (req, res, next) => {
  try {
    const parseResult = createProjectSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ error: 'Validation failed', details: parseResult.error.flatten() });
    }
    const { name, clientId, status, description } = parseResult.data;

    const project = await projectService.createProject({
      name,
      clientId,
      status: status || 'DRAFT',
      description,
      createdByUserId: req.user.id,
    });

    return res.status(201).json({ success: true, message: "Project created", data: project });
  } catch (err) {
    next(err);
  }
};

export const getProjects = async (req, res, next) => {
  try {
    const { search } = req.query;
    const { limit, cursor } = parsePagination(req.query);

    const records = await projectService.getProjects({ limit, cursor, search, requestingUser: req.user });

    const projectIds = records.map(p => p.id);
    const progressBatch = await projectService.getBatchProjectProgress(projectIds, req.user.role);

    const dataWithProgress = records.map((proj) => {
      const prog = progressBatch[proj.id];
      return { ...proj, percentComplete: prog ? prog.percentComplete : 0 };
    });

    const { data, nextCursor } = buildPage(dataWithProgress, limit);

    return res.status(200).json({ success: true, data, nextCursor });
  } catch (err) {
    next(err);
  }
};

export const getProjectById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const project = await projectService.getProjectById(id);
    if (!project) return res.status(404).json({ success: false, message: "Project not found" });

    return res.status(200).json({ success: true, data: project });
  } catch (err) {
    next(err);
  }
};

export const updateProject = async (req, res, next) => {
  try {
    const { id } = req.params;

    const parseResult = updateProjectSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ error: 'Validation failed', details: parseResult.error.flatten() });
    }
    const validatedData = parseResult.data;

    const updated = await projectService.updateProject(id, validatedData, req.user.id, req.user.role);
    return res.status(200).json({ success: true, message: "Project updated", data: updated });
  } catch (err) {
    next(err);
  }
};

export const getProjectProgress = async (req, res, next) => {
  try {
    const { id } = req.params;
    const progress = await projectService.getProjectProgress(id, req.user.role);

    return res.status(200).json({ success: true, data: progress });
  } catch (err) {
    next(err);
  }
};

export const deleteProject = async (req, res, next) => {
  try {
    const { id } = req.params;
    await projectService.deleteProject(id, req.user.id, req.user.role);

    return res.status(204).send();
  } catch (err) {
    next(err);
  }
};

export const syncProjectAnalytics = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Check if project exists
    const project = await projectService.getProjectById(id);
    if (!project) return res.status(404).json({ success: false, message: "Project not found" });

    const analytics = await projectService.syncProjectAnalytics(id);
    return res.status(200).json({ success: true, message: "Project analytics synced", data: analytics });
  } catch (err) {
    next(err);
  }
};

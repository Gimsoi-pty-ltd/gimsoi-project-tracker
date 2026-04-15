import * as projectService from "../services/project.service.js";
import { parsePagination, buildPage } from "../utils/pagination.js";

export const createProject = async (req, res, next) => {
  try {
    const { name, clientId, status } = req.body;

    if (!name || !clientId) {
      return res.status(400).json({ success: false, message: "Project name and clientId are required" });
    }

    const project = await projectService.createProject({
      name,
      clientId,
      status: status ? status.toUpperCase() : "DRAFT",
      createdByUserId: req.user.id,
    });

    return res.status(201).json({ success: true, message: "Project created", data: project });
  } catch (err) {
    next(err);
  }
};

export const getProjects = async (req, res, next) => {
  try {
    const { limit, cursor } = parsePagination(req.query);

    const records = await projectService.getProjects({ limit, cursor });

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
    const { name, status } = req.body;

    const updated = await projectService.updateProject(id, { name, status }, req.user.id, req.user.role);
    return res.status(200).json({ success: true, message: "Project updated", data: updated });
  } catch (err) {
    next(err);
  }
};

export const getProjectProgress = async (req, res, next) => {
  try {
    const { id } = req.params;
    const progress = await projectService.getProjectProgress(id, req.user.role);
    if (!progress) return res.status(404).json({ success: false, message: "Project not found" });

    return res.status(200).json({ success: true, data: progress });
  } catch (err) {
    next(err);
  }
};

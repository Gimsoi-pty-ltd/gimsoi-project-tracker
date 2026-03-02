import * as projectService from "../services/project.service.js";

export const createProject = async (req, res) => {
  try {
    const { name, clientId, status } = req.body;

    if (!name || !clientId) {
      return res.status(400).json({ message: "Project name and clientId are required" });
    }

    const project = await projectService.createProject({
      name,
      clientId,
      status: status || "Draft",
      createdByUserId: req.user?.id || null,
    });

    return res.status(201).json({ message: "Project created", data: project });
  } catch (err) {
    console.error("createProject error:", err?.message);
    return res.status(500).json({ message: "Failed to create project" });
  }
};

export const getProjects = async (req, res) => {
  try {
    const projects = await projectService.getProjects();
    return res.status(200).json({ data: projects });
  } catch (err) {
    console.error("getProjects error:", err?.message);
    return res.status(500).json({ message: "Failed to fetch projects" });
  }
};

export const getProjectById = async (req, res) => {
  try {
    const { id } = req.params;

    const project = await projectService.getProjectById(id);
    if (!project) return res.status(404).json({ message: "Project not found" });

    return res.status(200).json({ data: project });
  } catch (err) {
    console.error("getProjectById error:", err?.message);
    return res.status(500).json({ message: "Failed to fetch project" });
  }
};

export const updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, status } = req.body;

    const updated = await projectService.updateProject(id, { name, status });
    return res.status(200).json({ message: "Project updated", data: updated });
  } catch (err) {
    console.error("updateProject error:", err?.message);
    return res.status(500).json({ message: "Failed to update project" });
  }
};

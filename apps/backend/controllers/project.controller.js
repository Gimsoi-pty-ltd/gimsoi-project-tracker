import * as projectService from "../services/project.service.js";

export const createProject = async (req, res) => {
  try {
    const { name, clientId, status } = req.body;

    if (!name || !clientId) {
      return res.status(400).json({
        success: false,
         message: "Project name and clientId are required" 
        });
    }

    const project = await projectService.createProject({
      name,
      clientId,
      status: status ? status.toUpperCase() : "DRAFT",
      createdByUserId: req.user?.id || null,
    });

    return res.status(201).json({ 
      success:true,
      message: "Project created",
       data: project
     });
  } catch (err) {
    console.error("createProject error:", err?.message);
    return res.status(500).json({ 
      success: false,
      message: "Failed to create project"
     });
  }
};

export const getProjects = async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 50, 100);
    const cursor = req.query.cursor || undefined;

    const records = await projectService.getProjects({ limit, cursor });

    const dataWithProgress = await Promise.all(records.map(async (proj) => {
      const prog = await projectService.getProjectProgress(proj.id);
      return { ...proj, percentComplete: prog ? prog.percentComplete : 0 };
    }));

    const hasMore = dataWithProgress.length > limit;
    const data = hasMore ? dataWithProgress.slice(0, limit) : dataWithProgress;
    const nextCursor = hasMore ? data[data.length - 1].id : null;

    return res.status(200).json({
       success: true, 
       message: "Projects fetched successfully",
       data, 
       nextCursor });
  } catch (err) {
    console.error("getProjects error:", err?.message);
    return res.status(500).json({ 
      success: false,
       message: "Failed to fetch projects" 
    });
  }
};

export const getProjectById = async (req, res) => {
  try {
    const { id } = req.params;

    const project = await projectService.getProjectById(id);
    if (!project) return res.status(404).json({
      success: false,
       message: "Project not found" 
      });

    return res.status(200).json({
      success: true,
      message: "Project fetched successfully",
       data: project });
  } catch (err) {
    console.error("getProjectById error:", err?.message);
    return res.status(500).json({ 
      success: false,
      message: "Failed to fetch project" 
    });
  }
};

export const updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, status } = req.body;

    const updated = await projectService.updateProject(id, { name, status }, req.user.id, req.user.role);
    return res.status(200).json({
      success: true,
       message: "Project updated", 
       data: updated
       });
  } catch (err) {
    const statusCode = err.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
       message: err.message || "Failed to update project"
       });
  }
};

// POLICY-PENDING: CLIENT role currently receives the full task breakdown.
// If the team decides CLIENT should only see percentComplete, filter the response here.
export const getProjectProgress = async (req, res) => {
  try {
    const { id } = req.params;
    const progress = await projectService.getProjectProgress(id);
    if (!progress) return res.status(404).json({ message: "Project not found" });

    if (req.user?.role === 'CLIENT') {
      return res.status(200).json({ 
        success: false,
        message: "Project not found",
        data: { percentComplete: progress.percentComplete } 
      });
    }

    return res.status(200).json({ 
      success: true,
      message: "Project progress fetched successfully",
      data: progress
     });
  } catch (err) {
    console.error("getProjectProgress error:", err?.message);
    return res.status(500).json({ 
      success: false,
      message: "Failed to fetch project progress" 
    });
  }
};

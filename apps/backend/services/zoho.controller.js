import {
  getZohoPortals,
  getZohoProjects,
  getZohoTasks,
} from "../services/zoho.service.js";

import {
  mapZohoProject,
  mapZohoTask,
} from "../services/zohoMapper.service.js";

export async function fetchZohoPortals(req, res) {
  try {
    const data = await getZohoPortals();

    return res.status(200).json({
      success: true,
      message: "Zoho portals fetched successfully",
      data,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch Zoho portals",
    });
  }
}

export async function fetchZohoProjects(req, res) {
  try {
    const { portalId } = req.params;

    const data = await getZohoProjects(portalId);
    const projects = data.projects || [];

    return res.status(200).json({
      success: true,
      message: "Zoho projects fetched successfully",
      data: projects.map(mapZohoProject),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch Zoho projects",
    });
  }
}

export async function fetchZohoTasks(req, res) {
  try {
    const { portalId, projectId } = req.params;

    const data = await getZohoTasks(portalId, projectId);
    const tasks = data.tasks || [];

    return res.status(200).json({
      success: true,
      message: "Zoho tasks fetched successfully",
      data: tasks.map((task) => mapZohoTask(task, projectId)),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch Zoho tasks",
    });
  }
}

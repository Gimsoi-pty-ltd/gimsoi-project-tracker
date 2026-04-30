import { getZohoAccessToken } from "./zohoAuth.service.js";

const ZOHO_PROJECTS_API_BASE_URL =
  process.env.ZOHO_PROJECTS_API_BASE_URL || "https://projectsapi.zoho.com/restapi";

async function zohoRequest(path) {
  const accessToken = await getZohoAccessToken();

  const response = await fetch(`${ZOHO_PROJECTS_API_BASE_URL}${path}`, {
    method: "GET",
    headers: {
      Authorization: `Zoho-oauthtoken ${accessToken}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.error?.message || "Zoho API request failed");
  }

  return data;
}

export async function getZohoPortals() {
  return zohoRequest("/portals/");
}

export async function getZohoProjects(portalId) {
  if (!portalId) {
    throw new Error("portalId is required");
  }

  return zohoRequest(`/portal/${portalId}/projects/`);
}

export async function getZohoTasks(portalId, projectId) {
  if (!portalId || !projectId) {
    throw new Error("portalId and projectId are required");
  }

  return zohoRequest(`/portal/${portalId}/projects/${projectId}/tasks/`);
}

import axiosInstance from "./API";
// GET /api/projects
export const getProjects = async () => {
const response = await axiosInstance.get("/projects");
return response.data;
};
// GET /api/projects/:id
export const getProjectById = async (id) => {
const response = await axiosInstance.get(`/projects/${id}`);
return response.data;
};
// GET /api/projects/:id/progress
export const getProjectProgress = async (id) => {
const response = await axiosInstance.get(`/projects/${id}/progress`);
return response.data;
};
// POST /api/projects
export const createProject = async (projectData) => {
const response = await axiosInstance.post("/projects", projectData);
return response.data;
};
//// PATCH /api/projects/:id
export const updateProject = async (id, projectData) => {
const response = await axiosInstance.patch(`/projects/${id}`, projectData);
return response.data;
}; 


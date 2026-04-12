import axiosInstance from "./API";
// GET /api/sprints
export const getSprints = async () => {
const response = await axiosInstance.get("/sprints");
return response.data;
};
// POST /api/sprints
export const createSprint = async (sprintData) => {
const response = await axiosInstance.post("/sprints", sprintData);
return response.data;
};
// PATCH /api/sprints/:id
export const updateSprint = async (id, sprintData) => {
const response = await axiosInstance.patch(`/sprints/${id}`, sprintData);
return response.data;
};
// PATCH /api/sprints/:id/status
export const updateSprintStatus = async (id, status) => { const response =
await axiosInstance.patch(`/sprints/${id}/status`, { status });
return response.data;
};
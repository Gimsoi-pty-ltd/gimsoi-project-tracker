import axiosInstance from "./API";
// GET /api/clients
export const getClients = async () => {
const response = await axiosInstance.get("/clients");
return response.data;
};
// GET /api/clients/:id
export const getClientById = async (id) => {
const response = await axiosInstance.get(`/clients/${id}`);
return response.data;
};
// POST /api/clients
export const createClient = async (clientData) => {
const response = await axiosInstance.post("/clients", clientData);
return response.data;
};
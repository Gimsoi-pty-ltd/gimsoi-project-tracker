import * as clientService from "../services/client.service.js";

export const createClient = async (req, res) => {
  try {
    const { name, contactEmail } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: "Client name is required" });
    }

    const client = await clientService.createClient({
      name,
      contactEmail: contactEmail || null,
      createdByUserId: req.user?.id || null,
    });

    return res.status(201).json({ success: true, message: "Client created", data: client });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Failed to create client" });
  }
};

export const getClients = async (req, res) => {
  try {
    const clients = await clientService.getClients();
    return res.status(200).json({ success: true, data: clients });
  } catch (err) {
    console.error("getClients error:", err?.message);
    return res.status(500).json({ success: false, message: "Failed to fetch clients" });
  }
};

export const getClientById = async (req, res) => {
  try {
    const { id } = req.params;

    const client = await clientService.getClientById(id);

    return res.status(200).json({ success: true, data: client });
  } catch (err) {
    const statusCode = err.statusCode || 500;
    console.error("getClientById error:", err?.message);
    return res.status(statusCode).json({ success: false, message: err.message || "Failed to fetch client" });
  }
};

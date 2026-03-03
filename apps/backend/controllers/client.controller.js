import * as clientService from "../services/client.service.js";

export const createClient = async (req, res) => {
  try {
    const { name, contactEmail } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Client name is required" });
    }

    const client = await clientService.createClient({
      name,
      contactEmail: contactEmail || null,
      createdByUserId: req.user?.id || null,
    });

    return res.status(201).json({ message: "Client created", data: client });
  } catch (err) {
    console.error("createClient error:", err?.message);
    return res.status(500).json({ message: "Failed to create client" });
  }
};

export const getClients = async (req, res) => {
  try {
    const clients = await clientService.getClients();
    return res.status(200).json({ data: clients });
  } catch (err) {
    console.error("getClients error:", err?.message);
    return res.status(500).json({ message: "Failed to fetch clients" });
  }
};

export const getClientById = async (req, res) => {
  try {
    const { id } = req.params;

    const client = await clientService.getClientById(id);
    if (!client) return res.status(404).json({ message: "Client not found" });

    return res.status(200).json({ data: client });
  } catch (err) {
    console.error("getClientById error:", err?.message);
    return res.status(500).json({ message: "Failed to fetch client" });
  }
};

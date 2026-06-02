import * as clientService from "../services/client.service.js";
import { parsePagination, buildPage } from "../utils/pagination.js";

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

    return res.status(201).json({ success: true, message: "Client created", data: client });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Failed to create client" });
  }
};

export const getClients = async (req, res) => {
  try {
    const { limit } = parsePagination(req.query);
    const records = await clientService.getClients(req.query);
    const { data, nextCursor } = buildPage(records, limit);
    return res.status(200).json({ success: true, data, nextCursor });
  } catch (err) {
    console.error("getClients error:", err?.message);
    return res.status(500).json({ success: false, message: "Failed to fetch clients" });
  }
};

export const getClientById = async (req, res) => {
  try {
    const { id } = req.params;

    const client = await clientService.getClientById(id);
    if (!client) return res.status(404).json({ success: false, message: "Client not found" });

    return res.status(200).json({ success: true, data: client });
  } catch (err) {
    console.error("getClientById error:", err?.message);
    return res.status(500).json({ success: false, message: "Failed to fetch client" });
  }
};

export const updateClient = async (req, res, next) => {
  try {
    const { id } = req.params;
    const client = await clientService.updateClient(id, req.body);
    return res.status(200).json({ success: true, message: "Client updated", data: client });
  } catch (err) {
    next(err);
  }
};

export const deleteClient = async (req, res, next) => {
  try {
    const { id } = req.params;
    await clientService.deleteClient(id);
    return res.status(200).json({ success: true, message: "Client deleted" });
  } catch (err) {
    next(err);
  }
};

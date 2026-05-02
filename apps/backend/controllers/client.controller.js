import * as clientService from "../services/client.service.js";
import { parsePagination, buildPage } from "../utils/pagination.js";

export const createClient = async (req, res, next) => {
  try {
    const { name, contactEmail } = req.body;

    if (!name || !contactEmail) {
      return res.status(400).json({ success: false, message: "Client name and contactEmail are required" });
    }

    const client = await clientService.createClient({
      name,
      contactEmail,
      createdByUserId: req.user.id,
    });

    return res.status(201).json({ success: true, message: "Client created", data: client });
  } catch (err) {
    console.error("createClient error:", err);
    next(err);
  }
};

export const getClients = async (req, res, next) => {
  try {
    const { limit } = parsePagination(req.query);
    const records = await clientService.getClients(req.query);
    const { data, nextCursor } = buildPage(records, limit);
    return res.status(200).json({ success: true, data, nextCursor });
  } catch (err) {
    next(err);
  }
};

export const getClientById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const client = await clientService.getClientById(id);

    return res.status(200).json({ success: true, data: client });
  } catch (err) {
    next(err);
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

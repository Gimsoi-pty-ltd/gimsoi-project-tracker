import * as clientService from "../services/client.service.js";

export const createClient = async (req, res, next) => {
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
    console.error("createClient error:", err);
    next(err);
  }
};

export const getClients = async (req, res, next) => {
  try {
    const clients = await clientService.getClients();
    return res.status(200).json({ success: true, data: clients });
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

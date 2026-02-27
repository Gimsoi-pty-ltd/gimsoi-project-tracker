export function validateCreateTask(req, res, next) {
  const { title } = req.body ?? {};

  if (typeof title !== "string") {
    return res.status(400).json({ error: "Invalid payload: title must be a string" });
  }
  if (title.trim().length < 1) {
    return res.status(400).json({ error: "Invalid payload: title is required" });
  }
  if (title.length > 200) {
    return res.status(400).json({ error: "Invalid payload: title too long" });
  }
  next();
}

export function validateUpdateTask(req, res, next) {
  const body = req.body ?? {};
  const allowed = ["title", "status", "priority", "dueDate"];
  const keys = Object.keys(body);

  if (keys.length === 0) {
    return res.status(400).json({ error: "Invalid payload: body required" });
  }

  // Reject unknown fields (blocks “invalid payloads” + role escalation style junk)
  const unknown = keys.filter((k) => !allowed.includes(k));
  if (unknown.length) {
    return res.status(400).json({ error: `Invalid payload: unknown fields: ${unknown.join(", ")}` });
  }

  if ("title" in body) {
    if (typeof body.title !== "string") {
      return res.status(400).json({ error: "Invalid payload: title must be a string" });
    }
    if (body.title.length > 200) {
      return res.status(400).json({ error: "Invalid payload: title too long" });
    }
  }

  if ("status" in body && typeof body.status !== "string") {
    return res.status(400).json({ error: "Invalid payload: status must be a string" });
  }

  next();
}

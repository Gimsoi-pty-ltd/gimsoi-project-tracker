
import * as sprintService from "../services/sprintService.js";

export async function createSprint(req, res) {
    const sprint = await sprintService.createSprint(req.body);
    res.json(sprint);
}

export async function getSprintById(req, res) {
    const sprint = await sprintService.getSprintWithProgress(req.params.id);
    res.json(sprint);
};


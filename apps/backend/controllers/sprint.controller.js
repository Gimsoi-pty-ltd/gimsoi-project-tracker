
import * as sprintService from "../services/sprintService.js";

export async function createSprint(req, res) {
    try{
    const sprint = await sprintService.createSprint(req.body);
    res.json(sprint);
    }catch(error) {
        res.status(500).json({ error: error.message });
    }
}

export async function getSprintById(req, res) {
    try{
    const sprint = await sprintService.getSprintWithProgress(req.params.id);
    res.json(sprint);
    }catch(error) {
        res.status(500).json({ error: error.message });
    }
};

export async function updateSprint(req, res) {
    try{
        const sprint = await sprintService.updateSprint(req.params.id, req.body);
        res.json(sprint);
    } catch(error) {
        res.status(500).json({ error: error.message });
    }
};


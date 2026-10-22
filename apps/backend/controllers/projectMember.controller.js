import * as projectMemberService from "../services/projectMember.service.js";

export const addMember = async (req, res, next) => {
    try {
        const { id: projectId } = req.params;
        
        const member = await projectMemberService.addMember({
            projectId,
            ...req.body
        });
        
        res.status(201).json({
            status: "success",
            data: member
        });
    } catch (err) {
        next(err);
    }
};

export const getMembers = async (req, res, next) => {
    try {
        const { id: projectId } = req.params;
        const members = await projectMemberService.getMembersByProject(projectId);
        
        res.json({
            status: "success",
            data: members
        });
    } catch (err) {
        next(err);
    }
};

export const updateMemberRole = async (req, res, next) => {
    try {
        const { id: projectId, userId } = req.params;
        
        const member = await projectMemberService.updateMemberRole({
            projectId,
            userId,
            ...req.body
        });
        
        res.json({
            status: "success",
            data: member
        });
    } catch (err) {
        next(err);
    }
};

export const removeMember = async (req, res, next) => {
    try {
        const { id: projectId, userId } = req.params;
        await projectMemberService.removeMember({ projectId, userId });
        
        res.status(204).send();
    } catch (err) {
        next(err);
    }
};

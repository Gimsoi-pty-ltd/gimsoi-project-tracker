import * as commentService from "../services/comment.service.js";
import { createCommentSchema } from "../schemas/comment.schema.js";

export const createComment = async (req, res, next) => {
    try {
        const { taskId } = req.params;
        const validated = createCommentSchema.parse(req.body);
        
        const comment = await commentService.createComment({
            taskId,
            userId: req.user.id,
            userRole: req.user.role,
            content: validated.content
        });
        
        res.status(201).json({
            status: "success",
            data: comment
        });
    } catch (err) {
        next(err);
    }
};

export const getComments = async (req, res, next) => {
    try {
        const { taskId } = req.params;
        const comments = await commentService.getCommentsByTask(taskId, req.user.id, req.user.role);
        
        res.json({
            status: "success",
            data: comments
        });
    } catch (err) {
        next(err);
    }
};

export const deleteComment = async (req, res, next) => {
    try {
        const { id } = req.params;
        await commentService.deleteComment(id, req.user.id, req.user.role);
        
        res.status(204).send();
    } catch (err) {
        next(err);
    }
};

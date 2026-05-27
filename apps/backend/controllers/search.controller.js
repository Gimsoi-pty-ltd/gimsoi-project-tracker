import { z } from 'zod';
import { globalSearch } from '../services/search.service.js';

export const searchSchema = z.object({
    q: z.string().min(1, 'Search query is required'),
    type: z.enum(['all', 'project', 'task', 'user']).optional().default('all')
});

export const searchHandler = async (req, res, next) => {
    try {
        // Data is already validated and attached to req.query by the validate middleware
        const { q, type } = req.query;
        const results = await globalSearch(q, type);
        return res.status(200).json({ success: true, data: results });
    } catch (err) {
        next(err);
    }
};

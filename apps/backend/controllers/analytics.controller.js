import { getTeamPerformance } from '../services/analytics.service.js';
import { buildPage } from '../utils/pagination.js';

export const getTeamPerformanceHandler = async (req, res, next) => {
    try {
        const { limit, cursor } = req.query;
        const records = await getTeamPerformance({ limit, cursor });
        
        const { data, nextCursor } = buildPage(records, limit);
        
        return res.status(200).json({ success: true, data, nextCursor });
    } catch (err) {
        next(err);
    }
};

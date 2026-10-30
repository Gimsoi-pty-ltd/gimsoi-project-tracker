import { asyncHandler } from "../middleware/async-handler.middleware.js";
import { recommendEmployees } from "../services/employeeRecommendation.service.js";

export const getEmployeeRecommendations = asyncHandler(async (req, res) => {
    const { id: projectId } = req.params;

    const limit = Math.min(
        Math.max(parseInt(req.query.limit, 10) || 5, 1),
        20
    );

    const recommendations = await recommendEmployees({
        projectId,
        userId: req.user.id,
        userRole: req.user.role,
        limit,
    });

    return res.status(200).json({
        success: true,
        message: "Employee recommendations retrieved successfully.",
        data: recommendations,
    });
});
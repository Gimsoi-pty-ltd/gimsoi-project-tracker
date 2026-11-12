
import { asyncHandler } from "../middleware/async-handler.middleware.js";
import { NotFoundError } from "../utils/errors.js";
import { getMyWorkload } from "../services/workload.service.js";

export const getMyWorkloadController = asyncHandler(
  async (req, res) => {
    const data = await getMyWorkload(req.user.id);

    if (!data) {
      throw new NotFoundError("Employee not found.");
    }

    return res.status(200).json({
      success: true,
      data,
    });
  }
);

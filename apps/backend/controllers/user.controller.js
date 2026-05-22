import * as userService from '../services/user.service.js';
import { adminCreateUserSchema, updateUserRoleSchema, updateProfileSchema } from '../schemas/user.schema.js';
import { ValidationError, ForbiddenError } from '../utils/errors.js';

/**
 * Admin: Get paginated users list.
 */
export const getUsers = async (req, res, next) => {
  try {
    const { data, nextCursor } = await userService.getUsers(req.query);
    return res.status(200).json({ success: true, data, nextCursor });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin: Create a new user.
 */
export const adminCreateUser = async (req, res, next) => {
  try {
    const validatedData = adminCreateUserSchema.parse(req.body);
    const user = await userService.adminCreateUser(validatedData);
    return res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: user,
    });
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ success: false, message: error.errors[0].message });
    }
    next(error);
  }
};

/**
 * Admin: Update a user's role.
 * Prevents self-demotion or role changes for the current user.
 */
export const updateUserRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    const validatedData = updateUserRoleSchema.parse(req.body);

    if (id === req.user.id) {
      throw new ForbiddenError('You cannot change your own role');
    }

    const user = await userService.updateUserRole(id, validatedData.role);
    return res.status(200).json({
      success: true,
      message: 'User role updated successfully',
      data: user,
    });
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ success: false, message: error.errors[0].message });
    }
    next(error);
  }
};

/**
 * Self: Update current user profile.
 */
export const updateProfile = async (req, res, next) => {
  try {
    const validatedData = updateProfileSchema.parse(req.body);
    const user = await userService.updateProfile(req.user.id, validatedData);
    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: user,
    });
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ success: false, message: error.errors[0].message });
    }
    next(error);
  }
};

/**
 * Self: Upload and update avatar.
 * Converts buffer to Data URI for MVP storage.
 */
export const updateAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      throw new ValidationError('No file uploaded');
    }

    // Convert buffer to Data URI for MVP
    const b64 = req.file.buffer.toString('base64');
    const dataUri = `data:${req.file.mimetype};base64,${b64}`;

    const user = await userService.updateAvatarUrl(req.user.id, dataUri);
    
    return res.status(200).json({
      success: true,
      message: 'Avatar updated successfully',
      data: { avatarUrl: user.avatarUrl },
    });
  } catch (error) {
    next(error);
  }
};

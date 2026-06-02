import prisma from '../lib/prisma.js';
import bcryptjs from 'bcryptjs';
import pkg from '../lib/generated/prisma/index.js';
const { Prisma } = pkg;
import { NotFoundError, ConflictError, ValidationError } from '../utils/errors.js';
import { parsePagination, buildPage } from '../utils/pagination.js';

const BCRYPT_SALT_ROUNDS = 10;

// Fields safe to return from any user query — never include password or token fields.
const SAFE_USER_SELECT = {
  id: true,
  email: true,
  fullName: true,
  role: true,
  avatarUrl: true,
  bio: true,
  isVerified: true,
  lastLogin: true,
  createdAt: true,
  updatedAt: true,
  version: true,
};

/**
 * Returns a paginated list of all users.
 * Cursor-based: pass the last returned user id as `cursor` to get the next page.
 * Fetches limit+1 so buildPage can detect if there are more records.
 *
 * @param {object} query — req.query (limit, cursor)
 * @returns {{ data: User[], nextCursor: string | null }}
 */
export const getUsers = async (query) => {
  const { limit, cursor } = parsePagination(query);

  const users = await prisma.user.findMany({
    take: limit + 1,
    ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
    orderBy: { createdAt: 'desc' },
    select: SAFE_USER_SELECT,
  });

  return buildPage(users, limit);
};

/**
 * Admin creates a new user with an explicit role.
 * Bypasses the INTERN default from self-registration.
 * Does NOT send a verification email — admin-created accounts are marked isVerified:true.
 *
 * @param {{ email: string, password: string, fullName: string, role: string }} data
 * @returns {User}
 */
export const adminCreateUser = async ({ email, password, fullName, role }) => {
  try {
    const hashedPassword = await bcryptjs.hash(password, BCRYPT_SALT_ROUNDS);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        fullName,
        role,
        // Admin-created accounts are pre-verified; no verification email loop.
        isVerified: true,
      },
      select: SAFE_USER_SELECT,
    });

    return user;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      // email is the only @unique field on User
      throw new ConflictError('A user with this email already exists');
    }
    throw error;
  }
};

/**
 * Admin updates the role of an existing user.
 * Cannot demote or change the role of the calling admin via this function —
 * that guard is enforced at the controller layer.
 *
 * @param {string} userId
 * @param {string} role — must be a valid Role enum value
 * @returns {User}
 */
export const updateUserRole = async (userId, role, version) => {
  try {
    const user = await prisma.user.update({
      where: { id: userId, version },
      data: { 
        role,
        version: { increment: 1 }
      },
      select: SAFE_USER_SELECT,
    });

    return user;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      throw new ConflictError('User was modified by another user or not found. Please refresh and try again.');
    }
    throw error;
  }
};

/**
 * Authenticated user updates their own profile.
 * Only fullName and email are editable via self-service.
 * Email uniqueness is enforced by the @unique constraint on User.email.
 *
 * @param {string} userId
 * @param {{ fullName?: string, email?: string }} data
 * @returns {User}
 */
export const updateProfile = async (userId, data) => {
  try {
    const { version, ...updateData } = data;
    const user = await prisma.user.update({
      where: { id: userId, version },
      data: {
        ...updateData,
        version: { increment: 1 }
      },
      select: SAFE_USER_SELECT,
    });

    return user;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      throw new ConflictError('User was modified by another user or not found. Please refresh and try again.');
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      throw new ConflictError('This email address is already in use');
    }
    throw error;
  }
};

/**
 * Updates the avatarUrl field for the authenticated user.
 * Called after the file upload middleware has processed the multipart request.
 *
 * @param {string} userId
 * @param {string} avatarUrl — the URL or path where the uploaded file was stored
 * @returns {User}
 */
export const updateAvatarUrl = async (userId, avatarUrl, version) => {
  try {
    const user = await prisma.user.update({
      where: { id: userId, version: Number(version) },
      data: { 
        avatarUrl,
        version: { increment: 1 }
      },
      select: SAFE_USER_SELECT,
    });

    return user;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      throw new ConflictError('User was modified by another user or not found. Please refresh and try again.');
    }
    throw error;
  }
};

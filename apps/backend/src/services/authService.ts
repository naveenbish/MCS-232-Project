import prisma from '../config/database';
import { hashPassword, comparePassword } from '../utils/password';
import { generateAccessToken } from '../utils/jwt';
import {
  RegisterUserInput,
  LoginInput,
  AdminLoginInput,
  UserResponse,
  AdminResponse,
  AppError,
} from '../types';

/**
 * Register a new user
 */
export const registerUser = async (
  data: RegisterUserInput
): Promise<{ user: UserResponse; token: string }> => {
  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (existingUser) {
    throw new AppError('User with this email already exists', 409);
  }

  // Hash password
  const hashedPassword = await hashPassword(data.password);

  // Create user
  const user = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      password: hashedPassword,
      contact: data.contact,
      address: data.address,
    },
    select: {
      id: true,
      name: true,
      email: true,
      contact: true,
      address: true,
      createdAt: true,
    },
  });

  // Generate JWT token
  const token = generateAccessToken({
    id: user.id,
    email: user.email,
    role: 'user',
  });

  return { user, token };
};

/**
 * Login user (checks both users and admins tables)
 */
export const loginUser = async (
  data: LoginInput
): Promise<{ user: UserResponse; token: string }> => {
  // First, check if it's an admin
  const admin = await prisma.admin.findUnique({
    where: { email: data.email },
  });

  if (admin) {
    // Verify admin password
    const isPasswordValid = await comparePassword(data.password, admin.password);

    if (!isPasswordValid) {
      throw new AppError('Invalid email or password', 401);
    }

    // Generate JWT token with admin role
    const token = generateAccessToken({
      id: admin.id,
      email: admin.email,
      role: 'admin',
    });

    // Return admin data as user response
    const userResponse: UserResponse = {
      id: admin.id,
      name: admin.name,
      email: admin.email,
      contact: admin.contact || undefined,
      address: undefined,
      createdAt: admin.createdAt,
    };

    return { user: userResponse, token };
  }

  // If not an admin, check regular users table
  const user = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (!user) {
    throw new AppError('Invalid email or password', 401);
  }

  // Verify password
  const isPasswordValid = await comparePassword(data.password, user.password);

  if (!isPasswordValid) {
    throw new AppError('Invalid email or password', 401);
  }

  // Generate JWT token
  const token = generateAccessToken({
    id: user.id,
    email: user.email,
    role: 'user',
  });

  // Return user without password
  const userResponse: UserResponse = {
    id: user.id,
    name: user.name,
    email: user.email,
    contact: user.contact,
    address: user.address,
    createdAt: user.createdAt,
  };

  return { user: userResponse, token };
};

/**
 * Login admin
 */
export const loginAdmin = async (
  data: AdminLoginInput
): Promise<{ admin: AdminResponse; token: string }> => {
  // Find admin
  const admin = await prisma.admin.findUnique({
    where: { email: data.email },
  });

  if (!admin) {
    throw new AppError('Invalid email or password', 401);
  }

  // Verify password
  const isPasswordValid = await comparePassword(data.password, admin.password);

  if (!isPasswordValid) {
    throw new AppError('Invalid email or password', 401);
  }

  // Generate JWT token
  const token = generateAccessToken({
    id: admin.id,
    email: admin.email,
    role: 'admin',
  });

  // Return admin without password
  const adminResponse: AdminResponse = {
    id: admin.id,
    name: admin.name,
    email: admin.email,
    role: admin.role,
    contact: admin.contact,
  };

  return { admin: adminResponse, token };
};

/**
 * Get user by ID
 */
export const getUserById = async (userId: string): Promise<UserResponse> => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      contact: true,
      address: true,
      createdAt: true,
    },
  });

  if (!user) {
    throw new AppError('User not found', 404);
  }

  return user;
};

/**
 * Update user profile
 */
export const updateUserProfile = async (
  userId: string,
  data: { name?: string; contact?: string; address?: string }
): Promise<UserResponse> => {
  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      ...(data.name && { name: data.name }),
      ...(data.contact && { contact: data.contact }),
      ...(data.address && { address: data.address }),
    },
    select: {
      id: true,
      name: true,
      email: true,
      contact: true,
      address: true,
      createdAt: true,
    },
  });

  return user;
};

export default {
  registerUser,
  loginUser,
  loginAdmin,
  getUserById,
  updateUserProfile,
};

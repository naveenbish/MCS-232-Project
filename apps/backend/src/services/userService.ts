import prisma from '../config/database';
import bcrypt from 'bcrypt';
import { Prisma } from '@prisma/client';

/**
 * Get all users with pagination and filters
 */
export async function getAllUsers(params: {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  status?: string;
}) {
  const { page = 1, limit = 10, search, role, status } = params;
  const skip = (page - 1) * limit;

  const where: Prisma.UserWhereInput = {};

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
      { contact: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        contact: true,
        address: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            orders: true,
          },
        },
        orders: {
          select: {
            totalAmount: true,
            status: true,
          },
        },
      },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.user.count({ where }),
  ]);

  // Calculate additional stats for each user
  const usersWithStats = users.map(user => {
    const totalOrders = user._count.orders;
    const totalSpent = user.orders.reduce(
      (sum, order) => sum + Number(order.totalAmount),
      0
    );

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      contact: user.contact,
      address: user.address,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      totalOrders,
      totalSpent,
      role: 'user', // All regular users have 'user' role
      status: 'active', // You can implement status logic based on your needs
    };
  });

  return {
    users: usersWithStats,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

/**
 * Get a single user by ID
 */
export async function getUserById(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      orders: {
        orderBy: { createdAt: 'desc' },
        include: {
          orderDetails: {
            include: {
              foodItem: true,
            },
          },
          payment: true,
        },
      },
      reviews: {
        include: {
          foodItem: true,
        },
      },
    },
  });

  if (!user) {
    throw new Error('User not found');
  }

  return user;
}

/**
 * Create a new user (admin creating user account)
 */
export async function createUser(data: {
  name: string;
  email: string;
  password: string;
  contact?: string;
  address?: string;
}) {
  // Check if email already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (existingUser) {
    throw new Error('Email already exists');
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(data.password, 10);

  const user = await prisma.user.create({
    data: {
      ...data,
      password: hashedPassword,
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
}

/**
 * Update user information
 */
export async function updateUser(
  userId: string,
  data: {
    name?: string;
    email?: string;
    contact?: string;
    address?: string;
    password?: string;
  }
) {
  // Check if user exists
  const existingUser = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!existingUser) {
    throw new Error('User not found');
  }

  // Check if new email is already taken
  if (data.email && data.email !== existingUser.email) {
    const emailExists = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (emailExists) {
      throw new Error('Email already exists');
    }
  }

  // Hash password if provided
  if (data.password) {
    data.password = await bcrypt.hash(data.password, 10);
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data,
    select: {
      id: true,
      name: true,
      email: true,
      contact: true,
      address: true,
      updatedAt: true,
    },
  });

  return updatedUser;
}

/**
 * Delete a user (soft delete could be implemented)
 */
export async function deleteUser(userId: string) {
  // Check if user exists
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      orders: true,
    },
  });

  if (!user) {
    throw new Error('User not found');
  }

  // Check if user has active orders
  const activeOrders = user.orders.filter(
    order => order.status !== 'COMPLETED' && order.status !== 'CANCELLED'
  );

  if (activeOrders.length > 0) {
    throw new Error('Cannot delete user with active orders');
  }

  // Delete user (this will cascade delete related records)
  await prisma.user.delete({
    where: { id: userId },
  });

  return { message: 'User deleted successfully' };
}

/**
 * Reset user password
 */
export async function resetUserPassword(userId: string, newPassword: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new Error('User not found');
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword },
  });

  return { message: 'Password reset successfully' };
}

/**
 * Get user statistics
 */
export async function getUserStats() {
  const [totalUsers, newUsersThisMonth, activeUsers] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({
      where: {
        createdAt: {
          gte: new Date(new Date().setDate(1)), // First day of current month
        },
      },
    }),
    prisma.user.count({
      where: {
        orders: {
          some: {
            createdAt: {
              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
            },
          },
        },
      },
    }),
  ]);

  return {
    totalUsers,
    newUsersThisMonth,
    activeUsers,
  };
}
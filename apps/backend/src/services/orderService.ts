import prisma from '../config/database';
import { CreateOrderInput, UpdateOrderStatusInput, AppError } from '../types';
import { OrderStatus } from '@prisma/client';
import { emitOrderUpdate } from '../config/socket';

/**
 * Create a new order
 */
export const createOrder = async (userId: string, data: CreateOrderInput) => {
  // Validate all items exist and are available
  const items = await Promise.all(
    data.items.map(async (item) => {
      const foodItem = await prisma.foodItem.findUnique({
        where: { id: item.itemId },
      });

      if (!foodItem) {
        throw new AppError(`Food item ${item.itemId} not found`, 404);
      }

      if (!foodItem.availabilityStatus) {
        throw new AppError(`Food item ${foodItem.name} is not available`, 400);
      }

      if (item.quantity <= 0) {
        throw new AppError('Quantity must be greater than 0', 400);
      }

      return {
        foodItem,
        quantity: item.quantity,
      };
    })
  );

  // Calculate total amount
  const totalAmount = items.reduce((sum, item) => {
    return sum + Number(item.foodItem.price) * item.quantity;
  }, 0);

  // Create order with order details in a transaction
  const order = await prisma.$transaction(async (tx) => {
    // Create order
    const newOrder = await tx.order.create({
      data: {
        userId,
        totalAmount,
        status: 'PENDING',
        deliveryAddress: data.deliveryAddress,
        contactNumber: data.contactNumber,
      },
    });

    // Create order details
    const orderDetails = await Promise.all(
      items.map((item) =>
        tx.orderDetail.create({
          data: {
            orderId: newOrder.id,
            itemId: item.foodItem.id,
            quantity: item.quantity,
            priceAtTime: item.foodItem.price,
            subtotal: Number(item.foodItem.price) * item.quantity,
          },
        })
      )
    );

    // Create pending payment record
    await tx.payment.create({
      data: {
        orderId: newOrder.id,
        amount: totalAmount,
        paymentStatus: 'PENDING',
      },
    });

    return newOrder;
  });

  // Get order with details for response
  const orderWithDetails = await getOrderById(order.id, userId);

  // Note: Admin notification is sent after payment verification, not here

  // Return order with details
  return orderWithDetails;
};

/**
 * Get order by ID
 */
export const getOrderById = async (orderId: string, userId?: string) => {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          contact: true,
        },
      },
      orderDetails: {
        include: {
          foodItem: {
            include: {
              category: true,
            },
          },
        },
      },
      payment: true,
    },
  });

  if (!order) {
    throw new AppError('Order not found', 404);
  }

  // If userId is provided, verify ownership
  if (userId && order.userId !== userId) {
    throw new AppError('Unauthorized to access this order', 403);
  }

  return order;
};

/**
 * Get all orders for a user
 */
export const getUserOrders = async (
  userId: string,
  page: number = 1,
  limit: number = 20
) => {
  const skip = (page - 1) * limit;

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where: { userId },
      include: {
        orderDetails: {
          include: {
            foodItem: {
              select: {
                id: true,
                name: true,
                image: true,
                price: true,
              },
            },
          },
        },
        payment: {
          select: {
            paymentStatus: true,
            paymentMethod: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.order.count({ where: { userId } }),
  ]);

  return {
    orders,
    total,
    page,
    limit,
  };
};

/**
 * Get all orders (admin only)
 * By default, excludes PENDING orders (unpaid) unless specifically filtered
 */
export const getAllOrders = async (
  page: number = 1,
  limit: number = 20,
  status?: OrderStatus
) => {
  const skip = (page - 1) * limit;

  // If specific status requested, use it; otherwise exclude PENDING (unpaid) orders
  const where = status
    ? { status }
    : { status: { not: 'PENDING' as OrderStatus } };

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            contact: true,
          },
        },
        orderDetails: {
          include: {
            foodItem: {
              select: {
                id: true,
                name: true,
                price: true,
              },
            },
          },
        },
        payment: {
          select: {
            paymentStatus: true,
            paymentMethod: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.order.count({ where }),
  ]);

  return {
    orders,
    total,
    page,
    limit,
  };
};

/**
 * Update order status (admin only)
 */
export const updateOrderStatus = async (
  orderId: string,
  status: OrderStatus
) => {
  // Validate status transition
  const order = await prisma.order.findUnique({
    where: { id: orderId },
  });

  if (!order) {
    throw new AppError('Order not found', 404);
  }

  // Update order status
  const updatedOrder = await prisma.order.update({
    where: { id: orderId },
    data: { status },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      orderDetails: {
        include: {
          foodItem: true,
        },
      },
      payment: true,
    },
  });

  // Emit status update to user and admins
  emitOrderUpdate(orderId, {
    status: updatedOrder.status,
    message: `Order status updated to ${status}`,
    timestamp: new Date()
  });

  return updatedOrder;
};

/**
 * Cancel order
 */
export const cancelOrder = async (orderId: string, userId?: string) => {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { payment: true },
  });

  if (!order) {
    throw new AppError('Order not found', 404);
  }

  // Verify ownership if user ID is provided
  if (userId && order.userId !== userId) {
    throw new AppError('Unauthorized to cancel this order', 403);
  }

  // Check if order can be cancelled
  if (['DELIVERED', 'COMPLETED', 'CANCELLED'].includes(order.status)) {
    throw new AppError('Order cannot be cancelled at this stage', 400);
  }

  // Update order and payment status
  const updatedOrder = await prisma.$transaction(async (tx) => {
    const cancelledOrder = await tx.order.update({
      where: { id: orderId },
      data: { status: 'CANCELLED' },
    });

    if (order.payment && order.payment.paymentStatus === 'COMPLETED') {
      await tx.payment.update({
        where: { id: order.payment.id },
        data: { paymentStatus: 'REFUNDED' },
      });
    }

    return cancelledOrder;
  });

  // Emit cancellation to user and admins
  emitOrderUpdate(orderId, {
    status: 'CANCELLED',
    message: 'Order has been cancelled',
    timestamp: new Date()
  });

  return updatedOrder;
};

export default {
  createOrder,
  getOrderById,
  getUserOrders,
  getAllOrders,
  updateOrderStatus,
  cancelOrder,
};

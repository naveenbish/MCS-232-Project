import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { config } from './env';
import { verifyAccessToken } from '../utils/jwt';
import logger from './logger';

let io: SocketIOServer;

/**
 * Initialize Socket.IO server
 */
export const initializeSocket = (httpServer: HTTPServer): SocketIOServer => {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: config.ALLOWED_ORIGINS,
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  // Authentication middleware
  io.use((socket: Socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];

      if (!token) {
        return next(new Error('Authentication error: No token provided'));
      }

      const decoded = verifyAccessToken(token);
      socket.data.user = decoded;

      logger.info(`Socket.IO: User connected - ${decoded.email} (${decoded.id})`);
      next();
    } catch (error) {
      logger.error('Socket.IO authentication error:', error);
      next(new Error('Authentication error: Invalid token'));
    }
  });

  // Connection handler
  io.on('connection', (socket: Socket) => {
    const user = socket.data.user;

    logger.info(`Socket.IO: Client connected - ${user.email} (${socket.id})`);

    // Join user-specific room
    socket.join(`user:${user.id}`);

    // Join admin room if admin
    if (user.role === 'admin') {
      socket.join('admin');
      logger.info(`Socket.IO: Admin joined admin room - ${user.email}`);
    }

    // Join order-specific room
    socket.on('join:order', (orderId: string) => {
      socket.join(`order:${orderId}`);
      logger.debug(`Socket.IO: User ${user.email} joined order room: ${orderId}`);
    });

    // Leave order-specific room
    socket.on('leave:order', (orderId: string) => {
      socket.leave(`order:${orderId}`);
      logger.debug(`Socket.IO: User ${user.email} left order room: ${orderId}`);
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      logger.info(`Socket.IO: Client disconnected - ${user.email} (${socket.id})`);
    });

    // Handle errors
    socket.on('error', (error) => {
      logger.error(`Socket.IO error for user ${user.email}:`, error);
    });
  });

  logger.info('✅ Socket.IO server initialized');

  return io;
};

/**
 * Get Socket.IO instance
 */
export const getIO = (): SocketIOServer => {
  if (!io) {
    throw new Error('Socket.IO not initialized. Call initializeSocket first.');
  }
  return io;
};

/**
 * Emit order status update to specific order room
 */
export const emitOrderUpdate = (orderId: string, data: {
  status: string;
  message: string;
  timestamp: Date;
}) => {
  try {
    const socketIO = getIO();
    socketIO.to(`order:${orderId}`).emit('order:status-update', {
      orderId,
      ...data,
    });

    // Also emit to admin room
    socketIO.to('admin').emit('order:status-update', {
      orderId,
      ...data,
    });

    logger.info(`Order update emitted for order ${orderId}: ${data.status}`);
  } catch (error) {
    logger.error(`Failed to emit order update for order ${orderId}:`, error);
  }
};

/**
 * Emit new order notification to admins
 */
export const emitNewOrderNotification = (orderData: any) => {
  try {
    const socketIO = getIO();
    socketIO.to('admin').emit('order:new', orderData);

    logger.info(`New order notification emitted to admins: ${orderData.id}`);
  } catch (error) {
    logger.error('Failed to emit new order notification:', error);
  }
};

/**
 * Emit payment update to user
 */
export const emitPaymentUpdate = (userId: string, data: {
  orderId: string;
  paymentStatus: string;
  message: string;
}) => {
  try {
    const socketIO = getIO();
    socketIO.to(`user:${userId}`).emit('payment:update', data);

    logger.info(`Payment update emitted to user ${userId}`);
  } catch (error) {
    logger.error(`Failed to emit payment update to user ${userId}:`, error);
  }
};

export default {
  initializeSocket,
  getIO,
  emitOrderUpdate,
  emitNewOrderNotification,
  emitPaymentUpdate,
};

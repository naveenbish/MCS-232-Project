import { io, Socket } from 'socket.io-client';
import { store } from '@/store';

class SocketManager {
  private socket: Socket | null = null;

  connect(token: string) {
    if (this.socket?.connected) return this.socket;

    this.socket = io(process.env.NEXT_PUBLIC_SOCKET_URL!, {
      auth: { token },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    });

    this.setupEventListeners();
    return this.socket;
  }

  disconnect() {
    this.socket?.disconnect();
    this.socket = null;
  }

  private setupEventListeners() {
    // Connection events
    this.socket?.on('connect', () => {
      console.log('Socket connected');
    });

    this.socket?.on('disconnect', () => {
      console.log('Socket disconnected');
    });
  }

  joinOrderRoom(orderId: string) {
    this.socket?.emit('join:order', orderId);
  }

  leaveOrderRoom(orderId: string) {
    this.socket?.emit('leave:order', orderId);
  }

  getSocket() {
    return this.socket;
  }
}

export const socketManager = new SocketManager();
'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useAppSelector } from '@/hooks';
import { socketManager } from '@/lib/socket';
import { toast } from 'sonner';
import { orderApi } from '@/services/order';
import { adminOrderApi } from '@/services/adminOrder';
import { store } from '@/store';

interface SocketContextType {
  isConnected: boolean;
  unreadCount: number;
  clearUnread: () => void;
}

const SocketContext = createContext<SocketContextType>({
  isConnected: false,
  unreadCount: 0,
  clearUnread: () => {}
});

export function SocketProvider({ children }: { children: ReactNode }) {
  const accessToken = useAppSelector(state => state.auth.accessToken);
  const user = useAppSelector(state => state.userDetails.user);
  const [isConnected, setIsConnected] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const clearUnread = () => setUnreadCount(0);

  useEffect(() => {
    if (!accessToken) return;

    const socket = socketManager.connect(accessToken);

    // Connection status handling
    socket.on('connect', () => {
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    // Listen for order status updates
    socket.on('order:status-update', (data) => {
      toast.info(`Order Update: ${data.message}`);
      setUnreadCount(prev => prev + 1);
      // Invalidate RTK Query cache for consistent data
      store.dispatch(orderApi.util.invalidateTags(['Orders', 'Order']));
      if (user?.role === 'admin') {
        store.dispatch(adminOrderApi.util.invalidateTags(['AdminOrders']));
      }
    });

    // Listen for new orders (admin only)
    if (user?.role === 'admin') {
      socket.on('order:new', (data) => {
        toast.success('New order received!', {
          description: `Order #${data.id.slice(0, 8)} from ${data.user?.name}`
        });
        setUnreadCount(prev => prev + 1);
        store.dispatch(adminOrderApi.util.invalidateTags(['AdminOrders']));
      });
    }

    // Listen for payment updates
    socket.on('payment:update', (data) => {
      toast.success(data.message);
      setUnreadCount(prev => prev + 1);
      store.dispatch(orderApi.util.invalidateTags(['Order']));
    });

    return () => {
      socketManager.disconnect();
      setIsConnected(false);
    };
  }, [accessToken, user]);

  return (
    <SocketContext.Provider value={{ isConnected, unreadCount, clearUnread }}>
      {children}
    </SocketContext.Provider>
  );
}

export const useSocket = () => useContext(SocketContext);
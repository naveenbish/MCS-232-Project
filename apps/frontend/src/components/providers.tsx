'use client';

import { Provider } from 'react-redux';
import { store } from '@/store';
import { Toaster } from '@/components/ui/sonner';
import { SocketProvider } from '@/contexts/SocketContext';
import { AuthInitializer } from '@/components/auth-initializer';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <AuthInitializer>
        <SocketProvider>
          {children}
          <Toaster position="bottom-center" richColors />
        </SocketProvider>
      </AuthInitializer>
    </Provider>
  );
}
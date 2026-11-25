'use client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { type PropsWithChildren, useState } from 'react';
import { WixDesignSystemProvider } from '@wix/design-system';

export const AppProviders = ({ children }: PropsWithChildren) => {
  const [queryClient] = useState(() => new QueryClient());
  return (
    <WixDesignSystemProvider
      features={{
        newColorsBranding: true,
      }}
    >
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WixDesignSystemProvider>
  );
};

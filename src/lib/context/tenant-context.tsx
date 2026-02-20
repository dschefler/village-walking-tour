'use client';

import { createContext, useContext } from 'react';
import type { Organization } from '@/types';

interface TenantContextValue {
  organization: Organization;
}

const TenantContext = createContext<TenantContextValue | null>(null);

export function TenantProvider({
  organization,
  children,
}: {
  organization: Organization;
  children: React.ReactNode;
}) {
  return (
    <TenantContext.Provider value={{ organization }}>
      {children}
    </TenantContext.Provider>
  );
}

export function useTenant(): TenantContextValue {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
}

export function useTenantOptional(): TenantContextValue | null {
  return useContext(TenantContext);
}

'use client';

import { Provider } from 'jotai';
import { ReactNode } from 'react';

interface StoreProviderProps {
  children: ReactNode;
}

export default function StoreProvider({ children }: StoreProviderProps) {
  return <Provider>{children}</Provider>;
} 
'use client';

import { useState, useEffect } from 'react';

export function HideWhenInstalled({ children }: { children: React.ReactNode }) {
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (navigator as unknown as { standalone?: boolean }).standalone === true;
    setIsInstalled(isStandalone);
  }, []);

  if (isInstalled) return null;
  return <>{children}</>;
}

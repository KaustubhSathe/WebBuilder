'use client';

import { useEffect } from 'react';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => window.removeEventListener('wheel', handleWheel);
  }, []);

  return <>{children}</>;
} 
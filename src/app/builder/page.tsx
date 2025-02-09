'use client';

import { useEffect, useState } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Provider } from 'react-redux';
import { store } from '../../store/store';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import ZoomableCanvas from '@/components/ZoomableCanvas';
import ElementsDrawer from '@/components/ElementsDrawer';

function BuilderCanvas() {
  const [isElementsDrawerOpen, setIsElementsDrawerOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.push('/');
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        router.push('/');
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  // ... rest of your existing BuilderCanvas code ...
}

export default function BuilderPage() {
  return (
    <Provider store={store}>
      <DndProvider backend={HTML5Backend}>
        <BuilderCanvas />
      </DndProvider>
    </Provider>
  );
} 
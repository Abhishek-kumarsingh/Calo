'use client';

import { useEffect, useState } from 'react';

export function TaskInitializer() {
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const initTasks = async () => {
      try {
        // Only initialize once
        if (!initialized) {
          console.log('Initializing scheduled tasks');
          const response = await fetch('/api/init-tasks');
          if (response.ok) {
            setInitialized(true);
            console.log('Scheduled tasks initialized successfully');
          } else {
            console.error('Failed to initialize scheduled tasks');
          }
        }
      } catch (error) {
        console.error('Error initializing tasks:', error);
      }
    };

    initTasks();
  }, [initialized]);

  // This component doesn't render anything
  return null;
}

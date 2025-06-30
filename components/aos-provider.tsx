"use client";

import { useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';

interface AOSProviderProps {
  children: React.ReactNode;
}

export function AOSProvider({ children }: AOSProviderProps) {
  useEffect(() => {
    AOS.init({
      // Global settings
      duration: 800, // Animation duration in ms
      easing: 'ease-out-cubic', // Default easing
      once: true, // Whether animation should happen only once
      mirror: false, // Whether elements should animate out while scrolling past them
      offset: 120, // Offset (in px) from the original trigger point
      delay: 0, // Default delay
    });
  }, []);

  return <>{children}</>;
}

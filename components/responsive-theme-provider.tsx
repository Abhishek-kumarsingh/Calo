'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { type ThemeProviderProps } from 'next-themes/dist/types';

// Tailwind breakpoints
const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
};

type BreakpointKey = keyof typeof breakpoints;
type DeviceType = 'mobile' | 'tablet' | 'desktop' | 'largeDesktop';

interface ResponsiveContextType {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isLargeDesktop: boolean;
  deviceType: DeviceType;
  windowWidth: number;
  windowHeight: number;
}

const ResponsiveContext = createContext<ResponsiveContextType>({
  isMobile: false,
  isTablet: false,
  isDesktop: false,
  isLargeDesktop: false,
  deviceType: 'desktop',
  windowWidth: 0,
  windowHeight: 0,
});

export const useResponsive = () => useContext(ResponsiveContext);

export function ResponsiveThemeProvider({ 
  children,
  ...props
}: ThemeProviderProps) {
  const [windowSize, setWindowSize] = useState({
    width: 0,
    height: 0,
  });

  useEffect(() => {
    // Handler to call on window resize
    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }
    
    // Add event listener
    window.addEventListener('resize', handleResize);
    
    // Call handler right away so state gets updated with initial window size
    handleResize();
    
    // Remove event listener on cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Determine device type based on window width
  const isMobile = windowSize.width > 0 && windowSize.width < breakpoints.md;
  const isTablet = windowSize.width >= breakpoints.md && windowSize.width < breakpoints.lg;
  const isDesktop = windowSize.width >= breakpoints.lg && windowSize.width < breakpoints.xl;
  const isLargeDesktop = windowSize.width >= breakpoints.xl;
  
  let deviceType: DeviceType = 'desktop';
  if (isMobile) deviceType = 'mobile';
  else if (isTablet) deviceType = 'tablet';
  else if (isDesktop) deviceType = 'desktop';
  else if (isLargeDesktop) deviceType = 'largeDesktop';

  const responsiveValue = {
    isMobile,
    isTablet,
    isDesktop,
    isLargeDesktop,
    deviceType,
    windowWidth: windowSize.width,
    windowHeight: windowSize.height,
  };

  return (
    <ResponsiveContext.Provider value={responsiveValue}>
      <NextThemesProvider {...props}>
        {children}
      </NextThemesProvider>
    </ResponsiveContext.Provider>
  );
}
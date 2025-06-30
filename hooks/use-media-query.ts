 d'use client';

import { useState, useEffect } from 'react';

// Tailwind breakpoints
const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
};

type BreakpointKey = keyof typeof breakpoints;

export function useMediaQuery(breakpoint: BreakpointKey, direction: 'min' | 'max' = 'min') {
  const [matches, setMatches] = useState(false);
  
  useEffect(() => {
    // Default to true for SSR
    setMatches(true);
    
    const query = `(${direction}-width: ${breakpoints[breakpoint]})`;
    const mediaQuery = window.matchMedia(query);
    
    // Set initial value
    setMatches(mediaQuery.matches);
    
    // Add listener for changes
    const listener = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };
    
    mediaQuery.addEventListener('change', listener);
    
    // Clean up
    return () => {
      mediaQuery.removeEventListener('change', listener);
    };
  }, [breakpoint, direction]);
  
  return matches;
}

// Convenience hooks for common breakpoints
export function useIsMobile() {
  return useMediaQuery('md', 'max');
}

export function useIsTablet() {
  return useMediaQuery('md', 'min') && useMediaQuery('lg', 'max');
}

export function useIsDesktop() {
  return useMediaQuery('lg', 'min');
}

export function useIsLargeDesktop() {
  return useMediaQuery('xl', 'min');
}
"use client";

import { LucideProps } from 'lucide-react';

// We're reusing Lucide icons here
export {
  Calendar as CalendarIcon,
  Hash,
  CalendarDays,
  User,
  Video,
  FileText,
  MessageCircle,
  Check,
} from 'lucide-react';

// Custom Google icon
export const GoogleIcon = (props: LucideProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    width="24"
    height="24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
    <path d="M15.5 8.5L10.5 11 9 15.5M14 6.5l-3 7.5-2 2" />
  </svg>
);
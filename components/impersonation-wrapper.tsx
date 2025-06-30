"use client";

import { ImpersonationBanner } from "@/components/admin/impersonation-banner";

export function ImpersonationWrapper({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ImpersonationBanner />
      {children}
    </>
  );
}

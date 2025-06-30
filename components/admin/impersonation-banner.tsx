"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { UserCog, XCircle } from "lucide-react";

export function ImpersonationBanner() {
  const { toast } = useToast();
  const router = useRouter();
  const [isImpersonating, setIsImpersonating] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check if admin is impersonating a user
    const impersonating = sessionStorage.getItem("adminImpersonating") === "true";
    setIsImpersonating(impersonating);
  }, []);

  const handleEndImpersonation = async () => {
    try {
      setLoading(true);

      // Get the impersonation token
      const impersonationToken = sessionStorage.getItem("impersonationToken");

      if (!impersonationToken) {
        throw new Error("Impersonation token not found");
      }

      const response = await fetch("/api/admin/impersonate", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "x-impersonation-token": impersonationToken,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to end impersonation");
      }

      // Clear impersonation data
      sessionStorage.removeItem("impersonationToken");
      sessionStorage.removeItem("adminImpersonating");

      toast({
        title: "Impersonation Ended",
        description: "You have returned to your admin account",
      });

      // Redirect to admin dashboard
      router.push("/admin");
    } catch (error: any) {
      console.error("Error ending impersonation:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to end impersonation",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isImpersonating) {
    return null;
  }

  return (
    <div className="bg-amber-50 dark:bg-amber-950 border-b border-amber-200 dark:border-amber-800 py-2 px-4">
      <div className="container flex items-center justify-between">
        <div className="flex items-center">
          <UserCog className="h-4 w-4 text-amber-600 dark:text-amber-400 mr-2" />
          <span className="text-sm text-amber-800 dark:text-amber-300">
            You are currently impersonating a user. Actions you take will be logged.
          </span>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="bg-amber-100 dark:bg-amber-900 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 hover:bg-amber-200 dark:hover:bg-amber-800"
          onClick={handleEndImpersonation}
          disabled={loading}
        >
          {loading ? (
            "Ending..."
          ) : (
            <>
              <XCircle className="h-4 w-4 mr-1" />
              End Impersonation
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

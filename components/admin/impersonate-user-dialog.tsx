"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, UserCog } from "lucide-react";

interface ImpersonateUserDialogProps {
  userId: string;
  userName: string;
  userEmail: string;
  trigger?: React.ReactNode;
}

export function ImpersonateUserDialog({
  userId,
  userName,
  userEmail,
  trigger,
}: ImpersonateUserDialogProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleImpersonate = async () => {
    try {
      setLoading(true);

      const response = await fetch("/api/admin/impersonate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to impersonate user");
      }

      const data = await response.json();

      // Store the impersonation token in session storage
      sessionStorage.setItem("impersonationToken", data.impersonationToken);
      
      // Store original admin info for returning later
      sessionStorage.setItem("adminImpersonating", "true");

      toast({
        title: "Impersonation Started",
        description: `You are now viewing the system as ${userName}`,
      });

      // Close the dialog
      setOpen(false);

      // Redirect to the user dashboard
      router.push("/dashboard");
    } catch (error: any) {
      console.error("Error impersonating user:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to impersonate user",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <UserCog className="h-4 w-4 mr-2" />
            Impersonate
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Impersonate User</DialogTitle>
          <DialogDescription>
            You are about to view the system as this user. This action will be logged.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="space-y-4">
            <div>
              <h3 className="font-medium">User Details</h3>
              <p className="text-sm text-muted-foreground mt-1">
                You will be impersonating the following user:
              </p>
            </div>

            <div className="bg-muted p-3 rounded-md">
              <div className="grid grid-cols-[100px_1fr] gap-1">
                <div className="text-sm font-medium text-muted-foreground">Name:</div>
                <div className="text-sm">{userName}</div>
                
                <div className="text-sm font-medium text-muted-foreground">Email:</div>
                <div className="text-sm">{userEmail}</div>
                
                <div className="text-sm font-medium text-muted-foreground">User ID:</div>
                <div className="text-sm font-mono text-xs">{userId}</div>
              </div>
            </div>

            <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 p-3 rounded-md">
              <p className="text-sm text-amber-800 dark:text-amber-300">
                <strong>Warning:</strong> While impersonating a user, you will see the system exactly as they do.
                All actions you take will be logged with your admin ID.
              </p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleImpersonate} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Impersonating...
              </>
            ) : (
              "Start Impersonation"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

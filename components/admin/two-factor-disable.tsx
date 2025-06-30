"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ShieldOff, AlertTriangle } from "lucide-react";

interface TwoFactorDisableProps {
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

export function TwoFactorDisable({ trigger, onSuccess }: TwoFactorDisableProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Disable 2FA
  const disableTwoFactor = async () => {
    try {
      setLoading(true);

      const response = await fetch("/api/admin/two-factor/verify", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to disable 2FA");
      }

      setOpen(false);
      toast({
        title: "Success",
        description: "Two-factor authentication has been disabled",
      });
      
      if (onSuccess) onSuccess();
    } catch (error: any) {
      console.error("Error disabling 2FA:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to disable 2FA",
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
          <Button variant="outline" className="text-destructive border-destructive" onClick={() => setOpen(true)}>
            <ShieldOff className="h-4 w-4 mr-2" />
            Disable 2FA
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Disable Two-Factor Authentication
          </DialogTitle>
          <DialogDescription>
            This will remove the extra layer of security from your account.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <div className="bg-destructive/10 p-3 rounded-md border border-destructive/20 mb-4">
            <p className="text-sm text-destructive">
              <strong>Warning:</strong> Disabling two-factor authentication will make your account less secure. 
              Anyone with your password will be able to access your account.
            </p>
          </div>
          <p className="text-sm text-muted-foreground">
            After disabling 2FA, you will no longer need to enter a verification code when signing in. 
            Your backup codes will also be invalidated.
          </p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button 
            variant="destructive" 
            onClick={disableTwoFactor} 
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Disabling...
              </>
            ) : (
              "Disable 2FA"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, QrCode, Copy, Check, Shield } from "lucide-react";
import Image from "next/image";

interface TwoFactorSetupProps {
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

export function TwoFactorSetup({ trigger, onSuccess }: TwoFactorSetupProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"initial" | "verify" | "backup">("initial");
  const [setupData, setSetupData] = useState<{
    secret: string;
    backupCodes: string[];
    qrCode: string;
  } | null>(null);
  const [verificationCode, setVerificationCode] = useState("");
  const [copied, setCopied] = useState(false);

  // Start the 2FA setup process
  const startSetup = async () => {
    try {
      setLoading(true);

      const response = await fetch("/api/admin/two-factor/setup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to start 2FA setup");
      }

      const data = await response.json();
      setSetupData(data);
      setStep("verify");
    } catch (error: any) {
      console.error("Error starting 2FA setup:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to start 2FA setup",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Verify the 2FA setup
  const verifySetup = async () => {
    if (!setupData) return;

    try {
      setLoading(true);

      const response = await fetch("/api/admin/two-factor/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token: verificationCode,
          secret: setupData.secret,
          backupCodes: setupData.backupCodes,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to verify 2FA setup");
      }

      setStep("backup");
    } catch (error: any) {
      console.error("Error verifying 2FA setup:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to verify 2FA setup",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Copy backup codes to clipboard
  const copyBackupCodes = () => {
    if (!setupData) return;

    const codesText = setupData.backupCodes.join("\n");
    navigator.clipboard.writeText(codesText);
    setCopied(true);
    
    toast({
      title: "Copied",
      description: "Backup codes copied to clipboard",
    });

    setTimeout(() => setCopied(false), 3000);
  };

  // Complete the setup
  const completeSetup = () => {
    setOpen(false);
    toast({
      title: "Success",
      description: "Two-factor authentication has been enabled",
    });
    if (onSuccess) onSuccess();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" onClick={() => setOpen(true)}>
            <Shield className="h-4 w-4 mr-2" />
            Enable 2FA
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        {step === "initial" && (
          <>
            <DialogHeader>
              <DialogTitle>Enable Two-Factor Authentication</DialogTitle>
              <DialogDescription>
                Add an extra layer of security to your account by requiring a verification code.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <p className="text-sm text-muted-foreground mb-4">
                Two-factor authentication (2FA) adds an additional layer of security to your account. 
                Once enabled, you'll need to enter a verification code from your authenticator app 
                when signing in, in addition to your password.
              </p>
              <div className="bg-muted p-3 rounded-md">
                <h3 className="font-medium mb-2">You'll need:</h3>
                <ul className="text-sm space-y-1">
                  <li>• An authenticator app (Google Authenticator, Authy, etc.)</li>
                  <li>• A few minutes to set up</li>
                </ul>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button onClick={startSetup} disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Setting up...
                  </>
                ) : (
                  "Continue"
                )}
              </Button>
            </DialogFooter>
          </>
        )}

        {step === "verify" && setupData && (
          <>
            <DialogHeader>
              <DialogTitle>Scan QR Code</DialogTitle>
              <DialogDescription>
                Scan this QR code with your authenticator app.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <div className="flex flex-col items-center justify-center mb-4">
                <div className="bg-white p-2 rounded-md mb-4">
                  <Image
                    src={setupData.qrCode}
                    alt="QR Code"
                    width={200}
                    height={200}
                  />
                </div>
                <div className="text-center mb-4">
                  <p className="text-sm text-muted-foreground mb-1">
                    Or enter this code manually:
                  </p>
                  <code className="bg-muted px-2 py-1 rounded text-sm font-mono">
                    {setupData.secret}
                  </code>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="verificationCode">Verification Code</Label>
                <Input
                  id="verificationCode"
                  placeholder="Enter 6-digit code"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  maxLength={6}
                />
                <p className="text-xs text-muted-foreground">
                  Enter the 6-digit code from your authenticator app to verify setup.
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={verifySetup} 
                disabled={loading || verificationCode.length !== 6}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Verify"
                )}
              </Button>
            </DialogFooter>
          </>
        )}

        {step === "backup" && setupData && (
          <>
            <DialogHeader>
              <DialogTitle>Save Backup Codes</DialogTitle>
              <DialogDescription>
                Store these backup codes in a safe place.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <p className="text-sm text-muted-foreground mb-4">
                If you lose access to your authenticator app, you can use one of these backup codes to sign in. 
                Each code can only be used once.
              </p>
              <div className="bg-muted p-3 rounded-md mb-4">
                <div className="grid grid-cols-2 gap-2">
                  {setupData.backupCodes.map((code, index) => (
                    <code key={index} className="font-mono text-xs">
                      {code}
                    </code>
                  ))}
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full" 
                onClick={copyBackupCodes}
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Codes
                  </>
                )}
              </Button>
              <p className="text-xs text-muted-foreground mt-4">
                <strong>Important:</strong> Store these codes securely. They won't be shown again.
              </p>
            </div>
            <DialogFooter>
              <Button onClick={completeSetup}>
                Complete Setup
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

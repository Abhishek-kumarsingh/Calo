"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Shield, KeyRound } from "lucide-react";
import { signIn } from "next-auth/react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface TwoFactorFormProps {
  email: string;
  validationToken: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function TwoFactorForm({
  email,
  validationToken,
  onSuccess,
  onCancel,
}: TwoFactorFormProps) {
  const { toast } = useToast();
  const [verificationCode, setVerificationCode] = useState("");
  const [backupCode, setBackupCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"code" | "backup">("code");

  // Validate 2FA
  const validateTwoFactor = async (isBackupCode: boolean = false) => {
    try {
      setLoading(true);

      // First, validate with our API
      const response = await fetch("/api/auth/two-factor/validate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          token: isBackupCode ? backupCode : verificationCode,
          validationToken,
          isBackupCode,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to validate 2FA");
      }

      const data = await response.json();

      // Now sign in with NextAuth using the 2FA token
      const result = await signIn("credentials", {
        redirect: false,
        email,
        password: "dummy-not-used", // Not used but required by the credentials provider
        twoFactorToken: data.token,
      });

      if (result?.error) {
        throw new Error(result.error);
      }

      toast({
        title: "Success",
        description: "Two-factor authentication successful",
      });

      if (onSuccess) onSuccess();
    } catch (error: any) {
      console.error("Error validating 2FA:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to validate 2FA",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <Shield className="h-8 w-8 mx-auto text-primary" />
        <h1 className="text-2xl font-semibold tracking-tight">
          Two-Factor Authentication
        </h1>
        <p className="text-sm text-muted-foreground">
          Enter the verification code from your authenticator app
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "code" | "backup")}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="code">Verification Code</TabsTrigger>
          <TabsTrigger value="backup">Backup Code</TabsTrigger>
        </TabsList>
        <TabsContent value="code" className="space-y-4 mt-4">
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
              Enter the 6-digit code from your authenticator app.
            </p>
          </div>
          <Button
            className="w-full"
            onClick={() => validateTwoFactor(false)}
            disabled={loading || verificationCode.length !== 6}
          >
            {loading && activeTab === "code" ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Verifying...
              </>
            ) : (
              "Verify"
            )}
          </Button>
        </TabsContent>
        <TabsContent value="backup" className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="backupCode">Backup Code</Label>
            <Input
              id="backupCode"
              placeholder="Enter backup code (e.g., ABCD-1234)"
              value={backupCode}
              onChange={(e) => setBackupCode(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Enter one of your backup codes if you don't have access to your authenticator app.
            </p>
          </div>
          <Button
            className="w-full"
            onClick={() => validateTwoFactor(true)}
            disabled={loading || backupCode.length < 8}
          >
            {loading && activeTab === "backup" ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Verifying...
              </>
            ) : (
              "Use Backup Code"
            )}
          </Button>
        </TabsContent>
      </Tabs>

      <div className="text-center">
        <Button variant="link" onClick={onCancel} disabled={loading}>
          Back to Login
        </Button>
      </div>
    </div>
  );
}

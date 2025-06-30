"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useSession } from "next-auth/react";
import { TwoFactorSetup } from "@/components/admin/two-factor-setup";
import { TwoFactorDisable } from "@/components/admin/two-factor-disable";
import {
  Settings,
  Bell,
  Mail,
  Shield,
  Database,
  Save,
  Loader2,
  ShieldCheck,
  ShieldOff,
  AlertTriangle,
}  from "lucide-react";

export default function SettingsPage() {
  const { toast } = useToast();
  const { data: session, update: updateSession } = useSession();
  const [loading, setLoading] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  // General settings
  const [generalSettings, setGeneralSettings] = useState({
    siteName: "Aithor",
    siteDescription: "AI-powered interview preparation platform",
    contactEmail: "support@aithor.com",
    maxInterviewsPerUser: "10",
    maxQuestionsPerInterview: "15",
  });

  // Notification settings
  const [notificationSettings, setNotificationSettings] = useState({
    enableEmailNotifications: true,
    notifyOnNewUser: true,
    notifyOnCompletedInterview: true,
    adminEmailRecipients: "admin@aithor.com",
  });

  // Security settings
  const [securitySettings, setSecuritySettings] = useState({
    enableUserRegistration: true,
    requireEmailVerification: true,
    sessionTimeout: "30",
    maxLoginAttempts: "5",
  });

  // Check if 2FA is enabled
  useEffect(() => {
    if (session?.user) {
      setTwoFactorEnabled(!!(session.user as any).twoFactorEnabled);
    }
  }, [session]);

  // Handle general settings change
  const handleGeneralChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setGeneralSettings(prev => ({ ...prev, [name]: value }));
  };

  // Handle notification settings change
  const handleNotificationChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNotificationSettings(prev => ({ ...prev, [name]: value }));
  };

  // Handle notification toggle change
  const handleNotificationToggle = (name: string, checked: boolean) => {
    setNotificationSettings(prev => ({ ...prev, [name]: checked }));
  };

  // Handle security settings change
  const handleSecurityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSecuritySettings(prev => ({ ...prev, [name]: value }));
  };

  // Handle security toggle change
  const handleSecurityToggle = (name: string, checked: boolean) => {
    setSecuritySettings(prev => ({ ...prev, [name]: checked }));
  };

  // Save settings
  const saveSettings = async (settingsType: string) => {
    setLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      toast({
        title: "Settings Saved",
        description: `${settingsType} settings have been updated successfully.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Admin Settings</h1>
        <p className="text-muted-foreground">
          Configure system settings and preferences
        </p>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList>
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            <span>General</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            <span>Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            <span>Security</span>
          </TabsTrigger>
          <TabsTrigger value="database" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            <span>Database</span>
          </TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>
                Configure basic system settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="siteName">Site Name</Label>
                  <Input
                    id="siteName"
                    name="siteName"
                    value={generalSettings.siteName}
                    onChange={handleGeneralChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactEmail">Contact Email</Label>
                  <Input
                    id="contactEmail"
                    name="contactEmail"
                    type="email"
                    value={generalSettings.contactEmail}
                    onChange={handleGeneralChange}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="siteDescription">Site Description</Label>
                <Textarea
                  id="siteDescription"
                  name="siteDescription"
                  value={generalSettings.siteDescription}
                  onChange={handleGeneralChange}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="maxInterviewsPerUser">Max Interviews Per User</Label>
                  <Input
                    id="maxInterviewsPerUser"
                    name="maxInterviewsPerUser"
                    type="number"
                    value={generalSettings.maxInterviewsPerUser}
                    onChange={handleGeneralChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxQuestionsPerInterview">Max Questions Per Interview</Label>
                  <Input
                    id="maxQuestionsPerInterview"
                    name="maxQuestionsPerInterview"
                    type="number"
                    value={generalSettings.maxQuestionsPerInterview}
                    onChange={handleGeneralChange}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                onClick={() => saveSettings("General")}
                disabled={loading}
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Save className="mr-2 h-4 w-4" />
                Save Settings
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>
                Configure email and system notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="enableEmailNotifications">Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable or disable all email notifications
                  </p>
                </div>
                <Switch
                  id="enableEmailNotifications"
                  checked={notificationSettings.enableEmailNotifications}
                  onCheckedChange={(checked) =>
                    handleNotificationToggle("enableEmailNotifications", checked)
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="notifyOnNewUser">New User Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Notify admins when a new user registers
                  </p>
                </div>
                <Switch
                  id="notifyOnNewUser"
                  checked={notificationSettings.notifyOnNewUser}
                  onCheckedChange={(checked) =>
                    handleNotificationToggle("notifyOnNewUser", checked)
                  }
                  disabled={!notificationSettings.enableEmailNotifications}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="notifyOnCompletedInterview">Interview Completion Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Notify admins when a user completes an interview
                  </p>
                </div>
                <Switch
                  id="notifyOnCompletedInterview"
                  checked={notificationSettings.notifyOnCompletedInterview}
                  onCheckedChange={(checked) =>
                    handleNotificationToggle("notifyOnCompletedInterview", checked)
                  }
                  disabled={!notificationSettings.enableEmailNotifications}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="adminEmailRecipients">Admin Email Recipients</Label>
                <Input
                  id="adminEmailRecipients"
                  name="adminEmailRecipients"
                  value={notificationSettings.adminEmailRecipients}
                  onChange={handleNotificationChange}
                  placeholder="Comma-separated email addresses"
                  disabled={!notificationSettings.enableEmailNotifications}
                />
                <p className="text-xs text-muted-foreground">
                  Separate multiple email addresses with commas
                </p>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                onClick={() => saveSettings("Notification")}
                disabled={loading}
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Mail className="mr-2 h-4 w-4" />
                Save Notification Settings
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>
                Configure security and access controls
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Two-Factor Authentication */}
              <Card className="border-2 border-primary/10 bg-primary/5">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-primary" />
                    Two-Factor Authentication
                  </CardTitle>
                  <CardDescription>
                    Add an extra layer of security to your admin account
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Status: {twoFactorEnabled ? (
                          <span className="text-green-600 dark:text-green-500 font-semibold">Enabled</span>
                        ) : (
                          <span className="text-amber-600 dark:text-amber-500 font-semibold">Disabled</span>
                        )}</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {twoFactorEnabled
                            ? "Your account is protected with two-factor authentication."
                            : "Enable two-factor authentication for enhanced security."}
                        </p>
                      </div>
                      <div>
                        {twoFactorEnabled ? (
                          <TwoFactorDisable
                            onSuccess={() => {
                              setTwoFactorEnabled(false);
                              updateSession();
                            }}
                          />
                        ) : (
                          <TwoFactorSetup
                            onSuccess={() => {
                              setTwoFactorEnabled(true);
                              updateSession();
                            }}
                          />
                        )}
                      </div>
                    </div>

                    {!twoFactorEnabled && (
                      <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 p-3 rounded-md">
                        <div className="flex gap-2">
                          <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-500 flex-shrink-0 mt-0.5" />
                          <p className="text-sm text-amber-800 dark:text-amber-300">
                            <strong>Recommended:</strong> Two-factor authentication adds an important security layer to your admin account.
                            If enabled, you'll need to enter a verification code from your authenticator app when signing in.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="enableUserRegistration">User Registration</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow new users to register
                  </p>
                </div>
                <Switch
                  id="enableUserRegistration"
                  checked={securitySettings.enableUserRegistration}
                  onCheckedChange={(checked) =>
                    handleSecurityToggle("enableUserRegistration", checked)
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="requireEmailVerification">Email Verification</Label>
                  <p className="text-sm text-muted-foreground">
                    Require email verification for new accounts
                  </p>
                </div>
                <Switch
                  id="requireEmailVerification"
                  checked={securitySettings.requireEmailVerification}
                  onCheckedChange={(checked) =>
                    handleSecurityToggle("requireEmailVerification", checked)
                  }
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                  <Input
                    id="sessionTimeout"
                    name="sessionTimeout"
                    type="number"
                    value={securitySettings.sessionTimeout}
                    onChange={handleSecurityChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxLoginAttempts">Max Login Attempts</Label>
                  <Input
                    id="maxLoginAttempts"
                    name="maxLoginAttempts"
                    type="number"
                    value={securitySettings.maxLoginAttempts}
                    onChange={handleSecurityChange}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                onClick={() => saveSettings("Security")}
                disabled={loading}
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Shield className="mr-2 h-4 w-4" />
                Save Security Settings
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Database Settings */}
        <TabsContent value="database">
          <Card>
            <CardHeader>
              <CardTitle>Database Management</CardTitle>
              <CardDescription>
                Manage database operations and backups
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="rounded-md bg-muted p-4">
                <p className="text-sm">
                  Database operations are sensitive and can affect system stability.
                  Make sure you understand the implications before proceeding.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button variant="outline" className="w-full">
                  <Database className="mr-2 h-4 w-4" />
                  Backup Database
                </Button>
                <Button variant="outline" className="w-full">
                  <Database className="mr-2 h-4 w-4" />
                  Restore Database
                </Button>
              </div>

              <div className="pt-4">
                <h3 className="text-lg font-medium mb-2">Database Statistics</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Users:</span>
                    <span className="font-medium">125</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Interviews:</span>
                    <span className="font-medium">450</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Database Size:</span>
                    <span className="font-medium">24.5 MB</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Last Backup:</span>
                    <span className="font-medium">Never</span>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="destructive" className="ml-auto">
                Clear Test Data
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

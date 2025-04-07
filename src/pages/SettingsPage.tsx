import { useState, useEffect } from "react";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useDashboardContext } from "@/components/dashboard/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { 
  User, Lock, Bell, Moon, Sun, CreditCard, Globe, Shield, LogOut, 
  Upload, Database, Smartphone
} from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "@/components/ui/use-toast";

const SettingsPage = () => {
  const { isDemoMode } = useDashboardContext();
  const [activeTab, setActiveTab] = useState("profile");
  const [darkMode, setDarkMode] = useState(true);

  const profileForm = useForm({
    defaultValues: {
      name: "",
      email: "",
      phone: ""
    }
  });

  const onSubmit = (data: any) => {
    console.log('Profile updated:', data);
    toast({
      title: "Profile Updated",
      description: "Your profile information has been saved successfully.",
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-white">Settings</h1>
          {isDemoMode && <div className="text-sm text-yellow-400 bg-yellow-400/10 px-3 py-1 rounded-md">Demo Mode</div>}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-background/40 backdrop-blur-lg border-white/10 text-white mb-6 grid grid-cols-2 md:grid-cols-5 w-full">
            <TabsTrigger value="profile" className="text-white data-[state=active]:bg-accent">
              <User className="h-4 w-4 mr-2" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="security" className="text-white data-[state=active]:bg-accent">
              <Lock className="h-4 w-4 mr-2" />
              Security
            </TabsTrigger>
            <TabsTrigger value="notifications" className="text-white data-[state=active]:bg-accent">
              <Bell className="h-4 w-4 mr-2" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="appearance" className="text-white data-[state=active]:bg-accent">
              <Moon className="h-4 w-4 mr-2" />
              Appearance
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="mt-0 space-y-6">
            <Card className="bg-background/40 backdrop-blur-lg border-white/10 text-white">
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center gap-6">
                  <div className="flex flex-col items-center gap-2">
                    <Avatar className="h-24 w-24">
                      <AvatarImage className="avatar-image" src={profileForm.getValues().avatarUrl || "https://github.com/shadcn.png"} />
                      <AvatarFallback>JD</AvatarFallback>
                    </Avatar>
                    <Input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      id="avatar-upload"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          if (file.size > 5 * 1024 * 1024) {
                            toast({
                              title: "Error",
                              description: "File size must be less than 5MB",
                              variant: "destructive"
                            });
                            return;
                          }
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            profileForm.setValue('avatarUrl', reader.result as string);
                            // Update avatar display immediately
                            const avatarImg = document.querySelector('.avatar-image') as HTMLImageElement;
                            if (avatarImg) {
                              avatarImg.src = reader.result as string;
                            }
                          };
                          reader.readAsDataURL(file);
                          toast({
                            title: "Success",
                            description: "Profile picture updated successfully",
                          });
                        }
                      }}
                    />
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="gap-2"
                      onClick={() => document.getElementById('avatar-upload')?.click()}
                      type="button"
                      disabled={isDemoMode}
                    >
                      <Upload className="h-4 w-4" />
                      {isDemoMode ? "Disabled in Demo" : "Change"}
                    </Button>
                    <p className="text-xs text-white/60 text-center mt-1">Max size: 5MB</p>
                  </div>

                  <div className="flex-1 space-y-4">
                    <form className="space-y-4" onSubmit={profileForm.handleSubmit(onSubmit)}>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">Full Name</Label>
                          <Input 
                            id="name" 
                            placeholder="Your name" 
                            {...profileForm.register('name')}
                            className="bg-white/5 border-white/10"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <Input 
                            id="email" 
                            type="email" 
                            placeholder="Your email"
                            {...profileForm.register('email')}
                            className="bg-white/5 border-white/10"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phone">Phone Number</Label>
                          <Input 
                            id="phone" 
                            placeholder="Your phone number"
                            {...profileForm.register('phone')}
                            className="bg-white/5 border-white/10"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="language">Preferred Language</Label>
                          <Select defaultValue="en">
                            <SelectTrigger className="bg-white/5 border-white/10">
                              <SelectValue placeholder="Select language" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="en">English</SelectItem>
                              <SelectItem value="fr">French</SelectItem>
                              <SelectItem value="es">Spanish</SelectItem>
                              <SelectItem value="sw">Swahili</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <Button 
                        type="submit" 
                        className="bg-[#F2FF44] text-black font-medium hover:bg-[#E2EF34]"
                      >
                        Save Changes
                      </Button>
                    </form>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="mt-0 space-y-6">
            <Card className="bg-background/40 backdrop-blur-lg border-white/10 text-white">
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium">Password</h3>
                      <p className="text-sm text-white/60">Change your account password</p>
                    </div>
                    <Button variant="outline">Change Password</Button>
                  </div>
                  <Separator className="bg-white/10" />

                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium">Two-Factor Authentication</h3>
                      <p className="text-sm text-white/60">Add an extra layer of security</p>
                    </div>
                    <Switch checked={true} />
                  </div>
                  <Separator className="bg-white/10" />

                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium">Session Management</h3>
                      <p className="text-sm text-white/60">Manage active sessions and devices</p>
                    </div>
                    <Button variant="outline">View Sessions</Button>
                  </div>
                  <Separator className="bg-white/10" />

                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium">API Keys</h3>
                      <p className="text-sm text-white/60">Manage API access to your account</p>
                    </div>
                    <Button variant="outline">Manage Keys</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="mt-0 space-y-6">
            <Card className="bg-background/40 backdrop-blur-lg border-white/10 text-white">
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Email Notifications</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="email-price-alerts">Price Alerts</Label>
                      <Switch id="email-price-alerts" checked={true} />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="email-trade-confirmations">Trade Confirmations</Label>
                      <Switch id="email-trade-confirmations" checked={true} />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="email-deposit-withdrawals">Deposit/Withdrawal Updates</Label>
                      <Switch id="email-deposit-withdrawals" checked={true} />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="email-newsletters">Newsletters & Updates</Label>
                      <Switch id="email-newsletters" />
                    </div>
                  </div>

                  <Separator className="bg-white/10 my-4" />

                  <h3 className="text-lg font-medium">Push Notifications</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="push-price-alerts">Price Alerts</Label>
                      <Switch id="push-price-alerts" checked={true} />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="push-trade-confirmations">Trade Confirmations</Label>
                      <Switch id="push-trade-confirmations" checked={true} />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="push-deposit-withdrawals">Deposit/Withdrawal Updates</Label>
                      <Switch id="push-deposit-withdrawals" checked={true} />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="push-market-updates">Market Updates</Label>
                      <Switch id="push-market-updates" />
                    </div>
                  </div>

                  <Separator className="bg-white/10 my-4" />

                  <h3 className="text-lg font-medium">SMS Notifications</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="sms-security">Security Alerts</Label>
                      <Switch id="sms-security" checked={true} />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="sms-login">Login Attempts</Label>
                      <Switch id="sms-login" checked={true} />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="sms-transactions">Large Transactions</Label>
                      <Switch id="sms-transactions" checked={true} />
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <Button 
                    variant="outline"
                    className="w-full bg-white/5 border-white/10 text-white hover:bg-white/10 hover:text-white"
                    onClick={() => {
                      toast({
                        title: "Success",
                        description: "Notification preferences have been saved.",
                      });
                    }}
                  >
                    Save Preferences
                  </Button>
                  <Button 
                    variant="default"
                    className="w-full"
                    onClick={() => {
                      // Reset all switches to default state
                      const switches = document.querySelectorAll('button[role="switch"]');
                      switches.forEach((switchEl) => {
                        if (switchEl.getAttribute('aria-checked') === 'false') {
                          (switchEl as HTMLButtonElement).click();
                        }
                      });
                    }}
                  >
                    Reset to Default
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="appearance" className="mt-0 space-y-6">
            <Card className="bg-background/40 backdrop-blur-lg border-white/10 text-white">
              <CardHeader>
                <CardTitle>Appearance Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium">Theme</h3>
                      <p className="text-sm text-white/60">Select your preferred theme</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button 
                        variant={darkMode ? "ghost" : "default"} 
                        size="sm" 
                        onClick={() => setDarkMode(false)}
                        className={darkMode ? "bg-white/10" : "bg-[#F2FF44] text-black"}
                      >
                        <Sun className="h-4 w-4 mr-2" />
                        Light
                      </Button>
                      <Button 
                        variant={darkMode ? "default" : "ghost"} 
                        size="sm" 
                        onClick={() => setDarkMode(true)}
                        className={darkMode ? "bg-[#F2FF44] text-black" : "bg-white/10"}
                      >
                        <Moon className="h-4 w-4 mr-2" />
                        Dark
                      </Button>
                    </div>
                  </div>

                  <Separator className="bg-white/10 my-4" />

                  <div className="space-y-2">
                    <Label htmlFor="chart-color">Chart Color Scheme</Label>
                    <Select defaultValue="green-red">
                      <SelectTrigger id="chart-color" className="bg-white/5 border-white/10">
                        <SelectValue placeholder="Select color scheme" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="green-red">Green/Red (Default)</SelectItem>
                        <SelectItem value="blue-red">Blue/Red</SelectItem>
                        <SelectItem value="monochrome">Monochrome</SelectItem>
                        <SelectItem value="high-contrast">High Contrast</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="default-view">Default Dashboard View</Label>
                    <Select defaultValue="dashboard">
                      <SelectTrigger id="default-view" className="bg-white/5 border-white/10">
                        <SelectValue placeholder="Select default view" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="dashboard">Dashboard Overview</SelectItem>
                        <SelectItem value="trading">Trading Panel</SelectItem>
                        <SelectItem value="assets">Assets</SelectItem>
                        <SelectItem value="markets">Markets</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="language-pref">Language</Label>
                    <Select defaultValue="en">
                      <SelectTrigger id="language-pref" className="bg-white/5 border-white/10">
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="fr">French</SelectItem>
                        <SelectItem value="es">Spanish</SelectItem>
                        <SelectItem value="sw">Swahili</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button className="bg-[#F2FF44] text-black font-medium hover:bg-[#E2EF34]">
                  Save Preferences
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default SettingsPage;
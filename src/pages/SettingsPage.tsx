
import { useState } from "react";
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

const SettingsPage = () => {
  const { isDemoMode } = useDashboardContext();
  const [activeTab, setActiveTab] = useState("profile");
  const [darkMode, setDarkMode] = useState(true);
  
  const profileForm = useForm({
    defaultValues: {
      name: "John Doe",
      email: "johndoe@example.com",
      phone: "+254 712 345 678"
    }
  });

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
            <TabsTrigger value="payment" className="text-white data-[state=active]:bg-accent">
              <CreditCard className="h-4 w-4 mr-2" />
              Payment
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
                      <AvatarImage src="https://github.com/shadcn.png" />
                      <AvatarFallback>JD</AvatarFallback>
                    </Avatar>
                    <Button variant="outline" size="sm" className="gap-2">
                      <Upload className="h-4 w-4" />
                      Change
                    </Button>
                  </div>
                  
                  <div className="flex-1 space-y-4">
                    <form className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">Full Name</Label>
                          <Input 
                            id="name" 
                            placeholder="Your name" 
                            value={profileForm.getValues().name}
                            className="bg-white/5 border-white/10"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <Input 
                            id="email" 
                            type="email" 
                            placeholder="Your email"
                            value={profileForm.getValues().email}
                            className="bg-white/5 border-white/10"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phone">Phone Number</Label>
                          <Input 
                            id="phone" 
                            placeholder="Your phone number"
                            value={profileForm.getValues().phone}
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
                      <Button className="bg-[#F2FF44] text-black font-medium hover:bg-[#E2EF34]">
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
                <Button className="bg-[#F2FF44] text-black font-medium hover:bg-[#E2EF34]">
                  Save Preferences
                </Button>
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
          
          <TabsContent value="payment" className="mt-0 space-y-6">
            <Card className="bg-background/40 backdrop-blur-lg border-white/10 text-white">
              <CardHeader>
                <CardTitle>Payment Methods</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="bg-white/10 border-white/10">
                      <CardContent className="pt-6">
                        <div className="flex justify-between items-center mb-4">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                              <CreditCard className="h-5 w-5 text-blue-500" />
                            </div>
                            <div>
                              <p className="font-medium">M-Pesa</p>
                              <p className="text-sm text-white/60">••••4578</p>
                            </div>
                          </div>
                          <div className="text-xs bg-green-500/20 text-green-500 px-2 py-1 rounded-full">
                            Default
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" className="flex-1">Edit</Button>
                          <Button variant="outline" size="sm" className="flex-1">Remove</Button>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-white/10 border-white/10">
                      <CardContent className="pt-6">
                        <div className="flex justify-between items-center mb-4">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                              <Database className="h-5 w-5 text-purple-500" />
                            </div>
                            <div>
                              <p className="font-medium">Bank Account</p>
                              <p className="text-sm text-white/60">••••3691</p>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" className="flex-1">Edit</Button>
                          <Button variant="outline" size="sm" className="flex-1">Remove</Button>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-white/10 border-white/10">
                      <CardContent className="pt-6">
                        <div className="flex justify-between items-center mb-4">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-red-500/20 flex items-center justify-center">
                              <Smartphone className="h-5 w-5 text-red-500" />
                            </div>
                            <div>
                              <p className="font-medium">Airtel Money</p>
                              <p className="text-sm text-white/60">••••7832</p>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" className="flex-1">Edit</Button>
                          <Button variant="outline" size="sm" className="flex-1">Remove</Button>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-white/5 border-white/10 border-dashed flex flex-col items-center justify-center p-6">
                      <Button variant="outline" className="gap-2">
                        <CreditCard className="h-4 w-4" />
                        Add Payment Method
                      </Button>
                    </Card>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default SettingsPage;

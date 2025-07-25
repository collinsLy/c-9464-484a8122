import { useState, useEffect } from "react";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { updateEmail, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
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
  Upload, Database, Smartphone, PictureInPicture, FileCheck
} from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "@/components/ui/use-toast";
import AvatarCollection, { avatarOptions } from "@/components/AvatarCollection"; // Import avatarOptions
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { EmailNotificationDemo } from "@/components/EmailNotificationDemo";
import NumericalUidDisplay from '@/components/NumericalUidDisplay';
import KYCVerification from '@/components/kyc/KYCVerification';


const SettingsPage = () => {
  const { isDemoMode } = useDashboardContext();
  const [activeTab, setActiveTab] = useState("kyc");
  const [darkMode, setDarkMode] = useState(true);

  const [initialValues, setInitialValues] = useState({
    name: "",
    email: "",
    phone: "",
    profilePhoto: "",
    avatarId: "default" // Added avatarId
  });

  const [imageUpdateTimestamp, setImageUpdateTimestamp] = useState(Date.now());
  const [profileImageUrl, setProfileImageUrl] = useState("");
  const [isAvatarDialogOpen, setIsAvatarDialogOpen] = useState(false);
  const [selectedAvatarId, setSelectedAvatarId] = useState("default");
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const profileForm = useForm({
    defaultValues: initialValues
  });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            const profileData = {
              name: userData.fullName || "",
              email: user.email || "",
              phone: userData.phone || "",
              profilePhoto: userData.profilePhoto || "",
              avatarId: userData.avatarId || "default" // Added avatarId
            };

            setInitialValues(profileData);
            profileForm.reset(profileData);

            // Set the selected avatar ID from the user data
            setSelectedAvatarId(userData.avatarId || "default");

            if (userData.profilePhoto) {
              const cacheBustedUrl = `${userData.profilePhoto}?t=${Date.now()}`;
              setProfileImageUrl(cacheBustedUrl);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        toast({
          title: "Error",
          description: "Failed to load profile data",
          variant: "destructive"
        });
      }
    };

    fetchUserData();
  }, []);

  const checkPasswordStrength = (password: string): boolean => {
    const hasMinLength = password.length >= 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[^A-Za-z0-9]/.test(password);

    return hasMinLength && hasUpperCase && hasLowerCase && hasNumber && hasSpecial;
  };

  const handlePasswordChange = async () => {
    try {
      const { currentPassword, newPassword, confirmPassword } = passwordForm;

      // Validation
      if (!currentPassword || !newPassword || !confirmPassword) {
        toast({
          title: "Error",
          description: "Please fill in all password fields",
          variant: "destructive"
        });
        return;
      }

      if (newPassword !== confirmPassword) {
        toast({
          title: "Error",
          description: "New passwords do not match",
          variant: "destructive"
        });
        return;
      }

      if (!checkPasswordStrength(newPassword)) {
        toast({
          title: "Error",
          description: "Password must contain at least 8 characters, including uppercase, lowercase, number, and special character",
          variant: "destructive"
        });
        return;
      }

      const user = auth.currentUser;
      if (!user || !user.email) {
        toast({
          title: "Error",
          description: "User not authenticated",
          variant: "destructive"
        });
        return;
      }

      // Re-authenticate user with current password
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);

      // Update password
      await updatePassword(user, newPassword);

      // Reset form and close dialog
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setIsPasswordDialogOpen(false);

      toast({
        title: "Success",
        description: "Password updated successfully",
      });
    } catch (error: any) {
      console.error("Error updating password:", error);
      let errorMessage = "Failed to update password";

      if (error.code === 'auth/wrong-password') {
        errorMessage = "Current password is incorrect";
      } else if (error.code === 'auth/weak-password') {
        errorMessage = "New password is too weak";
      } else if (error.code === 'auth/requires-recent-login') {
        errorMessage = "Please log out and log back in before changing your password";
      }

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    }
  };

  const onSubmit = async (data: any) => {
    try {
      const user = auth.currentUser;
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to update your profile",
          variant: "destructive"
        });
        return;
      }

      await updateDoc(doc(db, 'users', user.uid), {
        fullName: data.name,
        phone: data.phone,
        avatarId: selectedAvatarId, // Update avatarId
        updatedAt: new Date().toISOString()
      });

      if (data.email !== user.email) {
        await updateEmail(user, data.email);
      }

      setInitialValues({
        name: data.name,
        email: data.email,
        phone: data.phone,
        profilePhoto: data.profilePhoto || "",
        avatarId: selectedAvatarId // Update avatarId
      });

      profileForm.reset({
        name: data.name,
        email: data.email,
        phone: data.phone,
        profilePhoto: data.profilePhoto || "",
        avatarId: selectedAvatarId // Update avatarId
      });

      toast({
        title: "Success",
        description: "Your profile information has been updated successfully",
      });
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive"
      });
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-white">Settings</h1>
          {isDemoMode && <div className="text-sm text-yellow-400 bg-yellow-400/10 px-3 py-1 rounded-md">Demo Mode</div>}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-background/40 backdrop-blur-lg border-white/10 text-white mb-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 w-full h-auto p-1">
            <TabsTrigger value="kyc" className="text-white data-[state=active]:bg-accent text-xs sm:text-sm flex-col sm:flex-row py-2 px-1 sm:px-3">
              <FileCheck className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2 mb-1 sm:mb-0" />
              <span className="hidden sm:inline">KYC</span>
              <span className="sm:hidden">KYC</span>
            </TabsTrigger>
            <TabsTrigger value="profile" className="text-white data-[state=active]:bg-accent text-xs sm:text-sm flex-col sm:flex-row py-2 px-1 sm:px-3">
              <User className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2 mb-1 sm:mb-0" />
              <span className="hidden sm:inline">Profile</span>
              <span className="sm:hidden">Profile</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="text-white data-[state=active]:bg-accent text-xs sm:text-sm flex-col sm:flex-row py-2 px-1 sm:px-3">
              <Lock className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2 mb-1 sm:mb-0" />
              <span className="hidden sm:inline">Security</span>
              <span className="sm:hidden">Security</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="text-white data-[state=active]:bg-accent text-xs sm:text-sm flex-col sm:flex-row py-2 px-1 sm:px-3">
              <Bell className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2 mb-1 sm:mb-0" />
              <span className="hidden sm:inline">Notifications</span>
              <span className="sm:hidden">Notify</span>
            </TabsTrigger>
            <TabsTrigger value="appearance" className="text-white data-[state=active]:bg-accent text-xs sm:text-sm flex-col sm:flex-row py-2 px-1 sm:px-3">
              <Moon className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2 mb-1 sm:mb-0" />
              <span className="hidden sm:inline">Appearance</span>
              <span className="sm:hidden">Theme</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="mt-0 space-y-6">
            <Card className="bg-background/40 backdrop-blur-lg border-white/10 text-white">
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pb-6 mb-4"> 
                <div className="flex flex-col lg:flex-row lg:items-start gap-4 sm:gap-6">
                  <div className="flex flex-col items-center gap-2 w-full lg:w-auto">
                    <Avatar className="h-16 w-16 sm:h-20 sm:w-20">
                      {selectedAvatarId !== "default" && selectedAvatarId ? (
                        // If avatar is selected, show the avatar from avatarOptions
                        <AvatarImage 
                          className="avatar-image" 
                          src={avatarOptions.find(a => a.id === selectedAvatarId)?.imageUrl || ""}
                          key={`avatar-${selectedAvatarId}-${imageUpdateTimestamp}`} 
                        />
                      ) : profileImageUrl ? (
                        // If no avatar selected but profile image exists, show that
                        <AvatarImage 
                          className="avatar-image" 
                          src={profileImageUrl}
                          key={`profile-${imageUpdateTimestamp}`} 
                          onError={(e) => {
                            console.log("Image failed to load, retrying with direct Supabase URL...");
                            if (profileForm.getValues().profilePhoto) {
                              setTimeout(async () => {
                                try {
                                  const { getProfileImageUrl } = await import('@/lib/supabase');
                                  const freshUrl = getProfileImageUrl(profileForm.getValues().profilePhoto);
                                  console.log("Generated fresh Supabase URL:", freshUrl);
                                  setProfileImageUrl(freshUrl);
                                  setImageUpdateTimestamp(Date.now());
                                } catch (err) {
                                  console.error("Error refreshing profile image URL:", err);
                                }
                              }, 500);
                            }
                          }}
                        />
                      ) : (
                        // Default fallback
                        <AvatarImage src="https://github.com/shadcn.png" />
                      )}
                      <AvatarFallback style={selectedAvatarId === "initials" ? {backgroundColor: avatarOptions.find(a => a.id === "initials")?.bgColor} : {}}>
                        {initialValues.name ? initialValues.name.slice(0, 2).toUpperCase() : "JD"}
                      </AvatarFallback>
                    </Avatar>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="gap-2"
                      onClick={() => {
                        setIsAvatarDialogOpen(true); // Open dialog on click
                      }}
                      type="button"
                      disabled={isDemoMode}
                    >
                      <PictureInPicture className="h-4 w-4" /> {/* Changed icon */}
                      {isDemoMode ? "Disabled in Demo" : "Change Avatar"} {/* Changed text */}
                    </Button>
                    <p className="text-xs text-white/60 text-center mt-1">Select from Avatars</p> {/* Changed text */}
                    <Input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      id="avatar-upload"
                      onChange={async (e) => {
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

                          try {
                            const user = auth.currentUser;
                            if (!user) {
                              toast({
                                title: "Error",
                                description: "You must be logged in to upload a profile picture",
                                variant: "destructive"
                              });
                              return;
                            }

                            // Show loading toast
                            toast({
                              title: "Uploading",
                              description: "Your profile picture is being uploaded...",
                            });

                            // Create a FileReader for image preview
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              // Update avatar display immediately for preview
                              const avatarImage = document.querySelector('.avatar-image') as HTMLImageElement;
                              if (avatarImage) {
                                avatarImage.src = reader.result as string;
                              }
                              // Temporarily set profilePhoto for preview
                              profileForm.setValue('profilePhoto', reader.result as string);
                            };
                            reader.readAsDataURL(file);

                            // Upload to Supabase
                            try {
                              const { uploadProfileImage } = await import('@/lib/supabase');
                              let imageUrl = await uploadProfileImage(user.uid, file);

                              // Fallback: If Supabase upload fails but we need to continue
                              if (!imageUrl) {
                                // Use Firebase storage as fallback if Supabase fails
                                const storage = getStorage();
                                const storageRef = ref(storage, `profile-photos/${user.uid}/${Date.now()}-${file.name}`);

                                // Upload to Firebase Storage
                                await uploadBytes(storageRef, file);
                                imageUrl = await getDownloadURL(storageRef);

                                toast({
                                  title: "Notice",
                                  description: "Using alternative storage for your profile picture",
                                });
                              }

                              if (imageUrl) {
                                // Import UserService properly
                                const { UserService } = await import('@/lib/firebase-service');

                                // Update user profile with the new image URL
                                await UserService.updateUserData(user.uid, {
                                  profilePhoto: imageUrl
                                });

                                // Update form value with the permanent URL
                                profileForm.setValue('profilePhoto', imageUrl);

                                // Also update initialValues to ensure it persists
                                setInitialValues(prev => ({
                                  ...prev,
                                  profilePhoto: imageUrl
                                }));

                                // Update timestamp to force avatar component to re-render with new image
                                const newTimestamp = Date.now();
                                setImageUpdateTimestamp(newTimestamp);

                                // Set the base URL in the form data
                                profileForm.setValue('profilePhoto', imageUrl);

                                // Clean the URL of any existing query parameters
                                const baseUrl = imageUrl.split('?')[0];

                                // Update the display URL with cache busting
                                const cacheBustUrl = `${baseUrl}?t=${newTimestamp}`;
                                setProfileImageUrl(cacheBustUrl);

                                // Force reload the image by preloading
                                const img = new Image();
                                img.onload = () => {
                                  console.log('Profile image preloaded successfully');
                                  // Force update the Avatar component by setting a new key
                                  setImageUpdateTimestamp(Date.now());
                                };
                                img.src = cacheBustUrl;

                                // Show success toast with more details
                                toast({
                                  title: "Success",
                                  description: "Profile picture updated successfully. It will remain after page refresh.",
                                });

                                // Log the update for debugging
                                console.log('Profile photo updated successfully:', imageUrl);
                              }
                            } catch (error: any) {
                              console.error("Error uploading profile picture:", error);
                              // Log more detailed error information for debugging
                              if (error.statusCode) {
                                console.error(`Status code: ${error.statusCode}`);
                              }
                              if (error.details) {
                                console.error("Error details:", error.details);
                              }

                              toast({
                                title: "Error",
                                description: error.message || "Failed to upload profile picture. Using fallback storage method.",
                                variant: "destructive"
                              });

                              // Fallback to Firebase storage if Supabase fails completely
                              try {
                                const storage = getStorage();
                                const storageRef = ref(storage, `profile-photos/${user.uid}/${Date.now()}-${file.name}`);

                                toast({
                                  title: "Info",
                                  description: "Attempting to use fallback storage...",
                                });

                                // Upload to Firebase Storage
                                await uploadBytes(storageRef, file);
                                const imageUrl = await getDownloadURL(storageRef);

                                if (imageUrl) {
                                  // Update form value with the Firebase URL
                                  profileForm.setValue('profilePhoto', imageUrl);

                                  // Update initialValues
                                  setInitialValues(prev => ({
                                    ...prev,
                                    profilePhoto: imageUrl
                                  }));

                                  // Update timestamp to force avatar component to re-render
                                  const newTimestamp = Date.now();
                                  setImageUpdateTimestamp(newTimestamp);

                                  // Set the base URL in the form data
                                  profileForm.setValue('profilePhoto', imageUrl);

                                  // Update the display URL with cache busting
                                  const cacheBustUrl = `${imageUrl}?t=${newTimestamp}`;
                                  setProfileImageUrl(cacheBustUrl);

                                  // Force reload the image
                                  const img = new Image();
                                  img.src = cacheBustUrl;

                                  // Show success toast
                                  toast({
                                    title: "Success",
                                    description: "Profile picture uploaded using fallback storage.",
                                  });

                                  // Update user profile with the new image URL
                                  const { UserService } = await import('@/lib/firebase-service');
                                  await UserService.updateUserData(user.uid, {
                                    profilePhoto: imageUrl
                                  });
                                }
                              } catch (fallbackError) {
                                console.error("Fallback storage also failed:", fallbackError);
                                toast({
                                  title: "Error",
                                  description: "All storage methods failed. Please try again later.",
                                  variant: "destructive"
                                });
                              }
                            }
                          } catch (error) {
                            console.error("Error uploading profile picture:", error);
                            toast({
                              title: "Error",
                              description: "An error occurred while uploading your profile picture",
                              variant: "destructive"
                            });
                          }
                        }
                      }}
                    />
                    <p className="text-xs text-white/60 text-center mt-1">Max size: 5MB</p>
                  </div>

                  <div className="flex-1 space-y-4 w-full">
                    <Form {...profileForm}>
                      <form onSubmit={profileForm.handleSubmit(onSubmit)} className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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

                      <NumericalUidDisplay />

                      <Button 
                        type="submit" 
                        className="bg-[#F2FF44] text-black font-medium hover:bg-[#E2EF34]"
                      >
                        Save Changes
                      </Button>
                    </form>
                    </Form>
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
                    <Button 
                      variant="outline" 
                      onClick={() => setIsPasswordDialogOpen(true)}
                      disabled={isDemoMode}
                    >
                      {isDemoMode ? "Disabled in Demo" : "Change Password"}
                    </Button>
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
              <CardContent className="space-y-4 sm:space-y-6">
                <div className="space-y-3 sm:space-y-4">
                  <h3 className="text-base sm:text-lg font-medium">Email Notifications</h3>
                  <div className="space-y-2 sm:space-y-3">
                    <div className="flex items-center justify-between py-1">
                      <Label htmlFor="email-price-alerts" className="text-sm sm:text-base">Price Alerts</Label>
                      <Switch id="email-price-alerts" checked={true} />
                    </div>
                    <div className="flex items-center justify-between py-1">
                      <Label htmlFor="email-trade-confirmations" className="text-sm sm:text-base">Trade Confirmations</Label>
                      <Switch id="email-trade-confirmations" checked={true} />
                    </div>
                    <div className="flex items-center justify-between py-1">
                      <Label htmlFor="email-deposit-withdrawals" className="text-sm sm:text-base">Deposit/Withdrawal Updates</Label>
                      <Switch id="email-deposit-withdrawals" checked={true} />
                    </div>
                    <div className="flex items-center justify-between py-1">
                      <Label htmlFor="email-newsletters" className="text-sm sm:text-base">Newsletters & Updates</Label>
                      <Switch id="email-newsletters" />
                    </div>
                  </div>

                  <Separator className="bg-white/10 my-4" />

                  <h3 className="text-base sm:text-lg font-medium">Push Notifications</h3>
                  <div className="space-y-2 sm:space-y-3">
                    <div className="flex items-center justify-between py-1">
                      <Label htmlFor="push-price-alerts" className="text-sm sm:text-base">Price Alerts</Label>
                      <Switch id="push-price-alerts" checked={true} />
                    </div>
                    <div className="flex items-center justify-between py-1">
                      <Label htmlFor="push-trade-confirmations" className="text-sm sm:text-base">Trade Confirmations</Label>
                      <Switch id="push-trade-confirmations" checked={true} />
                    </div>
                    <div className="flex items-center justify-between py-1">
                      <Label htmlFor="push-deposit-withdrawals" className="text-sm sm:text-base">Deposit/Withdrawal Updates</Label>
                      <Switch id="push-deposit-withdrawals" checked={true} />
                    </div>
                    <div className="flex items-center justify-between py-1">
                      <Label htmlFor="push-market-updates" className="text-sm sm:text-base">Market Updates</Label>
                      <Switch id="push-market-updates" />
                    </div>
                  </div>

                  <Separator className="bg-white/10 my-3 sm:my-4" />

                  <h3 className="text-base sm:text-lg font-medium">SMS Notifications</h3>
                  <div className="space-y-2 sm:space-y-3">
                    <div className="flex items-center justify-between py-1">
                      <Label htmlFor="sms-security" className="text-sm sm:text-base">Security Alerts</Label>
                      <Switch id="sms-security" checked={true} />
                    </div>
                    <div className="flex items-center justify-between py-1">
                      <Label htmlFor="sms-login" className="text-sm sm:text-base">Login Attempts</Label>
                      <Switch id="sms-login" checked={true} />
                    </div>
                    <div className="flex items-center justify-between py-1">
                      <Label htmlFor="sms-transactions" className="text-sm sm:text-base">Large Transactions</Label>
                      <Switch id="sms-transactions" checked={true} />
                    </div>
                  </div>
                </div>

                <Separator className="bg-white/10 my-4" />

                {/* Email Testing Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Email Testing & Configuration</h3>
                  <p className="text-sm text-muted-foreground">
                    Test email notifications for transactions and verify email service configuration.
                  </p>
                  <EmailNotificationDemo />
                </div>

                <div className="space-y-3 sm:space-y-4">
                  <Button 
                    variant="outline"
                    className="w-full bg-white/5 border-white/10 text-white hover:bg-white/10 hover:text-white text-sm sm:text-base py-2 sm:py-3"
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
                    className="w-full text-sm sm:text-base py-2 sm:py-3"
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
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                      <h3 className="text-base sm:text-lg font-medium">Theme</h3>
                      <p className="text-xs sm:text-sm text-white/60">Select your preferred theme</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button 
                        variant={darkMode ? "ghost" : "default"} 
                        size="sm" 
                        onClick={() => setDarkMode(false)}
                        className={`${darkMode ? "bg-white/10" : "bg-[#F2FF44] text-black"} text-xs sm:text-sm px-2 sm:px-3`}
                      >
                        <Sun className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                        Light
                      </Button>
                      <Button 
                        variant={darkMode ? "default" : "ghost"} 
                        size="sm" 
                        onClick={() => setDarkMode(true)}
                        className={`${darkMode ? "bg-[#F2FF44] text-black" : "bg-white/10"} text-xs sm:text-sm px-2 sm:px-3`}
                      >
                        <Moon className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
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

          <TabsContent value="kyc" className="mt-0 space-y-6">
            <Card className="bg-background/40 backdrop-blur-lg border-white/10 text-white">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <img 
                    src="https://bin.bnbstatic.com/static/images/mainuc/dashboard/start-kyc-no-success.svg" 
                    alt="KYC Verification" 
                    className="w-8 h-8"
                    onError={(e) => {
                      // If the image fails to load, replace it with a FileCheck icon
                      const iconElement = document.createElement('div');
                      iconElement.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-8 h-8 text-blue-400"><path d="M9 12l2 2 4-4"/><path d="M21 12c.552 0 1-.448 1-1V5a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v6c0 .552.448 1 1 1"/><path d="M3 13v6a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-6"/></svg>';
                      const svgElement = iconElement.firstChild;
                      e.currentTarget.parentNode.replaceChild(svgElement, e.currentTarget);
                    }}
                    onLoad={() => {
                      console.log('KYC image loaded successfully');
                    }}
                  />
                  <CardTitle>KYC Verification</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <KYCVerification />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        <Dialog open={isAvatarDialogOpen} onOpenChange={setIsAvatarDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Choose an Avatar</DialogTitle>
              <DialogDescription>
                Select an avatar to use as your profile picture
              </DialogDescription>
            </DialogHeader>
              <AvatarCollection 
                selectedAvatarId={selectedAvatarId} 
                onSelectAvatar={(avatar) => {
                  setSelectedAvatarId(avatar.id);

                  // Update the form value
                  profileForm.setValue('avatarId', avatar.id);

                  // Save avatar change immediately
                  const user = auth.currentUser;
                  if (user) {
                    updateDoc(doc(db, 'users', user.uid), {
                      avatarId: avatar.id,
                      updatedAt: new Date().toISOString()
                    })
                    .then(() => {
                      toast({
                        title: "Avatar Updated",
                        description: "Your avatar has been updated successfully",
                      });
                      setIsAvatarDialogOpen(false);
                    })
                    .catch(error => {
                      console.error("Error updating avatar:", error);
                      toast({
                        title: "Error",
                        description: "Failed to update avatar",
                        variant: "destructive"
                      });
                    });
                  } else {
                    setIsAvatarDialogOpen(false);
                  }
                }}
                userInitials={initialValues.name ? initialValues.name.slice(0, 2).toUpperCase() : "VT"}
              />
          </DialogContent>
        </Dialog>

        <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Change Password</DialogTitle>
              <DialogDescription>
                Enter your current password and choose a new secure password.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="current-password">Current Password</Label>
                <Input
                  id="current-password"
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                  placeholder="Enter current password"
                  className="bg-white/5 border-white/10"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                  placeholder="Enter new password"
                  className="bg-white/5 border-white/10"
                />
                <p className="text-xs text-white/60">
                  Password must contain at least 8 characters, including uppercase, lowercase, number, and special character
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  placeholder="Confirm new password"
                  className="bg-white/5 border-white/10"
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
                    setIsPasswordDialogOpen(false);
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handlePasswordChange}
                  className="flex-1 bg-[#F2FF44] text-black font-medium hover:bg-[#E2EF34]"
                >
                  Update Password
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default SettingsPage;
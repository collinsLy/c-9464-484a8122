
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { CardContent } from "@/components/ui/card";
import { auth, db } from "@/lib/firebase";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { toast } from "sonner";
import { Shield, CreditCard } from "lucide-react";

const VertexCardApplication: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    address: '',
    city: '',
    zipCode: '',
    country: 'Kenya',
    phoneNumber: '',
    employmentStatus: '',
    monthlyIncome: '',
    acceptTerms: false
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleCheckboxChange = (checked: boolean) => {
    setFormData(prev => ({ ...prev, acceptTerms: checked }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.acceptTerms) {
      toast.error("Please accept the terms and conditions");
      return;
    }
    
    try {
      setLoading(true);
      const user = auth.currentUser;
      
      if (!user) {
        toast.error("You must be logged in to apply for a card");
        return;
      }
      
      // Check if user already applied
      const cardAppRef = doc(db, 'cardApplications', user.uid);
      const cardAppDoc = await getDoc(cardAppRef);
      
      if (cardAppDoc.exists()) {
        const data = cardAppDoc.data();
        if (data.status === 'approved') {
          toast.error("You already have an approved card application");
          return;
        } else if (data.status === 'pending') {
          toast.error("You already have a pending application");
          return;
        }
      }
      
      // Submit application
      await setDoc(cardAppRef, {
        ...formData,
        userId: user.uid,
        userEmail: user.email,
        status: 'pending',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      toast.success("Your application has been submitted successfully", {
        description: "We'll review your application and notify you once it's approved."
      });
      
      // Also create a notification
      const notificationRef = doc(db, 'users', user.uid, 'notifications', `card-app-${Date.now()}`);
      await setDoc(notificationRef, {
        type: 'card-application',
        message: 'Your Vertex Card application has been submitted successfully',
        read: false,
        createdAt: serverTimestamp()
      });
      
    } catch (error) {
      console.error("Error submitting application:", error);
      toast.error("Failed to submit application", {
        description: "Please try again later or contact support."
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <CardContent className="p-6">
      <div className="space-y-6">
        <div className="flex items-center space-x-2 text-xl font-semibold mb-4">
          <CreditCard className="h-6 w-6 text-accent" />
          <h3>Apply for Vertex Card</h3>
        </div>
        
        <div className="bg-white/5 p-4 rounded-md mb-6 flex items-start">
          <Shield className="h-5 w-5 text-accent mr-3 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-white/80">
            Your information is secure and encrypted. We need this information to verify your identity
            and process your card application.
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name (as it appears on ID)</Label>
              <Input 
                id="fullName" 
                name="fullName"
                required
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Enter your full name" 
                className="bg-white/5 border-white/10"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <Input 
                id="phoneNumber" 
                name="phoneNumber"
                required
                value={formData.phoneNumber}
                onChange={handleChange}
                placeholder="Enter your phone number" 
                className="bg-white/5 border-white/10"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input 
                id="address" 
                name="address"
                required
                value={formData.address}
                onChange={handleChange}
                placeholder="Enter your address" 
                className="bg-white/5 border-white/10"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input 
                id="city" 
                name="city"
                required
                value={formData.city}
                onChange={handleChange}
                placeholder="Enter your city" 
                className="bg-white/5 border-white/10"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="zipCode">ZIP/Postal Code</Label>
              <Input 
                id="zipCode" 
                name="zipCode"
                required
                value={formData.zipCode}
                onChange={handleChange}
                placeholder="Enter ZIP/Postal code" 
                className="bg-white/5 border-white/10"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Select 
                value={formData.country}
                onValueChange={(value) => handleSelectChange('country', value)}
              >
                <SelectTrigger className="bg-white/5 border-white/10">
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Kenya">Kenya</SelectItem>
                  <SelectItem value="Nigeria">Nigeria</SelectItem>
                  <SelectItem value="South Africa">South Africa</SelectItem>
                  <SelectItem value="Ghana">Ghana</SelectItem>
                  <SelectItem value="Uganda">Uganda</SelectItem>
                  <SelectItem value="Tanzania">Tanzania</SelectItem>
                  <SelectItem value="Rwanda">Rwanda</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="employmentStatus">Employment Status</Label>
              <Select 
                value={formData.employmentStatus}
                onValueChange={(value) => handleSelectChange('employmentStatus', value)}
              >
                <SelectTrigger className="bg-white/5 border-white/10">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="employed">Employed</SelectItem>
                  <SelectItem value="self-employed">Self-employed</SelectItem>
                  <SelectItem value="student">Student</SelectItem>
                  <SelectItem value="retired">Retired</SelectItem>
                  <SelectItem value="unemployed">Unemployed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="monthlyIncome">Monthly Income (USD)</Label>
              <Input 
                id="monthlyIncome" 
                name="monthlyIncome"
                type="number"
                required
                value={formData.monthlyIncome}
                onChange={handleChange}
                placeholder="Enter your monthly income" 
                className="bg-white/5 border-white/10"
              />
            </div>
          </div>
          
          <div className="flex items-start space-x-2 pt-4">
            <Checkbox 
              id="acceptTerms" 
              checked={formData.acceptTerms}
              onCheckedChange={handleCheckboxChange}
            />
            <Label htmlFor="acceptTerms" className="text-sm">
              I agree to the Vertex Card Terms of Service, Privacy Policy, and consent to a credit check.
            </Label>
          </div>
          
          <Button 
            type="submit" 
            className="bg-[#F2FF44] text-black font-medium hover:bg-[#E2EF34] w-full"
            disabled={loading}
          >
            {loading ? "Submitting..." : "Submit Application"}
          </Button>
        </form>
      </div>
    </CardContent>
  );
};

export default VertexCardApplication;

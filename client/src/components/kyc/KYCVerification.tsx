import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Upload, CheckCircle, Clock, XCircle, FileText, Camera, CreditCard, Home } from "lucide-react";
import { kycService, KYCSubmission } from "@/lib/kyc-service";
import { toast } from "@/components/ui/use-toast";
import { BucketSetupInstructions } from "./BucketSetupInstructions";
import { SQLInstructions } from "./SQLInstructions";

interface DocumentUpload {
  type: 'id_front' | 'id_back' | 'selfie' | 'proof_of_address';
  file: File | null;
  preview: string | null;
  uploaded: boolean;
}

const KYCVerification = () => {
  const [step, setStep] = useState(1);
  const [kycStatus, setKycStatus] = useState<{ status: string; submissionId?: string; submittedAt?: Date } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [submission, setSubmission] = useState<KYCSubmission | null>(null);
  const [connectionTest, setConnectionTest] = useState<string>('');

  // Form data
  const [personalInfo, setPersonalInfo] = useState({
    fullName: '',
    dateOfBirth: '',
    address: '',
    country: '',
    documentType: 'passport' as 'passport' | 'drivers_license' | 'national_id',
    documentNumber: ''
  });

  const [documents, setDocuments] = useState<DocumentUpload[]>([
    { type: 'id_front', file: null, preview: null, uploaded: false },
    { type: 'id_back', file: null, preview: null, uploaded: false },
    { type: 'selfie', file: null, preview: null, uploaded: false },
    { type: 'proof_of_address', file: null, preview: null, uploaded: false }
  ]);

  useEffect(() => {
    checkKYCStatus();
    testSupabaseConnection();
  }, []);

  const testSupabaseConnection = async () => {
    try {
      const result = await kycService.testConnection();
      setConnectionTest(result.success ? `✅ ${result.message}` : `❌ ${result.message}`);
    } catch (error: any) {
      setConnectionTest(`❌ Connection test failed: ${error.message}`);
    }
  };

  const checkKYCStatus = async () => {
    try {
      const status = await kycService.getUserKYCStatus();
      setKycStatus(status);
      
      if (status?.submissionId) {
        const submissionData = await kycService.getKYCSubmission(status.submissionId);
        setSubmission(submissionData);
      }
    } catch (error) {
      console.error('Error checking KYC status:', error);
    }
  };

  const handleFileUpload = (type: 'id_front' | 'id_back' | 'selfie' | 'proof_of_address', file: File) => {
    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      toast({
        title: "File too large",
        description: "Please upload a file smaller than 10MB",
        variant: "destructive"
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setDocuments(prev => prev.map(doc => 
        doc.type === type 
          ? { ...doc, file, preview: e.target?.result as string, uploaded: false }
          : doc
      ));
    };
    reader.readAsDataURL(file);
  };

  const uploadDocument = async (docType: 'id_front' | 'id_back' | 'selfie' | 'proof_of_address') => {
    const doc = documents.find(d => d.type === docType);
    if (!doc?.file) return null;

    try {
      const url = await kycService.uploadDocument(doc.file, 'temp', docType);
      setDocuments(prev => prev.map(d => 
        d.type === docType ? { ...d, uploaded: true } : d
      ));
      return {
        type: docType,
        url,
        fileName: doc.file.name,
        uploadedAt: new Date()
      };
    } catch (error) {
      console.error(`Error uploading ${docType}:`, error);
      throw error;
    }
  };

  const handleSubmit = async () => {
    try {
      setIsLoading(true);

      // Upload all documents
      const uploadedDocs = [];
      for (const doc of documents) {
        if (doc.file) {
          const uploaded = await uploadDocument(doc.type);
          if (uploaded) uploadedDocs.push(uploaded);
        }
      }

      // Submit KYC application
      await kycService.submitKYC({
        personalInfo,
        documents: uploadedDocs
      });

      toast({
        title: "KYC Application Submitted",
        description: "Your application has been submitted for review. You'll be notified once it's processed.",
      });

      await checkKYCStatus();
    } catch (error) {
      console.error('Error submitting KYC:', error);
      toast({
        title: "Submission Error",
        description: "There was an error submitting your application. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'under_review':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      default:
        return <Clock className="w-5 h-5 text-blue-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-500';
      case 'rejected':
        return 'bg-red-500';
      case 'under_review':
        return 'bg-yellow-500';
      default:
        return 'bg-blue-500';
    }
  };

  const getDocumentIcon = (type: string) => {
    switch (type) {
      case 'id_front':
      case 'id_back':
        return <CreditCard className="w-5 h-5" />;
      case 'selfie':
        return <Camera className="w-5 h-5" />;
      case 'proof_of_address':
        return <Home className="w-5 h-5" />;
      default:
        return <FileText className="w-5 h-5" />;
    }
  };

  // If user already has a KYC submission, show status
  if (kycStatus) {
    return (
      <Card className="w-full max-w-2xl mx-auto bg-background/40 backdrop-blur-lg border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            {getStatusIcon(kycStatus.status)}
            KYC Verification Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <Badge className={`${getStatusColor(kycStatus.status)} text-white`}>
              {kycStatus.status.replace('_', ' ').toUpperCase()}
            </Badge>
            <span className="text-sm text-muted-foreground">
              Submitted: {kycStatus.submittedAt?.toLocaleDateString()}
            </span>
          </div>

          {submission?.adminComments && (
            <Alert>
              <AlertDescription>
                <strong>Admin Comments:</strong> {submission.adminComments}
              </AlertDescription>
            </Alert>
          )}

          {kycStatus.status === 'rejected' && (
            <Button 
              onClick={() => {
                setKycStatus(null);
                setSubmission(null);
                setStep(1);
              }}
              className="w-full"
            >
              Submit New Application
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto bg-background/40 backdrop-blur-lg border-white/10">
      <CardHeader>
        <CardTitle className="text-white">KYC Verification</CardTitle>
        <div className="flex justify-between text-sm text-white/60">
          <span>Step {step} of 3</span>
          <span>{Math.round((step / 3) * 100)}% Complete</span>
        </div>
      </CardHeader>
      <CardContent className="text-white">
        {connectionTest && (
          <div className="mb-4 space-y-3">
            <div className="p-3 text-sm bg-white/5 rounded border border-white/10">
              <strong>Supabase Status:</strong> {connectionTest}
            </div>
            
            {connectionTest.includes('Please create') && (
              <SQLInstructions />
            )}
          </div>
        )}
        <Progress value={(step / 3) * 100} className="mb-6" />
        
        {step === 1 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Personal Information</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  value={personalInfo.fullName}
                  onChange={(e) => setPersonalInfo(prev => ({ ...prev, fullName: e.target.value }))}
                  placeholder="Enter your full name"
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">Date of Birth</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={personalInfo.dateOfBirth}
                  onChange={(e) => setPersonalInfo(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                value={personalInfo.address}
                onChange={(e) => setPersonalInfo(prev => ({ ...prev, address: e.target.value }))}
                placeholder="Enter your full address"
                className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  value={personalInfo.country}
                  onChange={(e) => setPersonalInfo(prev => ({ ...prev, country: e.target.value }))}
                  placeholder="Enter your country"
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="documentType">Document Type</Label>
                <Select 
                  value={personalInfo.documentType} 
                  onValueChange={(value: 'passport' | 'drivers_license' | 'national_id') => 
                    setPersonalInfo(prev => ({ ...prev, documentType: value }))
                  }
                >
                  <SelectTrigger className="bg-white/5 border-white/10 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="passport">Passport</SelectItem>
                    <SelectItem value="drivers_license">Driver's License</SelectItem>
                    <SelectItem value="national_id">National ID</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="documentNumber">Document Number</Label>
              <Input
                id="documentNumber"
                value={personalInfo.documentNumber}
                onChange={(e) => setPersonalInfo(prev => ({ ...prev, documentNumber: e.target.value }))}
                placeholder="Enter your document number"
                className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
              />
            </div>

            <Button 
              onClick={() => setStep(2)} 
              className="w-full bg-[#F2FF44] text-black font-medium hover:bg-[#E2EF34]"
              disabled={!personalInfo.fullName || !personalInfo.dateOfBirth || !personalInfo.address || !personalInfo.country || !personalInfo.documentNumber}
            >
              Next: Upload Documents
            </Button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Upload Documents</h3>
            
            {documents.map((doc) => (
              <div key={doc.type} className="space-y-2">
                <Label className="flex items-center gap-2">
                  {getDocumentIcon(doc.type)}
                  {doc.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  {doc.type !== 'proof_of_address' && <span className="text-red-500">*</span>}
                </Label>
                
                <div className="border-2 border-dashed border-white/20 rounded-lg p-4 bg-white/5">
                  {doc.preview ? (
                    <div className="space-y-2">
                      <img 
                        src={doc.preview} 
                        alt={doc.type}
                        className="w-full h-32 object-cover rounded"
                      />
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          {doc.file?.name}
                        </span>
                        {doc.uploaded && (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center">
                      <Upload className="w-8 h-8 mx-auto mb-2 text-white/60" />
                      <p className="text-sm text-white/60">Click to upload or drag and drop</p>
                    </div>
                  )}
                  
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(doc.type, file);
                    }}
                    className="mt-2"
                  />
                </div>
              </div>
            ))}

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(1)} className="flex-1 border-white/20 text-white hover:bg-white/10">
                Previous
              </Button>
              <Button 
                onClick={() => setStep(3)} 
                className="flex-1 bg-[#F2FF44] text-black font-medium hover:bg-[#E2EF34]"
                disabled={!documents[0].file || !documents[1].file || !documents[2].file}
              >
                Next: Review
              </Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Review & Submit</h3>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Personal Information</h4>
                <div className="text-sm space-y-1 text-white/80">
                  <p><strong>Name:</strong> {personalInfo.fullName}</p>
                  <p><strong>Date of Birth:</strong> {personalInfo.dateOfBirth}</p>
                  <p><strong>Address:</strong> {personalInfo.address}</p>
                  <p><strong>Country:</strong> {personalInfo.country}</p>
                  <p><strong>Document:</strong> {personalInfo.documentType.replace('_', ' ')} - {personalInfo.documentNumber}</p>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Uploaded Documents</h4>
                <div className="grid grid-cols-2 gap-2">
                  {documents.filter(doc => doc.file).map((doc) => (
                    <div key={doc.type} className="text-center">
                      <img 
                        src={doc.preview!} 
                        alt={doc.type}
                        className="w-full h-24 object-cover rounded mb-1"
                      />
                      <p className="text-xs text-white/60">
                        {doc.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <Alert className="bg-yellow-500/10 border-yellow-500/20">
              <AlertDescription className="text-white/80">
                By submitting this application, you confirm that all information provided is accurate and complete. 
                False information may result in rejection of your application.
              </AlertDescription>
            </Alert>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(2)} className="flex-1 border-white/20 text-white hover:bg-white/10">
                Previous
              </Button>
              <Button 
                onClick={handleSubmit} 
                className="flex-1 bg-[#F2FF44] text-black font-medium hover:bg-[#E2EF34]"
                disabled={isLoading}
              >
                {isLoading ? "Submitting..." : "Submit Application"}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default KYCVerification;
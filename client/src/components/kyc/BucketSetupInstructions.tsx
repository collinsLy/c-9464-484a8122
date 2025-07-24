import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { ExternalLink, Database, Shield, FileText } from "lucide-react";

interface BucketSetupInstructionsProps {
  projectUrl: string;
}

export const BucketSetupInstructions = ({ projectUrl }: BucketSetupInstructionsProps) => {
  const handleOpenSupabase = () => {
    window.open(`${projectUrl}/storage/buckets`, '_blank');
  };

  return (
    <Alert className="border-amber-500/20 bg-amber-500/10">
      <Database className="h-4 w-4" />
      <AlertDescription className="space-y-3">
        <div>
          <strong className="text-amber-400">Manual Setup Required:</strong>
          <p className="text-sm text-gray-300 mt-1">
            Please create the KYC documents bucket in your Supabase dashboard:
          </p>
        </div>
        
        <div className="space-y-2 text-sm">
          <div className="flex items-start gap-2">
            <span className="text-amber-400 font-medium">1.</span>
            <span>Go to Storage → Buckets in your Supabase dashboard</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-amber-400 font-medium">2.</span>
            <span>Create a new bucket named <code className="bg-black/30 px-1 rounded">kyc-documents</code></span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-amber-400 font-medium">3.</span>
            <div className="space-y-1">
              <span>Configure the bucket with these settings:</span>
              <div className="ml-4 space-y-1 text-xs">
                <div className="flex items-center gap-2">
                  <Shield className="h-3 w-3" />
                  <span>Private bucket (not public)</span>
                </div>
                <div className="flex items-center gap-2">
                  <FileText className="h-3 w-3" />
                  <span>10MB file size limit</span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-amber-400 font-medium">4.</span>
            <span>Refresh this page to continue with KYC verification</span>
          </div>
        </div>

        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleOpenSupabase}
          className="border-amber-500/30 text-amber-400 hover:bg-amber-500/10"
        >
          <ExternalLink className="h-3 w-3 mr-2" />
          Open Supabase Dashboard
        </Button>
      </AlertDescription>
    </Alert>
  );
};
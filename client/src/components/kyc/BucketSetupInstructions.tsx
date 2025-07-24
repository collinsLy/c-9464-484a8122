import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { ExternalLink, Database, Shield, FileText } from "lucide-react";

interface BucketSetupInstructionsProps {
  projectUrl: string;
}

export const BucketSetupInstructions = ({ projectUrl }: BucketSetupInstructionsProps) => {
  const handleOpenSupabase = () => {
    window.open(`${projectUrl}/sql/new`, '_blank');
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
            <span>✅ Bucket created! Now set up permissions:</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-amber-400 font-medium">2.</span>
            <span>Go to SQL Editor in your Supabase dashboard</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-amber-400 font-medium">3.</span>
            <div className="space-y-1">
              <span>Run this SQL command to enable uploads:</span>
              <div className="ml-4 bg-black/40 p-2 rounded text-xs font-mono">
                <code>{`CREATE POLICY "KYC documents full access" ON storage.objects
  FOR ALL USING (bucket_id = 'kyc-documents')
  WITH CHECK (bucket_id = 'kyc-documents');`}</code>
              </div>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-amber-400 font-medium">4.</span>
            <span>Refresh this page to test KYC document uploads</span>
          </div>
        </div>

        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleOpenSupabase}
            className="border-amber-500/30 text-amber-400 hover:bg-amber-500/10"
          >
            <ExternalLink className="h-3 w-3 mr-2" />
            Open SQL Editor
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => window.location.reload()}
            className="border-green-500/30 text-green-400 hover:bg-green-500/10"
          >
            Refresh Page
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
};
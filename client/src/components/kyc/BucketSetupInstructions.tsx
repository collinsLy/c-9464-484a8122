import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

interface BucketSetupInstructionsProps {
  projectUrl: string;
}

export const BucketSetupInstructions = ({ projectUrl }: BucketSetupInstructionsProps) => {
  return (
    <Alert className="border-amber-500/30 bg-amber-500/10">
      <AlertTriangle className="h-4 w-4 text-amber-400" />
      <AlertDescription className="text-amber-200">
        <div className="space-y-3">
          <p className="font-medium">System Configuration Required</p>
          <p className="text-sm">
            The document verification system is currently being configured. Please try again in a few moments or contact support if this issue persists.
          </p>
        </div>

        <div className="flex gap-2">
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
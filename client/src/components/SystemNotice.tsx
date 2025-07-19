import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SystemNoticeProps {
  onDismiss?: () => void;
}

export const SystemNotice: React.FC<SystemNoticeProps> = ({ onDismiss }) => {
  return (
    <Alert className="mb-4 border-red-500/20 bg-red-500/10 text-white backdrop-blur-sm">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-5 h-5 mt-0.5">
          <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </div>
        <AlertDescription className="flex-1">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-red-400 font-semibold mb-2">🚫 Notice: Fiat Deposits Temporarily Unavailable</h3>
              <div className="text-white/90 space-y-1 text-sm">
                <p>We're currently experiencing issues with fiat (flat) deposit methods.</p>
                <p>If you'd like to fund your account, please use <span className="text-[#F2FF44] font-medium">crypto deposits instead</span>—they're fully operational and instant.</p>
                <p className="text-white/70 text-xs">– The Vertex Trading Team</p>
              </div>
            </div>
            {onDismiss && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onDismiss}
                className="text-white/70 hover:text-white hover:bg-white/10 h-auto p-1 ml-3"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </AlertDescription>
      </div>
    </Alert>
  );
};

export default SystemNotice;
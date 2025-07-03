
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { auth } from '@/lib/firebase';
import { NumericalUidService } from '@/lib/numerical-uid-service';

const NumericalUidDisplay = () => {
  const [numericalUid, setNumericalUid] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchNumericalUid = async () => {
      if (auth.currentUser?.uid) {
        try {
          const uid = await NumericalUidService.getNumericalUid(auth.currentUser.uid);
          setNumericalUid(uid);
        } catch (error) {
          console.error('Error fetching numerical UID:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchNumericalUid();
  }, []);

  const copyUid = () => {
    if (numericalUid) {
      navigator.clipboard.writeText(numericalUid.toString());
      toast({
        title: "Copied!",
        description: "Your numerical UID has been copied to clipboard",
      });
    }
  };

  return (
    <div className="space-y-1 p-3 bg-white/5 border border-white/10 rounded-md">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-medium">User ID (UID)</h3>
          <p className="text-xs text-white/60">Use this numerical ID to receive funds from other users</p>
        </div>
        <Button 
          variant="outline" 
          size="sm"
          onClick={copyUid}
          disabled={!numericalUid}
        >
          Copy UID
        </Button>
      </div>
      <div className="flex items-center mt-2 p-2 bg-white/10 rounded border border-white/5 overflow-hidden">
        <code className="text-sm font-mono text-white/90 overflow-hidden text-ellipsis">
          {loading ? 'Loading...' : (numericalUid || 'UID not generated')}
        </code>
      </div>
    </div>
  );
};

export default NumericalUidDisplay;

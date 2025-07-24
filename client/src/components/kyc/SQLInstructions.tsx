import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, ExternalLink } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

export const SQLInstructions = () => {
  const sqlCommand = `CREATE POLICY "KYC documents full access" ON storage.objects
  FOR ALL USING (bucket_id = 'kyc-documents')
  WITH CHECK (bucket_id = 'kyc-documents');`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(sqlCommand);
      toast({
        title: "Copied!",
        description: "SQL command copied to clipboard",
      });
    } catch (err) {
      toast({
        title: "Copy failed",
        description: "Please manually copy the SQL command",
        variant: "destructive",
      });
    }
  };

  const openSQLEditor = () => {
    window.open('https://supabase.com/dashboard/project/znibojwzbfqdzxovlxdv/sql/new', '_blank');
  };

  return (
    <Card className="bg-amber-500/10 border-amber-500/20">
      <CardHeader>
        <CardTitle className="text-amber-400 flex items-center gap-2">
          📋 SQL Setup Required
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-gray-300 text-sm">
          Run this SQL command in your Supabase dashboard to allow KYC document uploads:
        </p>

        <div className="bg-black/40 p-3 rounded font-mono text-xs text-gray-100 relative">
          <pre>{sqlCommand}</pre>
          <Button
            size="sm"
            variant="ghost"
            className="absolute top-2 right-2 h-6 w-6 p-0"
            onClick={copyToClipboard}
          >
            <Copy className="h-3 w-3" />
          </Button>
        </div>

        <div className="flex gap-2">
          <Button 
            onClick={openSQLEditor}
            className="bg-amber-600 hover:bg-amber-700 text-black"
            size="sm"
          >
            <ExternalLink className="h-3 w-3 mr-2" />
            Open SQL Editor
          </Button>
          <Button 
            onClick={copyToClipboard}
            variant="outline"
            className="border-amber-500/30 text-amber-400 hover:bg-amber-500/10"
            size="sm"
          >
            <Copy className="h-3 w-3 mr-2" />
            Copy SQL
          </Button>
        </div>

        <div className="text-xs text-gray-400 space-y-1">
          <p>1. Click "Open SQL Editor" above</p>
          <p>2. Paste the SQL command</p>
          <p>3. Click "RUN" to execute</p>
          <p>4. Refresh this page to test uploads</p>
        </div>
      </CardContent>
    </Card>
  );
};
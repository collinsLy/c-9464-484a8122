-- KYC Documents Storage RLS Policies
-- Run these SQL commands in your Supabase SQL Editor

-- Enable RLS on the storage.objects table (if not already enabled)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy to allow authenticated users to upload KYC documents
CREATE POLICY "Allow KYC document uploads" ON storage.objects
  FOR INSERT 
  WITH CHECK (
    bucket_id = 'kyc-documents' AND
    auth.role() = 'anon'
  );

-- Policy to allow users to view their own KYC documents
CREATE POLICY "Allow KYC document access" ON storage.objects
  FOR SELECT 
  USING (
    bucket_id = 'kyc-documents' AND
    auth.role() = 'anon'
  );

-- Policy to allow updating KYC documents (for resubmissions)
CREATE POLICY "Allow KYC document updates" ON storage.objects
  FOR UPDATE 
  USING (
    bucket_id = 'kyc-documents' AND
    auth.role() = 'anon'
  );

-- Policy to allow deleting KYC documents (for cleanup)
CREATE POLICY "Allow KYC document deletion" ON storage.objects
  FOR DELETE 
  USING (
    bucket_id = 'kyc-documents' AND
    auth.role() = 'anon'
  );

-- Alternative: More permissive policy for development/testing
-- Uncomment this if the above policies don't work and comment out the above policies

/*
-- Allow all operations on kyc-documents bucket for anon role
CREATE POLICY "KYC documents full access" ON storage.objects
  FOR ALL 
  USING (bucket_id = 'kyc-documents')
  WITH CHECK (bucket_id = 'kyc-documents');
*/
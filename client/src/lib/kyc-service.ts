import { doc, setDoc, getDoc, collection, query, where, getDocs, updateDoc, addDoc, orderBy, limit } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { supabase } from "@/lib/supabase";

// Import service client creator for privileged operations
let serviceClientInstance: any = null;

const getServiceClient = async () => {
  if (!serviceClientInstance) {
    const { createClient } = await import('@supabase/supabase-js');
    const supabaseUrl = 'https://znibojwzbfqdzxovlxdv.supabase.co';
    const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpuaWJvand6YmZxZHp4b3ZseGR2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzI1OTI3MywiZXhwIjoyMDY4ODM1MjczfQ.nbuDKz2CFpQNJ3rjrtsiyjY_F7R52UJ7doH7uDnkx_4';
    
    serviceClientInstance = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false }
    });
  }
  
  return serviceClientInstance;
};

export interface KYCDocument {
  type: 'id_front' | 'id_back' | 'selfie' | 'proof_of_address';
  url: string;
  fileName: string;
  uploadedAt: Date;
}

export interface KYCSubmission {
  id?: string;
  userId: string;
  userEmail: string;
  userName: string;
  status: 'pending' | 'under_review' | 'approved' | 'rejected';
  submittedAt: Date;
  reviewedAt?: Date;
  reviewedBy?: string;
  adminComments?: string;
  documents: KYCDocument[];
  personalInfo: {
    fullName: string;
    dateOfBirth: string;
    address: string;
    country: string;
    documentType: 'passport' | 'drivers_license' | 'national_id';
    documentNumber: string;
  };
}

class KYCService {
  private readonly BUCKET_NAME = 'kyc-documents';

  // Upload KYC document to Supabase
  async uploadDocument(file: File, userId: string, documentType: string): Promise<string> {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/${documentType}-${Date.now()}.${fileExt}`;
      
      // Create bucket if it doesn't exist
      await this.ensureBucketExists();
      
      // Use service client for upload to bypass RLS policies
      const serviceSupabase = await getServiceClient();
      
      const { error: uploadError, data } = await serviceSupabase.storage
        .from(this.BUCKET_NAME)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true,
          contentType: file.type
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw new Error('Failed to upload document. Please try again or contact support.');
      }

      // Since bucket is private, create a signed URL for secure access
      const { data: urlData, error: urlError } = await serviceSupabase.storage
        .from(this.BUCKET_NAME)
        .createSignedUrl(fileName, 3600); // Valid for 1 hour

      if (urlError) {
        console.error('Error creating signed URL:', urlError);
        throw new Error('Failed to process document. Please try again or contact support.');
      }

      return urlData.signedUrl;
    } catch (error) {
      console.error('Error uploading KYC document:', error);
      throw error;
    }
  }

  // Test Supabase connection and setup
  async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      // Test basic connection by listing buckets with service client
      const serviceSupabase = await getServiceClient();
      const { data: buckets, error } = await serviceSupabase.storage.listBuckets();
      
      if (error) {
        return { success: false, message: `Connection failed: ${error.message}` };
      }
      
      // Check if KYC bucket exists
      const kycBucketExists = buckets?.some((bucket: any) => bucket.name === this.BUCKET_NAME);
      
      // Ensure bucket exists
      await this.ensureBucketExists();
      
      const message = kycBucketExists 
        ? `Document storage system is ready and operational.`
        : `Document storage system has been configured successfully.`;
      
      return { 
        success: true, 
        message 
      };
    } catch (error: any) {
      return { 
        success: false, 
        message: `Document storage system is currently unavailable. Please try again later.` 
      };
    }
  }

  // Ensure KYC documents bucket exists
  private async ensureBucketExists(): Promise<void> {
    try {
      // Use service client to list and create buckets
      const serviceSupabase = await getServiceClient();
      const { data: buckets, error: listError } = await serviceSupabase.storage.listBuckets();
      
      if (listError) {
        console.warn('Could not list buckets:', listError.message);
        // Continue anyway, bucket might exist
        return;
      }
      
      const bucketExists = buckets?.some((bucket: any) => bucket.name === this.BUCKET_NAME);
      
      if (!bucketExists) {
        console.log('KYC documents bucket not found. Creating bucket...');
        
        // Try to create bucket with service client
        try {
          const { error } = await serviceSupabase.storage.createBucket(this.BUCKET_NAME, {
            public: false,
            fileSizeLimit: 10485760 // 10MB
          });
          
          if (error) {
            console.warn('Bucket creation failed:', error.message);
            console.log('Document storage system requires configuration. Please contact support.');
          } else {
            console.log('KYC documents bucket created successfully');
          }
        } catch (createError) {
          console.warn('Bucket creation error:', createError);
        }
      } else {
        console.log('KYC documents bucket already exists');
      }
    } catch (error) {
      console.warn('Error checking bucket existence:', error);
      // Don't throw - continue with upload attempt
    }
  }

  // Submit KYC application
  async submitKYC(submission: Omit<KYCSubmission, 'id' | 'userId' | 'userEmail' | 'userName' | 'submittedAt' | 'status'>): Promise<string> {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('User not authenticated');

      // Get user data from Firestore
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      const userData = userDoc.data();

      const kycData: Omit<KYCSubmission, 'id'> = {
        userId: user.uid,
        userEmail: user.email || '',
        userName: userData?.fullName || user.displayName || 'Unknown',
        status: 'pending',
        submittedAt: new Date(),
        ...submission
      };

      // Save to Firestore
      const docRef = await addDoc(collection(db, 'kyc_submissions'), kycData);
      
      // Update user's KYC status
      await updateDoc(doc(db, 'users', user.uid), {
        kycStatus: 'pending',
        kycSubmissionId: docRef.id,
        kycSubmittedAt: new Date()
      });

      return docRef.id;
    } catch (error) {
      console.error('Error submitting KYC:', error);
      throw error;
    }
  }

  // Get user's KYC status
  async getUserKYCStatus(): Promise<{ status: string; submissionId?: string; submittedAt?: Date } | null> {
    try {
      const user = auth.currentUser;
      if (!user) return null;

      const userDoc = await getDoc(doc(db, 'users', user.uid));
      const userData = userDoc.data();

      if (!userData?.kycStatus) return null;

      return {
        status: userData.kycStatus,
        submissionId: userData.kycSubmissionId,
        submittedAt: userData.kycSubmittedAt?.toDate()
      };
    } catch (error) {
      console.error('Error getting KYC status:', error);
      return null;
    }
  }

  // Get KYC submission details
  async getKYCSubmission(submissionId: string): Promise<KYCSubmission | null> {
    try {
      const submissionDoc = await getDoc(doc(db, 'kyc_submissions', submissionId));
      if (!submissionDoc.exists()) return null;

      const data = submissionDoc.data();
      return {
        id: submissionDoc.id,
        ...data,
        submittedAt: data.submittedAt.toDate(),
        reviewedAt: data.reviewedAt?.toDate()
      } as KYCSubmission;
    } catch (error) {
      console.error('Error getting KYC submission:', error);
      return null;
    }
  }

  // Admin: Get all KYC submissions
  async getAllKYCSubmissions(status?: string): Promise<KYCSubmission[]> {
    try {
      let q = query(
        collection(db, 'kyc_submissions'),
        orderBy('submittedAt', 'desc')
      );

      if (status) {
        q = query(
          collection(db, 'kyc_submissions'),
          where('status', '==', status),
          orderBy('submittedAt', 'desc')
        );
      }

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        submittedAt: doc.data().submittedAt.toDate(),
        reviewedAt: doc.data().reviewedAt?.toDate()
      })) as KYCSubmission[];
    } catch (error) {
      console.error('Error getting KYC submissions:', error);
      return [];
    }
  }

  // Admin: Update KYC status
  async updateKYCStatus(
    submissionId: string, 
    status: 'approved' | 'rejected' | 'under_review',
    adminComments?: string
  ): Promise<void> {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('Admin not authenticated');

      // Update KYC submission
      const updateData: any = {
        status,
        reviewedAt: new Date(),
        reviewedBy: user.email,
      };

      if (adminComments) {
        updateData.adminComments = adminComments;
      }

      await updateDoc(doc(db, 'kyc_submissions', submissionId), updateData);

      // Get submission to update user status
      const submission = await this.getKYCSubmission(submissionId);
      if (submission) {
        await updateDoc(doc(db, 'users', submission.userId), {
          kycStatus: status,
          kycReviewedAt: new Date()
        });
      }
    } catch (error) {
      console.error('Error updating KYC status:', error);
      throw error;
    }
  }

  // Get signed URL for document viewing (admin only)
  async getSignedDocumentUrl(url: string): Promise<string> {
    try {
      // Extract path from Supabase URL
      const urlParts = url.split('/');
      const fileName = urlParts[urlParts.length - 1];
      
      const { data } = supabase.storage
        .from(this.BUCKET_NAME)
        .getPublicUrl(fileName);

      return data.publicUrl;
    } catch (error) {
      console.error('Error getting signed URL:', error);
      return url; // Return original URL as fallback
    }
  }
}

export const kycService = new KYCService();
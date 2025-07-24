import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = 'https://znibojwzbfqdzxovlxdv.supabase.co';
// Keys are defined directly in the file instead of using environment variables
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpuaWJvand6YmZxZHp4b3ZseGR2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMyNTkyNzMsImV4cCI6MjA2ODgzNTI3M30.aR9hug-nd8J9iCUVOwvlWtyKE7yrFbzoM89CO0GNw5M';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpuaWJvand6YmZxZHp4b3ZseGR2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzI1OTI3MywiZXhwIjoyMDY4ODM1MjczfQ.nbuDKz2CFpQNJ3rjrtsiyjY_F7R52UJ7doH7uDnkx_4';

// Optional: Create a service client with admin privileges for storage operations
// This bypasses RLS policies for file operations
let serviceClient: any = null;

// Call this function only when needed to perform privileged operations
const getServiceClient = () => {
  if (!serviceClient) {
    // Use the service role key for admin operations
    serviceClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false }
    });
  }
  return serviceClient;
};

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false // Since we're using Firebase auth, we don't need to persist Supabase auth
  }
});

// Helper function to get profile image URL with cache busting
export const getProfileImageUrl = (profilePhotoPath: string): string => {
  if (!profilePhotoPath) {
    return '';
  }

  try {
    // If it's already a full URL with query params, extract just the base URL
    const baseUrl = profilePhotoPath.split('?')[0];

    // Get the path part from the URL if it contains profile-images
    let pathOnly = baseUrl;
    if (baseUrl.includes('profile-images/')) {
      pathOnly = baseUrl.split('profile-images/')[1];
    }

    // Use service client to get a fresh URL with transformations
    const serviceSupabase = getServiceClient();
    const { data } = serviceSupabase.storage
      .from('profile-images')
      .getPublicUrl(pathOnly, {
        transform: {
          width: 300,
          height: 300,
          resize: 'cover',
          quality: 80
        }
      });

    // Add timestamp to prevent caching issues
    return `${data.publicUrl}?t=${Date.now()}`;
  } catch (error) {
    console.error('Error generating profile image URL:', error);
    // Return the original URL with a timestamp as fallback
    return `${profilePhotoPath}?t=${Date.now()}`;
  }
};

// File storage helper functions
export const uploadProfileImage = async (userId: string, file: File): Promise<string | null> => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}-${Date.now()}.${fileExt}`;
    const filePath = `profiles/${fileName}`;

    // Use service client with admin privileges to bypass RLS policies
    const serviceSupabase = getServiceClient();

    console.log('Uploading profile image with service client...');
    const { error: uploadError, data } = await serviceSupabase.storage
      .from('profile-images')
      .upload(filePath, file, {
        upsert: true,
        cacheControl: '3600',
        contentType: file.type
      });

    if (uploadError) {
      console.error('Error uploading image to Supabase:', uploadError);

      // If storage system needs setup
      if (uploadError.message.includes('The resource was not found') || 
          uploadError.message.includes('bucket') || 
          uploadError.statusCode === '404') {

        console.log('Storage system needs configuration, attempting setup...');
        try {
          // Create the bucket if it doesn't exist
          const { error: createError } = await serviceSupabase
            .storage
            .createBucket('profile-images', { 
              public: true,
              fileSizeLimit: 5242880 // 5MB
            });

          if (!createError) {
            // Retry upload after bucket creation
            console.log('Bucket created, retrying upload...');
            const { error: retryError, data: retryData } = await serviceSupabase.storage
              .from('profile-images')
              .upload(filePath, file, {
                upsert: true,
                cacheControl: '3600',
                contentType: file.type
              });

            if (retryError) {
              console.error('Error on retry upload:', retryError);
              throw retryError;
            }

            // Get public URL with cache control
            const { data: urlData } = serviceSupabase.storage
              .from('profile-images')
              .getPublicUrl(filePath, {
                download: false,
                transform: {
                  width: 300, // Resize for better performance
                  height: 300,
                  resize: 'cover'
                }
              });

            // Add timestamp to bust cache 
            const publicUrl = `${urlData.publicUrl}?t=${Date.now()}`;
            console.log('Public URL generated with cache busting:', publicUrl);
            return publicUrl;
          } else {
            console.error('Error creating bucket:', createError);
            throw createError;
          }
        } catch (bucketError) {
          console.error('Error in bucket creation process:', bucketError);
          throw bucketError;
        }
      }

      throw uploadError;
    }

    // Get public URL with cache control and transform parameters
    const { data: urlData } = serviceSupabase.storage
      .from('profile-images')
      .getPublicUrl(filePath, {
        download: false,
        transform: {
          width: 300,
          height: 300,
          resize: 'cover',
          quality: 80
        }
      });

    // Add timestamp to bust cache
    const publicUrl = `${urlData.publicUrl}?t=${Date.now()}`;
    console.log('Public URL generated with cache busting:', publicUrl);
    return publicUrl;
  } catch (error) {
    console.error('Error in uploadProfileImage:', error);
    throw error; // Rethrow to allow caller to handle
  }
};

export const deleteProfileImage = async (filePath: string): Promise<boolean> => {
  try {
    // Skip if no filepath provided
    if (!filePath) {
      console.log('No profile image to delete');
      return true;
    }

    // Extract the path from the URL if it's a full URL
    const pathOnly = filePath.includes('profile-images/')
      ? filePath.split('profile-images/')[1]
      : filePath;

    // Use service client for deletion to bypass RLS
    const serviceSupabase = getServiceClient();

    console.log('Deleting profile image:', pathOnly);
    const { error } = await serviceSupabase.storage
      .from('profile-images')
      .remove([pathOnly]);

    if (error) {
      console.error('Error deleting image from Supabase:', error);
      // Don't fail if the file doesn't exist - it might have been deleted already
      if (error.message.includes('Object not found') || error.statusCode === '404') {
        console.log('File already deleted or not found');
        return true;
      }
      return false;
    }

    console.log('Profile image deleted successfully');
    return true;
  } catch (error) {
    console.error('Error in deleteProfileImage:', error);
    return false;
  }
};
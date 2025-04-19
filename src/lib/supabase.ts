
import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = 'https://wliejeubdpqhhbcfhshc.supabase.co';
// Use import.meta.env instead of process.env for Vite
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY || '';

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseKey);

// File storage helper functions
export const uploadProfileImage = async (userId: string, file: File): Promise<string | null> => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}-${Date.now()}.${fileExt}`;
    const filePath = `profiles/${fileName}`;
    
    // Check if the bucket exists, if not will return error anyway
    const { error: uploadError, data } = await supabase.storage
      .from('profile-images')
      .upload(filePath, file, {
        upsert: true, // Overwrite if exists
        cacheControl: '3600'
      });
    
    if (uploadError) {
      console.error('Error uploading image to Supabase:', uploadError);
      throw uploadError; // Throw to allow caller to handle
    }
    
    // Get public URL
    const { data: urlData } = supabase.storage
      .from('profile-images')
      .getPublicUrl(filePath);
    
    return urlData.publicUrl;
  } catch (error) {
    console.error('Error in uploadProfileImage:', error);
    throw error; // Rethrow to allow caller to handle
  }
};

export const deleteProfileImage = async (filePath: string): Promise<boolean> => {
  try {
    // Extract the path from the URL if it's a full URL
    const pathOnly = filePath.includes('profile-images/')
      ? filePath.split('profile-images/')[1]
      : filePath;
    
    const { error } = await supabase.storage
      .from('profile-images')
      .remove([pathOnly]);
    
    if (error) {
      console.error('Error deleting image from Supabase:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error in deleteProfileImage:', error);
    return false;
  }
};

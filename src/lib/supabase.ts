
import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = 'YOUR_SUPABASE_URL'; // Replace with your Supabase URL
const supabaseKey = 'YOUR_SUPABASE_ANON_KEY'; // Replace with your Supabase anon key

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseKey);

// File storage helper functions
export const uploadProfileImage = async (userId: string, file: File): Promise<string | null> => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}-${Date.now()}.${fileExt}`;
    const filePath = `profiles/${fileName}`;
    
    const { error: uploadError } = await supabase.storage
      .from('profile-images')
      .upload(filePath, file);
    
    if (uploadError) {
      console.error('Error uploading image to Supabase:', uploadError);
      return null;
    }
    
    // Get public URL
    const { data } = supabase.storage
      .from('profile-images')
      .getPublicUrl(filePath);
    
    return data.publicUrl;
  } catch (error) {
    console.error('Error in uploadProfileImage:', error);
    return null;
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

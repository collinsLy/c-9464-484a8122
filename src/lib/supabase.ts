
// Supabase stub - using Firebase Storage as primary storage
export const uploadProfileImage = async (userId: string, file: File): Promise<string | null> => {
  // This function is stubbed out since we're using Firebase Storage
  // Return null to trigger the Firebase Storage fallback
  console.log('Supabase upload not configured, falling back to Firebase Storage');
  return null;
};

// Add other Supabase-related functions as needed
export default {
  uploadProfileImage
};

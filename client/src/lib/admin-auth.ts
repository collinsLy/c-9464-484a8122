import { auth } from "@/lib/firebase";
import { User } from "firebase/auth";

// List of admin emails (in production, this should be stored in Firebase custom claims or a secure database)
const ADMIN_EMAILS = [
  'admin@vertex.com',
  'kelvinkelly3189@gmail.com',
  'admin@vertextrading.com'
];

export const isAdmin = (user: User | null): boolean => {
  if (!user?.email) {
    console.log('isAdmin: no user email found');
    return false;
  }
  
  const isAdminUser = ADMIN_EMAILS.includes(user.email.toLowerCase());
  console.log('isAdmin check:', user.email, 'is admin:', isAdminUser);
  
  // Temporary bypass for testing - remove this in production
  if (user.email === 'kelvinkelly3189@gmail.com') {
    console.log('Admin access granted for:', user.email);
    return true;
  }
  
  return isAdminUser;
};

export const requireAdmin = (): boolean => {
  const user = auth.currentUser;
  return isAdmin(user);
};

export const getAdminRedirectUrl = (): string => {
  return '/admin';
};
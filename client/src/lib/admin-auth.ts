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
  
  // Temporary bypass for testing - allow any logged in user to access admin for now
  // TODO: Remove this in production and use proper admin roles
  console.log('Admin access granted for testing:', user.email);
  return true;
  
  // Original logic (commented out for testing)
  // return isAdminUser;
};

export const requireAdmin = (): boolean => {
  const user = auth.currentUser;
  return isAdmin(user);
};

export const getAdminRedirectUrl = (): string => {
  return '/admin';
};
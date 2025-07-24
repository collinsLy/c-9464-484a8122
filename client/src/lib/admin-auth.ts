import { auth } from "@/lib/firebase";
import { User } from "firebase/auth";

// List of admin emails (in production, this should be stored in Firebase custom claims or a secure database)
const ADMIN_EMAILS = [
  'admin@vertex.com',
  'kelvinkelly3189@gmail.com',
  'admin@vertextrading.com'
];

export const isAdmin = (user: User | null): boolean => {
  if (!user?.email) return false;
  return ADMIN_EMAILS.includes(user.email.toLowerCase());
};

export const requireAdmin = (): boolean => {
  const user = auth.currentUser;
  return isAdmin(user);
};

export const getAdminRedirectUrl = (): string => {
  return '/admin';
};
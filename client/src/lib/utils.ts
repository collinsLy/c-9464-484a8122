import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


/**
 * Helper function to create responsive grid layouts
 * @param baseClass Base Tailwind classes
 * @param mobileConfig Mobile-specific configuration 
 * @param desktopConfig Desktop-specific configuration
 */
export const responsiveGrid = (
  baseClass: string = "grid gap-4", 
  mobileConfig: string = "grid-cols-1", 
  desktopConfig: string = "md:grid-cols-2 lg:grid-cols-3"
) => {
  return `${baseClass} ${mobileConfig} ${desktopConfig}`;
};

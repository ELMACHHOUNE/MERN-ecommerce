import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function sanitizeUrl(url: string): string {
  if (!url) return "";
  // Allow http, https, and relative paths
  if (/^(https?:\/\/|\/)/i.test(url)) {
    return url;
  }
  // If it doesn't match expected patterns, return empty or a placeholder
  return "";
}

export function isValidUrl(url: string): boolean {
  if (!url) return false;
  return /^(https?:\/\/|\/)/i.test(url);
}

import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export type Track = {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: string;
  image_url?: string;
  file_url?: string;
  user_id?: string;
};
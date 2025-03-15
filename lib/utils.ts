import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
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

export function toDuration(duration: string) {
  const minutes = Math.floor(Number(duration) / 60);
  const seconds = Number(duration) % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export function formatTrackProgress(progress: number, duration: number) {
  const currentTime = (progress / 100) * duration;
  const minutes = Math.floor(currentTime / 60);
  const seconds = Math.floor(currentTime % 60);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}
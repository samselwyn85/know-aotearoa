import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function placeShareUrl(slug: string) {
  if (import.meta.env.VITE_OFFLINE === "true") {
    return `https://know-aotearoa.vercel.app/place/${slug}`;
  }
  if (typeof location === "undefined") return `/place/${slug}`;
  return `${location.origin}/place/${slug}`;
}

/** Snapshot file. Relative when the app IS that file so file:// still works. */
export const HTML_FILE_HREF =
  import.meta.env.VITE_OFFLINE === "true" ? "./know-aotearoa.html" : "/know-aotearoa.html";


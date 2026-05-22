import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind class names safely.
 *
 * `clsx` handles conditional classes; `twMerge` resolves conflicts
 * (e.g. `px-2 px-4` collapses to `px-4`). Standard shadcn/ui helper.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

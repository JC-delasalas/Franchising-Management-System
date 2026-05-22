"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ComponentProps } from "react";

/**
 * Thin wrapper around next-themes' ThemeProvider so the layout can
 * import it directly without inheriting the "use client" boundary
 * from the third-party package.
 *
 * Defaults: respect system theme, persist user choice in localStorage
 * under `theme`. suppressHydrationWarning is set on <html> in layout
 * to avoid the next-themes hydration mismatch.
 */
export function ThemeProvider({ children, ...props }: ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}

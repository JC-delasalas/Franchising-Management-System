"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

/**
 * Single-button theme toggle (system → light → dark cycle).
 *
 * Keyboard accessible (it's a real <button>), aria-labeled, focusable.
 * Icon swap uses Tailwind's `dark:` variant; the underlying class on
 * <html> is set by next-themes.
 */
export function ThemeToggle({ className }: { className?: string }) {
  const { setTheme, resolvedTheme } = useTheme();
  const t = useTranslations("nav");

  return (
    <button
      type="button"
      aria-label={t("toggleTheme")}
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      className={cn(
        "hover:bg-accent hover:text-accent-foreground inline-flex h-9 w-9 items-center justify-center rounded-md transition-colors",
        "focus-visible:ring-ring focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none",
        className,
      )}
    >
      <Sun className="h-4 w-4 scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
      <Moon className="absolute h-4 w-4 scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
    </button>
  );
}

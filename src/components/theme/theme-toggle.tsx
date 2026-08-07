"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "./use-theme";

/**
 * Light/dark switch.
 *
 * Before mount the displayed theme is unknown (the server cannot read
 * localStorage), so the button renders in a disabled, icon-less state of the
 * same size. That keeps the header from shifting when the real icon appears and
 * avoids a hydration mismatch.
 */
export function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const ready = theme !== null;
  const next = theme === "dark" ? "light" : "dark";

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={!ready}
      aria-label={ready ? `Switch to ${next} theme` : "Loading theme"}
      title={ready ? `Switch to ${next} theme` : undefined}
      className="inline-flex size-9 items-center justify-center rounded-md border border-border text-muted transition-colors hover:bg-surface hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:opacity-50"
    >
      {ready ? (
        theme === "dark" ? (
          <Sun className="size-4" aria-hidden="true" />
        ) : (
          <Moon className="size-4" aria-hidden="true" />
        )
      ) : null}
    </button>
  );
}

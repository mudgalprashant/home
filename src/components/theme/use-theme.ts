"use client";

import { useCallback, useSyncExternalStore } from "react";

export type Theme = "light" | "dark";

const STORAGE_KEY = "theme";
const MEDIA_QUERY = "(prefers-color-scheme: dark)";

/**
 * Theme state lives in the DOM (`data-theme` on <html>) and localStorage, not in
 * React. That is deliberate: public/theme-init.js has to apply the theme before
 * React exists at all to avoid a flash, so the DOM is already the source of
 * truth by the time components mount.
 *
 * useSyncExternalStore is the right tool for reading external mutable state —
 * it handles the server/client split explicitly (getServerSnapshot returns null,
 * meaning "unknown") instead of guessing during render and causing a hydration
 * mismatch. It also means no provider component is needed.
 */

/** In-tab subscribers. The `storage` event only fires in *other* tabs. */
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

function subscribe(onStoreChange: () => void) {
  const media = window.matchMedia(MEDIA_QUERY);

  listeners.add(onStoreChange);
  // Follows the OS switching appearance while no explicit choice is stored.
  media.addEventListener("change", onStoreChange);
  // Keeps other tabs of the site in sync.
  window.addEventListener("storage", onStoreChange);

  return () => {
    listeners.delete(onStoreChange);
    media.removeEventListener("change", onStoreChange);
    window.removeEventListener("storage", onStoreChange);
  };
}

function getSnapshot(): Theme {
  const explicit = document.documentElement.dataset.theme;
  if (explicit === "light" || explicit === "dark") return explicit;
  return window.matchMedia(MEDIA_QUERY).matches ? "dark" : "light";
}

/** The server cannot know the stored choice, so it reports "unknown". */
function getServerSnapshot(): null {
  return null;
}

export function useTheme() {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const toggle = useCallback(() => {
    const next: Theme = getSnapshot() === "dark" ? "light" : "dark";

    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Private browsing can reject writes. The theme still applies to this page
      // view; it just will not persist.
    }

    emit();
  }, []);

  return { theme, toggle };
}

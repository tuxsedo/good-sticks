import { Capacitor } from "@capacitor/core";

// On the web (Vercel), API routes live on the same origin, so relative paths resolve correctly.
// In the native iOS/Android shell, the bundled web assets are served from capacitor://localhost,
// so server calls (the AI edge function) must target the deployed backend explicitly.
const NATIVE_API_ORIGIN = "https://goodsticks.net";

export const API_BASE = Capacitor.isNativePlatform() ? NATIVE_API_ORIGIN : "";

/** Build a URL for a same-origin API path that also works inside the native app shell. */
export const apiUrl = (path: string): string => `${API_BASE}${path}`;

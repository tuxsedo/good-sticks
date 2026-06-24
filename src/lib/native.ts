import { Capacitor } from "@capacitor/core";
import { StatusBar, Style } from "@capacitor/status-bar";

/**
 * One-time native shell setup. No-ops on the web build so the same bundle runs everywhere.
 */
export async function initNative(): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;

  try {
    // Dark app → light status bar text.
    await StatusBar.setStyle({ style: Style.Light });
  } catch {
    // StatusBar isn't available on every platform; ignore.
  }
}

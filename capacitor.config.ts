import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "net.goodsticks.app",
  appName: "GoodSticks",
  webDir: "dist",
  ios: {
    // Use the device's content inset behavior so the app respects the notch/home indicator.
    contentInset: "always",
    backgroundColor: "#10131a", // matches hsl(220 20% 7%) dark theme
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1200,
      backgroundColor: "#10131a",
      showSpinner: false,
      launchAutoHide: true,
    },
  },
};

export default config;

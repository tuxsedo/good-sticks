# Shipping GoodSticks to the iOS App Store

GoodSticks is wrapped as a native iOS app with [Capacitor](https://capacitorjs.com).
The existing React/Vite web app runs inside a native WKWebView shell. The Xcode
project lives in `ios/`.

## How it works

- `npm run build` produces `dist/` (the web bundle).
- `npx cap sync ios` copies `dist/` into the native project and updates plugins.
- The native shell loads those assets locally from `capacitor://localhost` — there is
  no web server. Because of that, the AI chat calls the **deployed** backend at
  `https://goodsticks.net/api/chat` when running natively (see `src/lib/config.ts`).
  The edge function already sends `Access-Control-Allow-Origin: *`, so CORS is fine.

### Day-to-day commands

```sh
npm run ios:sync   # vite build + cap sync ios  (run after any web change)
npm run ios:open   # open the project in Xcode
```

## One-time setup (requires you)

These steps need a GUI + your Apple accounts and can't be automated from the CLI:

1. **Install Xcode** from the Mac App Store (the full IDE — Command Line Tools alone
   are not enough to build/sign/archive). Then run
   `sudo xcode-select -s /Applications/Xcode.app/Contents/Developer`.
2. **Enroll in the Apple Developer Program** ($99/yr): https://developer.apple.com/programs/
3. **Create the app record** in App Store Connect (https://appstoreconnect.apple.com)
   with bundle ID `net.goodsticks.app` (matches `capacitor.config.ts`).

## Build & submit

1. `npm run ios:sync && npm run ios:open`
2. In Xcode: select the **App** target → **Signing & Capabilities** → set your Team
   (enables automatic signing).
3. Set **Version** (e.g. `1.0.0`) and **Build** (e.g. `1`) under General.
4. Choose **Any iOS Device** as the destination → **Product ▸ Archive**.
5. In the Organizer, **Distribute App ▸ App Store Connect ▸ Upload**.
6. In App Store Connect: add screenshots, description, privacy policy URL, and submit
   for review.

## App Store gotchas specific to this app

- **Tobacco content / age rating.** The App Store age questionnaire asks about
  tobacco references. A cigar app must be rated **17+** and must not appear to
  encourage tobacco use by minors. Frame it as a guide/journal for adult enthusiasts.
- **Guideline 4.2 (minimum functionality).** Apple rejects apps that are "just a
  repackaged website." GoodSticks clears this bar (local palate profile, humidor &
  wishlist tracking, native splash/status bar, offline-capable UI) — but keep leaning
  into native-feeling features over time (haptics and keyboard plugins are already
  installed and available).
- **Privacy.** You need a privacy policy URL. The app stores the palate profile
  locally and (optionally) syncs via Supabase, and sends chat messages to the AI
  backend. Fill out the App Privacy "Nutrition Label" accordingly (no tracking/ads
  today). Sign-in via Supabase magic link is **email**-based.
- **Account deletion.** If you keep Supabase accounts, Apple requires an in-app way to
  delete the account.

## Known follow-ups (not launch blockers)

- **Magic-link auth setup.** The iOS shell registers `goodsticks://auth` and handles it
  with `@capacitor/app`'s `appUrlOpen`. Supabase must allowlist that redirect URL, and
  the build must include `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`; otherwise
  the app keeps account sync disabled and local-only data still works.
- **Native polish.** Consider wiring `@capacitor/haptics` into key interactions and
  honoring `env(safe-area-inset-*)` in the bottom nav for edge-to-edge devices.

## Regenerating app icons / splash

Source art lives in `assets/icon.svg` and `assets/splash.svg`. Regenerate all sizes:

```sh
npx @capacitor/assets generate --ios
```

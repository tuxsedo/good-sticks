# GoodSticks

An AI cigar guide. Describe your moment — the drink, the mood, the time — and get one confident recommendation tailored to your palate.

**Live:** [goodsticks.net](https://goodsticks.net)

---

## What it does

- 6-question onboarding to build your palate profile (strength, flavor notes, drink pairing)
- Palate stored in localStorage — no account required
- Streaming AI recommendations via Claude (Haiku)
- Humidor tracker and wishlist

---

## Stack

| Layer | Tool |
|---|---|
| Framework | Vite + React + TypeScript |
| Styling | Tailwind CSS + shadcn/ui |
| AI | Anthropic Claude (`claude-haiku-4-5-20251001`) via Vercel Edge Function |
| Hosting | Vercel (auto-deploys from `main`) |

---

## Local development

```sh
git clone https://github.com/tuxsedo/good-sticks
cd good-sticks
npm install
npm run dev
```

Requires an `ANTHROPIC_API_KEY` environment variable. For local dev, create a `.env` file:

```
ANTHROPIC_API_KEY=sk-ant-...
```

---

## Project structure

```
src/
├── pages/
│   ├── Landing.tsx       # Homepage
│   ├── Onboarding.tsx    # 6-step palate flow
│   ├── Chat.tsx          # AI recommendation chat
│   ├── Home.tsx          # Post-onboarding home
│   ├── Humidor.tsx       # Saved cigars
│   └── Wishlist.tsx      # Want-to-try list
├── index.css             # Design tokens, Tailwind layers
└── App.tsx               # Routing

api/
└── chat.ts               # Vercel Edge Function — Claude API + palate injection
```

---

## Deployment

Vercel auto-deploys on push to `main`. Environment variables are set in the Vercel dashboard.

The `api/chat.ts` Edge Function requires `ANTHROPIC_API_KEY` to be set in Vercel project settings.

---

## Design

Dark theme: near-black background (`hsl(220 20% 7%)`), amber/gold accents (`hsl(25 85% 55%)`), cream text. Playfair Display for headings. Mobile-first — the user is at their humidor with their phone.

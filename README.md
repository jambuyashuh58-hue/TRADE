# TradePulse India 🇮🇳

> Your personal trading intelligence platform — unified P&L, smart exit alerts, AI strategy, and social trade sharing.

---

## ✅ What's Built

| Feature | Status |
|---|---|
| Unified P&L Dashboard | ✅ Ready |
| Portfolio — add positions manually | ✅ Ready |
| Portfolio — import Groww CSV | ✅ Ready |
| Exit Alert Engine (profit target / stop loss) | ✅ Ready |
| Browser push notifications | ✅ Ready |
| WhatsApp alerts via CallMeBot (free) | ✅ Ready |
| AI Daily Strategy Brief (Claude API) | ✅ Ready |
| Live market indices (NIFTY/SENSEX/BANKNIFTY) | ✅ Ready — Yahoo Finance |
| Social trade feed | ✅ Ready |
| Settings page | ✅ Ready |
| Dark trading terminal theme | ✅ Ready |
| 30-day P&L chart | ✅ Ready |

---

## 🚀 Setup in 10 Minutes

### 1. Clone / unzip the project

```bash
cd tradepulse
```

### 2. Install dependencies

```bash
npm install
```

### 3. Create your environment file

```bash
cp .env.example .env.local
```

Open `.env.local` and add your Anthropic API key:
```
ANTHROPIC_API_KEY=sk-ant-api03-...
```

Get your key free at: https://console.anthropic.com

### 4. Run the dev server

```bash
npm run dev
```

Open http://localhost:3000 — you're live! 🎉

---

## 📱 How to Use

### Step 1 — Add your positions
Go to **Portfolio** → either:
- Click **"Add Position"** and enter manually
- Click **"Import Groww CSV"** and drop your export

#### How to export from Groww:
1. Open Groww app
2. Go to Portfolio tab
3. Tap "..." → Download Holdings / P&L CSV
4. Drop the CSV into TradePulse

### Step 2 — Set your daily targets
Go to **Settings** and configure:
- Daily Profit Target (e.g. ₹2,000)
- Daily Stop Loss (e.g. ₹1,000)
- Capital to Deploy (e.g. ₹50,000)

### Step 3 — Set up exit alerts
Go to **Alerts** → "New Alert":
- Create a "Daily Profit Target" alert at ₹2,000
- Create a "Daily Stop Loss" alert at ₹1,000
- The engine checks every 30 seconds automatically

### Step 4 — Get your AI morning brief
Go to **AI Strategy** → Click "Get Today's Brief"
The AI will:
- Analyze NIFTY/SENSEX/BANKNIFTY levels
- Suggest how much capital to deploy
- Give sector outlook
- Flag today's key risk

### Step 5 — Set up WhatsApp alerts (optional, free)
1. Save `+34 603 21 25 97` in your contacts as "CallMeBot"
2. Send this message: `I allow callmebot to send me messages`
3. You'll receive an API key on WhatsApp
4. Go to TradePulse Settings → enter your number + API key
5. Enable "WhatsApp alerts" toggle

---

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS (dark terminal theme) |
| State | Zustand (persisted to localStorage) |
| Charts | Recharts |
| AI | Anthropic Claude API (claude-sonnet-4) |
| Market Data | Yahoo Finance API (free, no key needed) |
| CSV Import | PapaParse |
| Alerts | Browser Notifications + CallMeBot WhatsApp |
| Data Fetching | SWR (30s auto-refresh) |

---

## 🗂️ Project Structure

```
tradepulse/
├── src/
│   ├── app/
│   │   ├── page.tsx              ← Dashboard
│   │   ├── portfolio/page.tsx    ← Portfolio management
│   │   ├── alerts/page.tsx       ← Alert rules
│   │   ├── strategy/page.tsx     ← AI strategy
│   │   ├── social/page.tsx       ← Social feed
│   │   ├── settings/page.tsx     ← Settings
│   │   ├── api/
│   │   │   ├── market/route.ts   ← Yahoo Finance proxy
│   │   │   └── strategy/route.ts ← Claude AI strategy
│   │   ├── layout.tsx
│   │   └── globals.css
│   ├── lib/
│   │   ├── types.ts              ← All TypeScript types
│   │   ├── store.ts              ← Zustand global state
│   │   └── utils.ts             ← Helpers, formatters, parsers
│   └── components/
│       └── layout/
│           └── Sidebar.tsx
├── .env.example
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

---

## 🔜 Roadmap (What to Build Next)

### Week 2 — More brokers
- [ ] Angel One SmartAPI integration (free, no monthly fee)
- [ ] Zerodha Kite Connect (₹2,000/month, websocket P&L)
- [ ] Upstox API integration

### Week 3 — Better tracking
- [ ] End-of-day P&L auto-save (runs at 3:30 PM)
- [ ] Win rate and streak tracking
- [ ] Trade journal with notes

### Month 2 — Mobile
- [ ] PWA (Progressive Web App) — works on phone like an app
- [ ] React Native wrapper for Play Store / App Store

### Month 3 — Monetization
- [ ] Freemium gating (1 broker free, all brokers paid)
- [ ] Razorpay subscription (₹499/month)
- [ ] Invite friends → referral tracking

---

## ⚖️ Legal & SEBI Note

This is **personal-use analysis software**, not financial advice.

- Portfolio tracking and alerts = **no SEBI registration needed**
- The AI strategy output is **market analysis**, not investment advice
- Always add the disclaimer: "Not SEBI registered. Not financial advice."
- Do NOT auto-execute trades without broker compliance
- All trading decisions remain entirely with you

---

## 🐛 Common Issues

**"Market data not loading"**
→ Yahoo Finance may occasionally rate-limit. Wait 30 seconds and refresh.

**"AI Strategy fails"**
→ Check your `ANTHROPIC_API_KEY` in `.env.local`. Make sure there are no spaces.

**"Groww CSV not importing"**
→ Make sure you're downloading the Holdings or P&L CSV (not trade history). Try exporting from Groww web instead of app.

**"WhatsApp alert not received"**
→ Verify you've sent the activation message to CallMeBot and received confirmation.

---

Built with ❤️ for Indian retail traders.

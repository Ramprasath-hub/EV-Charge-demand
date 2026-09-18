# AI-Based EV Charging Demand Prediction Dashboard

A modern, responsive, mobile-friendly frontend dashboard created for the final-year engineering project: **"AI-Based EV Charging Demand Prediction"**.

---

## 🌟 Key Features

1. **Brand Identity**: Clean logo badge with glowing pulse animation, and project metadata.
2. **Top Header**:
   - Hamburger Menu (left) with slide-out drawer containing 11 navigation links.
   - Notification Bell (right) with real-time badge count and 4-category alert feed.
3. **Current Charging Demand Card**: Live grid active power load (kW), capacity percentage circular gauge, and grid stress level meter.
4. **Available Charging Stations Card**: Total active hubs count (28) and breakdown of ports (150kW Ultra-Fast DC, 50-60kW Fast DC, 22kW AC).
5. **AI Demand Prediction Forecast Graph**: Interactive Chart.js visualizer showing actual vs. AI-predicted demand curve with 95% confidence intervals and peak threshold indicators (24H, 7D, 30D filters).
6. **Peak-Hour Demand Prediction**: Highlighted morning rush (08:30–10:45 AM) and evening surge (06:15–09:30 PM) windows with severity tags and scheduling recommendations.
7. **Nearby Charging Stations**: Real-time cards with distance, plug types (CCS2, Type 2, CHAdeMO), pricing/kWh, power ratings, favorite toggles, and slot reservation modals.
8. **Smart Charging Recommendation**: Automated off-peak tariff optimizer highlighting the 11:30 PM–04:00 AM window for maximum savings (38% discount).
9. **Energy and Cost Estimation Calculator**: Interactive calculator with live sliders for battery % (Current to Target), EV model selector, charger power selector, and real-time computation of energy (kWh), charging time, cost savings, and CO2 emissions saved.
10. **Bottom Navigation**: 5 interactive tabs:
    - **Home**: Executive overview dashboard.
    - **Map**: Interactive Leaflet map with colored station pins (Green/Amber/Red), speed filters, and station preview popups.
    - **Predict**: AI Demand Prediction Studio sandbox with customizable environmental & traffic surge parameters.
    - **Analytics**: Historical peak load trends, renewable energy mix donut chart, and hourly congestion heatmaps.
    - **Profile**: Vehicle specs, battery telematics, and past charging history.
11. **Modals & Drawer Navigation**:
    - Full hamburger side drawer with 11 links (*Home, Charging Stations, AI Demand Prediction, Analytics, Smart Charging, Notifications, Favorite Stations, Profile, Settings, About Project, Logout*).
    - Notification overlay with 4 alert categories (*High Demand Alert, Station Availability, Peak Hour Prediction, Smart Charging Suggestion*).
    - About Project academic modal with problem statement and Bi-LSTM methodology.
    - Station Reservation modal with QR pass (`#EVC-RES-9824`).
    - Settings modal with live Dark/Light theme toggle.

---

## 🎨 Design System
- **Color Palette**: Electric Blue (`#2563EB`), Eco Green (`#10B981`), Teal/Cyan (`#0D9488`/`#06B6D4`), and Crisp Whites/Slate (`#FFFFFF`/`#F8FAFC`).
- **Typography**: Google Fonts (*Plus Jakarta Sans* & *Outfit*).
- **Icons**: Lucide SVG Icons.

---

## 🚀 How to Run Locally

Run the Express application so the frontend and `/api/*` routes use the same origin:

```powershell
npm install
npm start
```

Then navigate to `http://localhost:5500`. Do not use `python -m http.server`, `npx serve`, or open `index.html` directly; those static servers do not provide the Firebase configuration API.

---

## ⚠️ Academic Disclaimer
All prediction figures, charging rates, and occupancy numbers are sample simulation placeholder values for UI demonstration purposes as specified for the frontend submission.

## Firebase Authentication Setup

The login UI uses Firebase Web Email/Password and Google Authentication. Firebase web configuration values are public client configuration, but Firebase Admin SDK credentials and service-account JSON must never be placed in this project or sent to the browser.

### Configure Firebase Console

1. Create a project at [Firebase Console](https://console.firebase.google.com/).
2. Open **Project settings**, add a **Web app**, and copy its Firebase SDK configuration values.
3. Open **Build > Authentication > Sign-in method**, enable **Email/Password** and **Google**, and save.
4. In **Authentication > Settings > Authorized domains**, add `localhost` for development. Firebase may already include it; verify it is present.
5. Add the production hostname there later, without the protocol or path, for example `ev.example.com`.
6. Google sign-in requires the browser to reach Google's authentication services; no server-side OAuth secret is needed for this client flow.

Copy `.env.example` to `.env` and fill in the six values from the Web app configuration:

```bash
copy .env.example .env
npm install
npm start
```

On macOS/Linux, use `cp .env.example .env` instead of `copy`. The server exposes only these public web values through `/api/config/firebase`; do not add a Firebase Admin SDK key or service-account JSON.

### Run and Test

Run the project from the workspace directory with `npm start`, then open `http://localhost:5500`. Do not open `index.html` directly because the Firebase configuration endpoint and Socket.IO server are provided by Express.

For development, use **Need an account? Sign up** to create an email/password account, then log in with that same address and password. Google sign-in works only after the Google provider is enabled and `localhost` is listed under **Authentication > Settings > Authorized domains**. If Firebase reports `auth/invalid-credential`, check the account and password; if it reports `auth/operation-not-allowed`, enable the corresponding provider in Firebase Console.

### Authentication Flow

The browser initializes Firebase from the values served by `/api/config/firebase`, then calls `signInWithEmailAndPassword()` or `signInWithPopup()` as appropriate. Firebase error codes are logged in the development console and mapped to user-facing messages. Credentials are not stored by this application; Firebase manages authenticated-user persistence.

## Deploying with Netlify + Render/Railway

This project has two parts: Netlify hosts the static dashboard, while the Node.js server must run on Render or Railway. MySQL must be hosted by a managed MySQL provider; Netlify cannot run the Express server or a persistent MySQL connection.

### 1. Deploy the backend

Create a Node web service from this repository and set:

- Build command: `npm install`
- Start command: `npm start`
- Health check URL: `/api/system/status`

Set these backend environment variables in the hosting provider:

```text
PORT=<provider supplied port, if required>
FRONTEND_ORIGIN=https://<your-site>.netlify.app
DB_HOST=<managed MySQL host>
DB_PORT=3306
DB_USER=<managed MySQL user>
DB_PASSWORD=<managed MySQL password>
DB_NAME=ev_charge_demand
DB_CONNECTION_LIMIT=10
TELEMETRY_INTERVAL_MS=3500
FIREBASE_API_KEY=<Firebase web app value>
FIREBASE_AUTH_DOMAIN=<Firebase auth domain>
FIREBASE_PROJECT_ID=<Firebase project ID>
FIREBASE_STORAGE_BUCKET=<Firebase storage bucket>
FIREBASE_MESSAGING_SENDER_ID=<Firebase sender ID>
FIREBASE_APP_ID=<Firebase web app ID>
PAYTM_ENV=sandbox
PAYTM_MID=
PAYTM_MERCHANT_KEY=
PAYTM_WEBSITE=WEBSTAGING
PAYTM_CALLBACK_URL=https://<backend-host>/api/payments/paytm/callback
```

Do not upload `.env` or commit database passwords. The server initializes the schema and seed data when it first connects to MySQL.

### 2. Deploy the frontend to Netlify

Import the same repository into Netlify. The included `netlify.toml` sets the publish directory to the project root and generates `runtime-config.js` during the build. Add this Netlify environment variable:

```text
BACKEND_URL=https://<your-backend-host>
```

Trigger a deploy, then open the Netlify URL. The dashboard will call the external backend and connect to its Socket.IO server.

### 3. Finish Firebase configuration

In Firebase Console, add the Netlify hostname (for example, `your-site.netlify.app`) under **Authentication > Settings > Authorized domains**. Enable Email/Password and Google providers as needed.

If a custom Netlify domain is used, update the backend `FRONTEND_ORIGIN` value to that exact HTTPS origin and redeploy the backend.

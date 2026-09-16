# Weather Intelligence App

A single-page web application designed to fetch real-time weather data and 7-day forecasts using the public Open-Meteo API, providing dynamic daily planning recommendations.

## Live Application
- **Cloudflare Pages URL:** [`https://<your-app-name>.pages.dev`](https://weather-intelligence-app-c1o.pages.dev/)

## Tech Stack & APIs
- **Frontend Framework:** React, Vite, TypeScript
- **Styling:** Tailwind CSS / Lucide Icons
- **Geocoding API:** Open-Meteo Geocoding (`https://geocoding-api.open-meteo.com/v1/search`)
- **Forecast API:** Open-Meteo Forecast (`https://api.open-meteo.com/v1/forecast`)

## Deployment Pipeline & Setup Instructions

### 1. Build via Google AI Studio
- Generated the application codebase using Google AI Studio App Build with prompts specifying Open-Meteo API integrations and dynamic recommendation rules.
- Validated application functionality, state management, and error handling inside the AI Studio preview environment.

### 2. Connect to GitHub
- Used Google AI Studio's direct GitHub integration to link and push the source repository directly to GitHub.
- Verified project configuration files (`package.json`, `vite.config.ts`, `src/`) were synced successfully.

### 3. Deploy to Cloudflare Pages
- Connected the GitHub repository to Cloudflare Pages via **Compute > Workers & Pages > Create Application > Pages > Connect to Git**.
- Configured build parameters:
  - **Framework Preset:** React (Vite)
  - **Build Command:** `npm run build`
  - **Build Output Directory:** `dist`
- Executed continuous deployment directly from the `main` branch.

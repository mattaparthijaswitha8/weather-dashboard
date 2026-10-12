# Nimbus - a weather dashboard (React + Express)

A full stack project with a colourful interface and live charts.

- **Frontend:** React (built with Vite), Recharts for the graphs, lucide-react for icons
- **Backend:** Node.js + Express
- **Data:** Open-Meteo (free, no API key, no sign-up)

## What it shows

- Big current temperature, condition, feels-like, humidity, wind, UV, sunrise and sunset
- A **24-hour chart** with four tabs: temperature, rain chance, humidity, wind
- A **7-day forecast** with low-to-high range bars
- A **rainfall chart** for the week
- City search, a °C / °F switch, and a page colour that changes with the weather and time of day

## How to run it

You need **Node.js 18 or newer** (check with `node -v`).

```bash
# 1. Open a terminal inside this folder, then install everything (one time)
npm run install:all

# 2. Start the backend and the frontend together
npm run dev
```

Open **http://localhost:5173** in your browser.

If `npm run dev` gives you trouble, run the two parts in two terminals instead:

```bash
cd server && npm install && npm run dev      # terminal 1 (port 3001)
cd client && npm install && npm run dev      # terminal 2 (port 5173)
```

## How it works (in plain words)

1. You type a city and press Search.
2. React asks **your Express server**: `GET /api/search?q=Paris`.
3. Express asks Open-Meteo for matching cities and sends a short list back.
4. You pick one. React asks Express: `GET /api/weather?lat=..&lon=..`.
5. Express fetches the forecast, keeps only what the app needs, remembers it for
   10 minutes (a cache), and sends it back as JSON.
6. React puts the numbers into state, and the charts and cards redraw.

## Folder map

```
server/index.js              the whole backend (2 routes + cache)
client/src/App.jsx           the main page: state, fetching, layout
client/src/components/
  SearchBar.jsx              city search box and results list
  Hero.jsx                   big temperature and the stat tiles
  HourlyChart.jsx            24-hour chart with tabs
  WeekPanel.jsx              7-day list and rainfall chart
  ChartTooltip.jsx           the hover box on charts
  WeatherIcon.jsx            picks the right icon for the weather
client/src/lib/weather.js    weather codes -> words, and the colour themes
client/src/styles.css        all the styling
```

## Things to try next

1. Change `DEFAULT_PLACE` in `App.jsx` to your own city.
2. Add a new tab to `HourlyChart.jsx` (hint: the API can also send `pressure_msl`).
   Add it in `server/index.js` first, then in the `metrics` object.
3. Save the user's last city with `localStorage` so it opens there next time.
4. Add a "favourite cities" list using a new `useState` array.
5. Deploy: run `npm run build`, then `npm start`. Express will serve the built
   React app on http://localhost:3001.

## Common problems

- **Blank page or "Could not load the forecast":** make sure the server is running on port 3001.
- **Search finds nothing:** try the plain city name, for example "Pune" rather than "Pune, India".
- **No internet:** the app needs it to reach Open-Meteo.

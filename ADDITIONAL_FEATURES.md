# Additional Features (add these!)

## 1. Solar Forecast
- Add a solar/sunshine forecast for the next day on the dashboard
- Use Open-Meteo Solar API (free): https://open-meteo.com/en/docs
- Show expected sunshine hours, solar radiation (W/m²), cloud cover
- Location: Ramsen, Germany (49.2667°N, 8.1333°E)
- Display as a card on the dashboard: "Sonnenprognose morgen"
- Maybe show expected solar yield estimate

## 2. Persistent Volume (CRITICAL)
- The SQLite database MUST be in a Docker volume, NOT inside the container
- Use /data/ as mount point
- Dockerfile must NOT copy or create the DB inside the image
- docker-compose or Dokploy volume config: mount host path to /data/
- The app should create the DB at /data/waermepumpe.db on first start if it doesn't exist

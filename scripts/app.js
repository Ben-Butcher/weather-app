const form = document.getElementById("weather-form");
const searchBtn = document.getElementById("search-btn");
const FORECAST_DAYS = 3;

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const city = document.getElementById("city").value.trim();

  if (!city) {
    showError("Please enter a city name");
    return;
  }

  searchBtn.disabled = true;
  searchBtn.textContent = "Searching...";

  try {
    const location = await getLatLong(city);
    const weather = await getWeather(location);
    createWeatherCard(weather.current, weather.daily);
    document.getElementById("city").value = "";
  } catch (err) {
    showError(err.message);
  } finally {
    searchBtn.disabled = false;
    searchBtn.textContent = "Search";
  }
});

async function getLatLong(city) {
  const res = await fetch(
    `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`
  );
  if (!res.ok) throw new Error(`Location lookup failed (${res.status})`);

  const data = await res.json();
  if (!data.results?.length) {
    throw new Error(`"${city}" was not found. Please check spelling.`);
  }
  return data.results[0];
}

async function getWeather({ latitude, longitude }) {
  const params = new URLSearchParams({
    latitude,
    longitude,
    current:
      "temperature_2m,apparent_temperature,relative_humidity_2m,surface_pressure,wind_speed_10m,cloud_cover",
    daily: "temperature_2m_max,temperature_2m_min,cloud_cover_mean,precipitation_sum",
    timezone: "auto",
    forecast_days: FORECAST_DAYS + 1, // index 0 is today
  });

  const res = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`);
  if (!res.ok) throw new Error(`Failed to fetch weather data (${res.status})`);
  return res.json();
}

function showError(message) {
  const container = document.getElementById("main");
  container.innerHTML = "";
  container.appendChild(el("div", "error-message", message));
}

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function createWeatherCard(current, daily) {
  const container = document.getElementById("main");
  container.innerHTML = "";

  container.appendChild(buildCurrentSection(current));
  if (daily?.time) container.appendChild(buildForecastSection(daily));
}

function buildCurrentSection(current) {
  const section = el("div", "weather-section");
  section.appendChild(el("h2", "section-title", "Current Weather"));

  const details = [
    { label: "Temperature: ", value: `${current.temperature_2m}°C`, isTemp: true },
    { label: "Feels Like: ", value: `${current.apparent_temperature}°C`, isTemp: true },
    { label: "Humidity: ", value: `${current.relative_humidity_2m}%` },
    { label: "Pressure: ", value: `${current.surface_pressure} hPa` },
    { label: "Wind Speed: ", value: `${current.wind_speed_10m} m/s` },
    { label: "Clouds: ", value: getCloudCover(current.cloud_cover) },
  ];

  const grid = el("div", "weather-grid");
  details.forEach(({ label, value, isTemp }) => {
    const card = el("div", "weather-card");
    card.appendChild(el("span", "weather-label", label));
    const valueEl = el("span", "weather-value", value);
    card.appendChild(valueEl);

    if (isTemp) {
      card.style.cursor = "pointer";
      card.addEventListener("click", () => toggleTempUnit(valueEl));
    }
    grid.appendChild(card);
  });

  section.appendChild(grid);
  section.appendChild(
    el("span", "info-hint", "💡 Click temperature cards to convert between °C and °F")
  );
  return section;
}

function toggleTempUnit(valueEl) {
  const num = parseFloat(valueEl.textContent);
  const isCelsius = valueEl.textContent.endsWith("C");
  valueEl.textContent = isCelsius
    ? `${((num * 9) / 5 + 32).toFixed(1)}°F`
    : `${(((num - 32) * 5) / 9).toFixed(1)}°C`;
}

function buildForecastSection(daily) {
  const section = el("div", "weather-section");
  section.appendChild(el("h2", "section-title", `${FORECAST_DAYS}-Day Forecast`));

  const grid = el("div", "forecast-grid");
  for (let i = 1; i <= FORECAST_DAYS; i++) {
    if (daily.time[i]) grid.appendChild(buildForecastCard(daily, i));
  }

  section.appendChild(grid);
  return section;
}

function buildForecastCard(daily, i) {
  const card = el("div", "forecast-card");
  const date = new Date(daily.time[i]);

  const dateEl = el("div", "forecast-date");
  dateEl.innerHTML = `<strong>${date.toLocaleDateString("en-US", { weekday: "short" })}</strong><br><small>${date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}</small>`;
  card.appendChild(dateEl);

  const temps = el("div", "forecast-temps");
  temps.innerHTML = `
    <div>High: <strong>${daily.temperature_2m_max[i]}°C</strong></div>
    <div>Low: <strong>${daily.temperature_2m_min[i]}°C</strong></div>
  `;
  card.appendChild(temps);

  const conditions = el("div", "forecast-conditions");
  conditions.innerHTML = `
    <div>☁️ ${getCloudCover(daily.cloud_cover_mean[i])}</div>
    <div>🌧️ ${daily.precipitation_sum[i]}mm</div>
  `;
  card.appendChild(conditions);

  return card;
}

function getCloudCover(cover) {
  if (cover > 75) return "Overcast";
  if (cover > 50) return "Mostly Cloudy";
  if (cover > 25) return "Partly Cloudy";
  return "Clear";
}

const form = document.getElementById("weather-form");
const searchBtn = document.getElementById("search-btn");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const city = document.getElementById("city").value.trim();

  // Input validation
  if (!city) {
    showError("Please enter a city name");
    return;
  }

  // Disable button and show loading state
  searchBtn.disabled = true;
  searchBtn.textContent = "Searching...";

  try {
    const locationData = await getLatLong(city);
    if (!locationData) return;

    const weatherData = await getWeather(locationData);

    if (weatherData && weatherData.current) {
      createWeatherCard(weatherData.current, weatherData.daily);
      document.getElementById("city").value = ""; // Clear input after successful search
    }
  } catch (err) {
    console.error("Error in form submission:", err);
  } finally {
    // Re-enable button
    searchBtn.disabled = false;
    searchBtn.textContent = "Search";
  }
});

async function getWeather(latLong) {
  try {
    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latLong.latitude}&longitude=${latLong.longitude}&current=temperature_2m,apparent_temperature,relative_humidity_2m,surface_pressure,wind_speed_10m,cloud_cover&daily=temperature_2m_max,temperature_2m_min,cloud_cover,precipitation_sum&timezone=auto`
    );

    if (!response.ok) {
      throw new Error(`status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (err) {
    console.error("Error fetching weather:", err);
    showError("Failed to fetch weather data. Please try again.");
  }
}

async function getLatLong(locationName) {
  try {
    const response = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(locationName)}&count=1`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (!data.results || data.results.length === 0) {
      showError(
        locationName
          ? `"${locationName}" was not found. Please check spelling.`
          : "Please enter a location name."
      );
      throw new Error("Location not found");
    }
    return data.results[0];
  } catch (err) {
    console.error("Error fetching location:", err);
  }
}

function showError(message) {
  const container = document.getElementById("main");
  container.innerHTML = "";
  const errorElement = document.createElement("div");
  errorElement.className = "error-message";
  errorElement.innerText = message;
  container.appendChild(errorElement);
}

function createWeatherCard(currentData, dailyData) {
  const container = document.getElementById("main");
  container.innerHTML = "";

  // Current weather section
  const currentSection = document.createElement("div");
  currentSection.className = "weather-section";

  const currentTitle = document.createElement("h2");
  currentTitle.className = "section-title";
  currentTitle.textContent = "Current Weather";
  currentSection.appendChild(currentTitle);

  const weatherDetails = [
    {
      label: "Temperature: ",
      value: `${currentData.temperature_2m}°C`,
      isTempCard: true,
    },
    {
      label: "Feels Like: ",
      value: `${currentData.apparent_temperature}°C`,
      isTempCard: true,
    },
    {
      label: "Humidity: ",
      value: `${currentData.relative_humidity_2m}%`,
    },
    { label: "Pressure: ", value: `${currentData.surface_pressure} hPa` },
    { label: "Wind Speed: ", value: `${currentData.wind_speed_10m} m/s` },
    { label: "Clouds: ", value: `${getCloudCover(currentData.cloud_cover)}` },
  ];

  const currentGrid = document.createElement("div");
  currentGrid.className = "weather-grid";

  weatherDetails.forEach((item) => {
    const card = document.createElement("div");
    card.className = "weather-card";

    const label = document.createElement("span");
    label.className = "weather-label";
    label.textContent = item.label;

    const value = document.createElement("span");
    value.className = "weather-value";
    value.textContent = item.value;

    card.appendChild(label);
    card.appendChild(value);
    currentGrid.appendChild(card);

    // Temperature conversion on click - FIXED
    if (item.isTempCard) {
      card.style.cursor = "pointer";
      card.addEventListener("click", () => {
        const currentText = value.textContent;
        const lastChar = currentText[currentText.length - 1];

        // Extract the numeric value
        const tempValue = parseFloat(currentText);

        if (lastChar === "C") {
          // Convert Celsius to Fahrenheit
          const fahrenheit = (tempValue * 9) / 5 + 32;
          value.textContent = fahrenheit.toFixed(1) + "°F";
        } else if (lastChar === "F") {
          // Convert Fahrenheit to Celsius
          const celsius = ((tempValue - 32) * 5) / 9;
          value.textContent = celsius.toFixed(1) + "°C";
        }
      });
    }
  });

  currentSection.appendChild(currentGrid);

  const tempHint = document.createElement("span");
  tempHint.className = "info-hint";
  tempHint.textContent =
    "💡 Click temperature cards to convert between °C and °F";
  currentSection.appendChild(tempHint);

  container.appendChild(currentSection);

  // 2-Day Forecast section
  if (dailyData && dailyData.time) {
    const forecastSection = document.createElement("div");
    forecastSection.className = "weather-section";

    const forecastTitle = document.createElement("h2");
    forecastTitle.className = "section-title";
    forecastTitle.textContent = "2-Day Forecast";
    forecastSection.appendChild(forecastTitle);

    const forecastGrid = document.createElement("div");
    forecastGrid.className = "forecast-grid";

    // Display next 2 days
    for (let i = 1; i <= 2; i++) {
      if (dailyData.time[i]) {
        const forecastCard = document.createElement("div");
        forecastCard.className = "forecast-card";

        const date = new Date(dailyData.time[i]);
        const dayName = date.toLocaleDateString("en-US", {
          weekday: "short",
        });
        const dayDate = date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        });

        const dateElement = document.createElement("div");
        dateElement.className = "forecast-date";
        dateElement.innerHTML = `<strong>${dayName}</strong><br><small>${dayDate}</small>`;
        forecastCard.appendChild(dateElement);

        const maxTemp = dailyData.temperature_2m_max[i];
        const minTemp = dailyData.temperature_2m_min[i];
        const cloudCover = dailyData.cloud_cover[i];
        const precipitation = dailyData.precipitation_sum[i];

        const tempRange = document.createElement("div");
        tempRange.className = "forecast-temps";
        tempRange.innerHTML = `
          <div>High: <strong>${maxTemp}°C</strong></div>
          <div>Low: <strong>${minTemp}°C</strong></div>
        `;
        forecastCard.appendChild(tempRange);

        const conditions = document.createElement("div");
        conditions.className = "forecast-conditions";
        conditions.innerHTML = `
          <div>☁️ ${getCloudCover(cloudCover)}</div>
          <div>🌧️ ${precipitation}mm</div>
        `;
        forecastCard.appendChild(conditions);

        forecastGrid.appendChild(forecastCard);
      }
    }

    forecastSection.appendChild(forecastGrid);
    container.appendChild(forecastSection);
  }
}

function getCloudCover(cloudCover) {
  if (cloudCover > 75) {
    return "Overcast";
  } else if (cloudCover > 50) {
    return "Mostly Cloudy";
  } else if (cloudCover > 25) {
    return "Partly Cloudy";
  } else {
    return "Clear";
  }
}

const form = document.getElementById("weather-form");
const weatherEmoji = ["☀️"];
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const city = document.getElementById("city").value;

  try {
    const locationData = await getLatLong(city);
    if (!locationData) return;

    const weatherData = await getWeather(locationData);

    if (weatherData && weatherData.current) {
      createWeatherCard(weatherData.current);
    }
  } catch (err) {
    console.error("Error in form submission:", err);
  }
});

async function getWeather(latLong) {
  try {
    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latLong.latitude}&longitude=${latLong.longitude}&current=temperature_2m,apparent_temperature,relative_humidity_2m,surface_pressure,wind_speed_10m,cloud_cover`,
    );

    if (!response.ok) {
      throw new Error(`status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (err) {
    console.error("Error fetching weather:", err);
  }
}

async function getLatLong(locationName) {
  try {
    const response = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(locationName)}&count=1`,
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (!data.results || data.results.length === 0) {
      const container = document.getElementById("main");
      const h1 = document.createElement("h1");
      h1.innerText =
        locationName !== ""
          ? `${locationName.toUpperCase()}: was not found, please check spelling`
          : `Please input location Name`;
      h1.className = "weather-card";
      container.appendChild(h1);
      throw new Error("Location not found");
    }
    return data.results[0];
  } catch (err) {
    console.error("Error fetching location:", err);
  }
}

function createWeatherCard(currentData) {
  const container = document.getElementById("main");

  const weatherDetails = [
    { label: "Temperature: ", value: `${currentData.temperature_2m}°C` },
    { label: "Feels Like: ", value: `${currentData.apparent_temperature}°C` },
    { label: "Humidity: ", value: `${currentData.relative_humidity_2m}%` },
    { label: "Pressure: ", value: `${currentData.surface_pressure} hPa` },
    { label: "Wind Speed: ", value: `${currentData.wind_speed_10m} m/s` },
    { label: "Clouds: ", value: `${getCloudCover(currentData.cloud_cover)}` },
  ];

  container.innerHTML = "";

  const grid = document.createElement("div");
  grid.className = "weather-grid";

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
    grid.appendChild(card);
    if (card.childNodes[0].textContent === "Temperature: ");
    {
      card.addEventListener("click", () => {
        let currTemp = item.value;

        if (currTemp[currTemp.length - 1] === "C") {
          value.textContent = (currentData.temperature_2m * 9) / 5 + 32 + "°F";
        }

        if (!currTemp[currTemp.length - 1] === "C") {
          value.textContent = (currTemp - 32) / 5 / 9 + "°C";
        }
      });
    }
  });
  container.appendChild(grid);
  const span = document.createElement("span");
  span.style = "margin-block:20px;text-align-center ";
  span.textContent =
    "Click on temperature to switch from Calcius or Fereinhiet";
  container.appendChild(span);
  //   container.innerHTML = `<span style="text-align:center;"></span>`;
}

function getCloudCover(cloudCover) {
  if (cloudCover > 50) {
    return "Overcast";
  } else if (cloudCover > 20) {
    return "Partly cloudy";
  } else {
    return "No Clouds";
  }
}

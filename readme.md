# Weather Application
A responsive weather app built with HTML, CSS, and JavaScript that fetches real-time weather data for any location.
## Features
- **Location Search**: Enter any city name to get current weather information
- **Real-time Weather Data**: Uses two external APIs:
  - **Geocoding API** (Open-Meteo): Converts location names to coordinates (latitude/longitude)
  - **Weather API** (Open-Meteo): Retrieves current conditions and daily forecast
- **Comprehensive Weather Details**:
  - Temperature (with Celsius/Fahrenheit conversion)
  - "Feels Like" temperature
  - Humidity percentage
  - Atmospheric pressure
  - Wind speed
  - Cloud cover classification
- **3-Day Forecast**: Displays high/low temperature, cloud cover, and precipitation for the next 3 days
- **Interactive UI**: Click on the temperature card to toggle between Celsius and Fahrenheit
- **Error Handling**: Displays helpful messages for invalid locations or spelling mistakes
- **Glassmorphism Design**: Modern UI with gradient background and frosted glass effects
- **Responsive Layout**: Mobile-friendly design that adapts to different screen sizes
## How It Works
1. User enters a city name in the search form
2. The app queries the Geocoding API to get latitude/longitude coordinates
3. Using those coordinates, it fetches current weather and a 3-day forecast from the Weather API
4. Weather information is displayed in an interactive card grid, with the forecast in a separate section below
5. Users can click the temperature card to switch between temperature units
## File Structure
- **index.html** - Main HTML structure with search form and weather display container
- **scripts/app.js** - JavaScript logic for API calls and DOM manipulation
- **styles/style.css** - Styling with glassmorphism effects and responsive layout
## Technology Stack
- HTML5
- CSS3 (with backdrop filters and gradients)
- Vanilla JavaScript (Async/Await, Fetch API)
- Open-Meteo APIs (free, no authentication required)

import { tool } from "@langchain/core/tools";
// No schema: the input is a plain string (the city name) passed straight to the function.
const getWeather = tool(
  async (city: string) => {
    // Step 1: geocoding, turn the city name into coordinates.
    const geoUrl =
      `https://geocoding-api.open-meteo.com/v1/search` +
      `?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;

    const geoRes = await fetch(geoUrl);
    if (!geoRes.ok) return `Geocoding error (${geoRes.status}) for "${city}".`;

    const geo = (await geoRes.json()) as {
      results?: Array<{
        latitude: number;
        longitude: number;
        name: string;
        country: string;
      }>;
    };
    const place = geo.results?.[0]; // no match: results is undefined
    if (!place) return `City not found: "${city}".`;

    // Step 2: fetch the current weather for those coordinates.
    const { latitude, longitude, name, country } = place;
    const wxUrl =
      `https://api.open-meteo.com/v1/forecast` +
      `?latitude=${latitude}&longitude=${longitude}` +
      `&current=temperature_2m,relative_humidity_2m,wind_speed_10m`;
    const wxRes = await fetch(wxUrl);
    if (!wxRes.ok) return `Weather API error (${wxRes.status}) for "${city}".`;

    // Shape: { current: { temperature_2m, relative_humidity_2m, ... } }
    const { current } = (await wxRes.json()) as {
      current: {
        temperature_2m: number;
        relative_humidity_2m: number;
        wind_speed_10m: number;
      };
    };
    return (
      `${name}, ${country}: ${current.temperature_2m}°C, ` +
      `humidity ${current.relative_humidity_2m}%, wind ${current.wind_speed_10m} km/h`
    );
  },
  {
    name: "get_weather",
    description: "Get the current weather for a given city. Input: a city name, e.g. 'Tokyo'.",
  }
);

export default getWeather;
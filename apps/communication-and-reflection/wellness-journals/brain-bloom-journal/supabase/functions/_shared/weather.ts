export interface WeatherInfo {
  description: string;
  temperature: number;
  unit: string;
}

export async function fetchWeather(): Promise<string> {
  try {
    // Using Washington DC as default location (weather.gov is US-focused, free API)
    const response = await fetch('https://api.weather.gov/gridpoints/LWX/97,71/forecast');

    if (!response.ok) {
      return '';
    }

    const data = await response.json();
    const currentPeriod = data.properties?.periods?.[0];

    if (!currentPeriod) {
      return '';
    }

    return `Weather: ${currentPeriod.shortForecast}, ${currentPeriod.temperature}°${currentPeriod.temperatureUnit}`;
  } catch (error) {
    console.error('Weather API error:', error);
    return '';
  }
}

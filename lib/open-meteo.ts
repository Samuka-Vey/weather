export class ExternalApiError extends Error {}

async function getJson<T>(url: string): Promise<T> {
  let res: Response;
  try {
    res = await fetch(url, { cache: "no-store" });
  } catch {
    throw new ExternalApiError("Falha ao comunicar com a Open-Meteo.");
  }
  if (!res.ok) throw new ExternalApiError(`Open-Meteo retornou status ${res.status}.`);
  return res.json() as Promise<T>;
}

export interface GeoResult {
  id: number; name: string; latitude: number; longitude: number;
  country?: string; admin1?: string;
}

export async function searchCities(name: string) {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(name)}&count=10&language=pt&format=json`;
  const data = await getJson<{ results?: GeoResult[] }>(url);
  return data.results ?? []; 
}

export interface Forecast {
  current: { temperature_2m: number; apparent_temperature: number; relative_humidity_2m: number;
             wind_speed_10m: number; weather_code: number; time: string };
  daily: { time: string[]; weather_code: number[]; temperature_2m_max: number[];
           temperature_2m_min: number[]; precipitation_sum: number[] };
}

export function fetchForecast(lat: number, lon: number) {
  const params = new URLSearchParams({
    latitude: String(lat), longitude: String(lon),
    current: "temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code",
    daily: "weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum",
    forecast_days: "7", timezone: "auto",
  });
  return getJson<Forecast>(`https://api.open-meteo.com/v1/forecast?${params}`);
}
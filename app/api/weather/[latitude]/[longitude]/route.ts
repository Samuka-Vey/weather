import { NextResponse } from "next/server";
import { errorResponse } from "@/lib/http";
import { parseLatitude, parseLongitude } from "@/lib/validation";
import { fetchForecast, ExternalApiError } from "@/lib/open-meteo";
import { describeWeather } from "@/lib/wmo";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ latitude: string; longitude: string }> }
) {
  const p = await params;
  const lat = parseLatitude(p.latitude);
  const lon = parseLongitude(p.longitude);
  if (lat === null) return errorResponse("Latitude inválida (deve estar entre -90 e 90).", 400);
  if (lon === null) return errorResponse("Longitude inválida (deve estar entre -180 e 180).", 400);

  try {
    const f = await fetchForecast(lat, lon);
    const round = (n: number) => Math.round(n * 10) / 10;
    return NextResponse.json({
      latitude: lat,
      longitude: lon,
      current: {
        time: f.current.time,
        temperature: f.current.temperature_2m,
        apparentTemperature: f.current.apparent_temperature,
        humidity: f.current.relative_humidity_2m,
        windSpeed: f.current.wind_speed_10m,
        description: describeWeather(f.current.weather_code),
      },
      daily: f.daily.time.map((date, i) => ({
        date,
        description: describeWeather(f.daily.weather_code[i]),
        temperatureMin: f.daily.temperature_2m_min[i],
        temperatureMax: f.daily.temperature_2m_max[i],
        temperatureRange: round(f.daily.temperature_2m_max[i] - f.daily.temperature_2m_min[i]),
        precipitation: f.daily.precipitation_sum[i],
      })),
    }, { status: 200 });
  } catch (e) {
    if (e instanceof ExternalApiError) return errorResponse(e.message, 502);
    return errorResponse("Erro interno.", 500);
  }
}
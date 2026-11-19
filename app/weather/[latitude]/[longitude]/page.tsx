
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import "./weather.css";

interface Weather {
  current: {
    time: string;
    temperature: number;
    apparentTemperature: number;
    humidity: number;
    windSpeed: number;
    description: string;
  };
  daily: {
    date: string;
    description: string;
    temperatureMin: number;
    temperatureMax: number;
    temperatureRange: number;
    precipitation: number;
  }[];
}

export default function WeatherPage() {
  const { latitude, longitude } = useParams<{
    latitude: string;
    longitude: string;
  }>();

  const [data, setData] = useState<Weather | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/weather/${latitude}/${longitude}`)
      .then(async (res) => {
        const body = await res.json();
        if (!res.ok) throw new Error(body.error);
        setData(body);
      })
      .catch((e: Error) => setError(e.message));
  }, [latitude, longitude]);

  if (error) {
    return (
      <main className="weather-page">
        <div className="weather-container">
          <div className="status-card">
            <div className="status-icon">⚠️</div>
            <h1>Não foi possível carregar o clima</h1>
            <p role="alert">{error}</p>
            <Link href="/" className="back-link">
              Voltar para busca
            </Link>
          </div>
        </div>
      </main>
    );
  }

  if (!data) {
    return (
      <main className="weather-page">
        <div className="weather-container">
          <div className="status-card">
            <div className="spinner" />
            <p>Carregando informações meteorológicas...</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="weather-page">
      <div className="weather-container">

        {/* Cabeçalho */}
        <header className="weather-header">
          <div>
            <h1>Weather App</h1>
            <p>Previsão meteorológica</p>
          </div>

          <Link href="/" className="back-link">
            ← Voltar
          </Link>
        </header>

        {/* Clima atual */}
        <section className="current-weather">
          <div>
            <p className="section-label">Clima atual</p>

            <h2>{data.current.temperature}°C</h2>

            <p className="weather-description">
              {data.current.description}
            </p>

            <p className="feels-like">
              Sensação térmica de {data.current.apparentTemperature}°C
            </p>
          </div>

          <div className="coordinates">
            <p>Coordenadas</p>
            <span>Latitude: {latitude}</span>
            <span>Longitude: {longitude}</span>
          </div>
        </section>

        {/* Indicadores */}
        <section className="weather-indicators">
          <div className="indicator-card">
            <p>Umidade</p>
            <h3>{data.current.humidity}%</h3>
            <span>💧 Umidade relativa do ar</span>
          </div>

          <div className="indicator-card">
            <p>Velocidade do vento</p>
            <h3>{data.current.windSpeed} km/h</h3>
            <span>🌬️ Velocidade atual</span>
          </div>

          <div className="indicator-card">
            <p>Sensação térmica</p>
            <h3>{data.current.apparentTemperature}°C</h3>
            <span>🌡️ Temperatura percebida</span>
          </div>
        </section>

        {/* Previsão semanal */}
        <section className="forecast-section">
          <div className="forecast-header">
            <h2>Próximos 7 dias</h2>
            <p>
              Acompanhe as condições meteorológicas da semana.
            </p>
          </div>

          <div className="forecast-list">
            {data.daily.map((day) => (
              <article className="forecast-card" key={day.date}>
                <div className="forecast-content">

                  {/* Data e descrição */}
                  <div className="forecast-day">
                    <h3>
                      {new Date(`${day.date}T12:00:00`).toLocaleDateString(
                        "pt-BR",
                        {
                          weekday: "long",
                          day: "2-digit",
                          month: "long",
                        }
                      )}
                    </h3>

                    <p>{day.description}</p>
                  </div>

                  {/* Temperaturas */}
                  <div className="forecast-details">
                    <div>
                      <span>Mínima</span>
                      <strong>{day.temperatureMin}°C</strong>
                    </div>

                    <div>
                      <span>Máxima</span>
                      <strong>{day.temperatureMax}°C</strong>
                    </div>

                    <div>
                      <span>Amplitude</span>
                      <strong>{day.temperatureRange}°C</strong>
                    </div>

                    <div>
                      <span>Chuva</span>
                      <strong>{day.precipitation} mm</strong>
                    </div>
                  </div>

                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Rodapé */}
        <footer className="weather-footer">
          Dados meteorológicos fornecidos por{" "}
          <a
            href="https://open-meteo.com/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Open-Meteo
          </a>{" "}
          (CC BY 4.0).
        </footer>

      </div>
    </main>
  );
}

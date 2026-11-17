
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

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
      <main>
        <div>
          <div>⚠️</div>

          <h1>Não foi possível carregar o clima</h1>

          <p role="alert">
            {error}
          </p>

          <Link href="/">
            Voltar para busca
          </Link>
        </div>
      </main>
    );
  }

  if (!data) {
    return (
      <main>
        <div>
          <div />
          <p>
            Carregando informações meteorológicas...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main>
      <div>
        {/* Cabeçalho */}
        <header>
          <div>
            <h1>Weather App</h1>

            <p>Previsão meteorológica</p>
          </div>

          <Link href="/">
            ← Voltar
          </Link>
        </header>

        {/* Clima atual */}
        <section>
          <div>
            <div>
              <p>Clima atual</p>

              <h2>
                {data.current.temperature}°C
              </h2>

              <p>
                {data.current.description}
              </p>

              <p>
                Sensação térmica de {data.current.apparentTemperature}°C
              </p>
            </div>

            <div>
              <p>Coordenadas</p>

              <p>
                Latitude: {latitude}
              </p>

              <p>
                Longitude: {longitude}
              </p>
            </div>
          </div>
        </section>

        {/* Indicadores */}
        <section>
          <div>
            <p>Umidade</p>

            <p>
              {data.current.humidity}%
            </p>

            <p>
              💧 Umidade relativa do ar
            </p>
          </div>

          <div>
            <p>Velocidade do vento</p>

            <p>
              {data.current.windSpeed} km/h
            </p>

            <p>
              🌬️ Velocidade atual
            </p>
          </div>

          <div>
            <p>Sensação térmica</p>

            <p>
              {data.current.apparentTemperature}°C
            </p>

            <p>
              🌡️ Temperatura percebida
            </p>
          </div>
        </section>

        {/* Previsão semanal */}
        <section>
          <div>
            <h2>Próximos 7 dias</h2>

            <p>
              Acompanhe as condições meteorológicas da semana.
            </p>
          </div>

          <div>
            {data.daily.map((day) => (
              <article key={day.date}>
                <div>
                  {/* Data e descrição */}
                  <div>
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

                    <p>
                      {day.description}
                    </p>
                  </div>

                  {/* Temperaturas */}
                  <div>
                    <div>
                      <p>Mínima</p>
                      <p>
                        {day.temperatureMin}°C
                      </p>
                    </div>

                    <div>
                      <p>Máxima</p>
                      <p>
                        {day.temperatureMax}°C
                      </p>
                    </div>

                    <div>
                      <p>Amplitude</p>
                      <p>
                        {day.temperatureRange}°C
                      </p>
                    </div>

                    <div>
                      <p>Chuva</p>
                      <p>
                        {day.precipitation} mm
                      </p>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Rodapé */}
        <footer>
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

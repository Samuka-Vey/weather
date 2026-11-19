
"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import Header from "@/components/Header";

const forecast = [
  { day: "Hoje", condition: "Parcialmente nublado", min: 24, max: 30, symbol: "☀" },
  { day: "Amanhã", condition: "Céu limpo", min: 25, max: 31, symbol: "☀" },
  { day: "Quarta-feira", condition: "Possibilidade de chuva", min: 23, max: 29, symbol: "☂" },
  { day: "Quinta-feira", condition: "Parcialmente nublado", min: 24, max: 30, symbol: "☁" },
];

export default function WeatherPage() {
  const { latitude, longitude } = useParams<{ latitude: string; longitude: string }>();

  return (
    <>
      <Header />
      <main className="page-shell page-narrow">
        <div className="back-row"><Link href="/" className="text-link">← Voltar para a busca</Link></div>
        <section className="page-heading">
          <span className="eyebrow">PREVISÃO DO TEMPO</span>
          <h1>Clima da cidade</h1>
          <p>Consulte as condições atuais e a previsão para os próximos dias.</p>
        </section>

        <section className="weather-preview detail-weather">
          <div>
            <p className="muted-label">Cidade selecionada</p>
            <div className="temperature-line">
              <strong>28°</strong>
              <span className="weather-symbol" aria-hidden="true">☀</span>
            </div>
            <p className="weather-description">Parcialmente nublado</p>
          </div>
          <div className="weather-details">
            <div><span>Sensação térmica</span><strong>30°C</strong></div>
            <div><span>Umidade</span><strong>75%</strong></div>
            <div><span>Vento</span><strong>12 km/h</strong></div>
          </div>
        </section>

        <section className="content-section">
          <div className="section-heading">
            <div><h2>Próximos dias</h2><p>Resumo da previsão semanal.</p></div>
          </div>
          <div className="forecast-list">
            {forecast.map((day) => (
              <article className="forecast-row" key={day.day}>
                <span className="forecast-day">{day.day}</span>
                <span className="forecast-symbol" aria-hidden="true">{day.symbol}</span>
                <span className="forecast-condition">{day.condition}</span>
                <span className="forecast-temperatures"><strong>{day.max}°</strong><span>{day.min}°</span></span>
              </article>
            ))}
          </div>
        </section>
        <p className="demo-note">Dados ilustrativos. Coordenadas: {latitude}, {longitude}. A conexão com a API será adicionada depois.</p>
        <footer className="site-footer"><span>Weather App</span><span>Interface em desenvolvimento</span></footer>
      </main>
    </>
  );
}

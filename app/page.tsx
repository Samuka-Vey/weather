"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";

type City = {
  name: string;
  region: string;
  latitude: number;
  longitude: number;
};

const exampleCities: City[] = [
  { name: "Parnaíba", region: "Piauí, Brasil", latitude: -2.9055, longitude: -41.7734 },
  { name: "Teresina", region: "Piauí, Brasil", latitude: -5.0892, longitude: -42.8019 },
  { name: "São Paulo", region: "São Paulo, Brasil", latitude: -23.5475, longitude: -46.6361 },
  { name: "Fortaleza", region: "Ceará, Brasil", latitude: -3.7172, longitude: -38.5433 },
];

export default function Home() {
  const [name, setName] = useState("");
  const [searched, setSearched] = useState(false);

  const cities = useMemo(() => {
    if (!name.trim()) return [];
    return exampleCities.filter((city) =>
      city.name.toLocaleLowerCase("pt-BR").includes(name.trim().toLocaleLowerCase("pt-BR"))
    );
  }, [name]);

  function search(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSearched(true);
  }

  return (
    <>
      <Header />
      <main className="page-shell">
        <section className="search-intro">
          <span className="eyebrow">PREVISÃO DO TEMPO</span>
          <h1>Como está o clima?</h1>
          <p>Pesquise uma cidade e acompanhe as condições do tempo.</p>

          <form className="search-form" onSubmit={search}>
            <label className="sr-only" htmlFor="city-search">Nome da cidade</label>
            <span className="search-symbol" aria-hidden="true">⌕</span>
            <input
              id="city-search"
              type="search"
              placeholder="Digite o nome de uma cidade..."
              value={name}
              onChange={(event) => {
                setName(event.target.value);
                setSearched(false);
              }}
              required
            />
            <button type="submit">Buscar</button>
          </form>
          <p className="search-hint">Experimente: Parnaíba, Teresina ou Fortaleza</p>
        </section>

        {searched && (
          <section className="content-section results-section">
            <div className="section-heading">
              <div>
                <h2>Resultados da busca</h2>
                <p>{cities.length} cidade(s) encontrada(s)</p>
              </div>
            </div>

            {cities.length > 0 ? (
              <div className="city-list">
                {cities.map((city) => (
                  <article className="city-row" key={city.name}>
                    <div className="city-main">
                      <h3>{city.name}</h3>
                      <p>{city.region}</p>
                    </div>
                    <Link
                      className="text-link"
                      href={`/weather/${city.latitude}/${city.longitude}`}
                    >
                      Ver clima <span aria-hidden="true">→</span>
                    </Link>
                  </article>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <span className="empty-icon" aria-hidden="true">⌕</span>
                <h3>Nenhuma cidade encontrada</h3>
                <p>Tente pesquisar usando outro nome.</p>
              </div>
            )}
          </section>
        )}

        <section className="content-section">
          <div className="section-heading">
            <div>
              <h2>Clima em destaque</h2>
              <p>Uma prévia de como as informações serão apresentadas.</p>
            </div>
          </div>
          <article className="weather-preview">
            <div>
              <p className="muted-label">Parnaíba, Piauí</p>
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
          </article>
        </section>

        <footer className="site-footer">
          <span>Weather App</span>
        </footer>
      </main>
    </>
  );
}

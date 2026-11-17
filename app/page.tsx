
"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";

interface City {
  name: string;
  region: string;
  latitude: number;
  longitude: number;
}

export default function Home() {
  const [name, setName] = useState("");
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  async function search(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const res = await fetch(
        `/api/cities?name=${encodeURIComponent(name)}`
      );
      const data = await res.json();

      if (!res.ok) {
        setError(data.error);
        setCities([]);
      } else {
        setCities(data);
        setSearched(true);
      }
    } catch {
      setError("Erro ao buscar cidades.");
    } finally {
      setLoading(false);
    }
  }

  async function addFavorite(city: City) {
    setMessage(null);
    setError(null);

    try {
      const res = await fetch("/api/favorite-cities", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(city),
      });

      if (res.status === 201) {
        setMessage(`${city.name} adicionada aos favoritos.`);
      } else {
        setError((await res.json()).error);
      }
    } catch {
      setError("Erro ao adicionar cidade aos favoritos.");
    }
  }

  return (
    <main>
      <div>
        {/* Cabeçalho */}
        <header>
          <div>
            <h1>Weather App</h1>
            <p>Encontre cidades e acompanhe o clima.</p>
          </div>

          <Link href="/favorites">
            ★ Favoritas
          </Link>
        </header>

        {/* Busca */}
        <section>
          <h2>Buscar cidades</h2>

          <p>
            Digite o nome de uma cidade para consultar sua previsão.
          </p>

          <form onSubmit={search}>
            <div>
              <label htmlFor="name">
                Nome da cidade
              </label>

              <input
                id="name"
                type="text"
                placeholder="Ex: Parnaíba, Teresina..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <button type="submit" disabled={loading}>
              {loading ? "Buscando..." : "Buscar cidade"}
            </button>
          </form>
        </section>

        {/* Mensagens */}
        {error && (
          <div role="alert">
            {error}
          </div>
        )}

        {message && (
          <div role="status">
            {message}
          </div>
        )}

        {/* Resultados */}
        <section>
          {searched && (
            <div>
              <h2>Resultados</h2>
              <span>{cities.length} cidade(s)</span>
            </div>
          )}

          {searched && !loading && cities.length === 0 && !error && (
            <div>
              <p>Nenhuma cidade encontrada.</p>
              <p>Tente pesquisar por outro nome.</p>
            </div>
          )}

          <ul>
            {cities.map((city) => (
              <li key={`${city.latitude},${city.longitude}`}>
                <div>
                  <Link
                    href={`/weather/${city.latitude}/${city.longitude}`}
                  >
                    {city.name}
                  </Link>

                  <p>{city.region}</p>

                  <p>
                    {city.latitude}, {city.longitude}
                  </p>
                </div>

                <div>
                  <Link
                    href={`/weather/${city.latitude}/${city.longitude}`}
                  >
                    Ver clima
                  </Link>

                  <button
                    type="button"
                    onClick={() => addFavorite(city)}
                  >
                    ★ Favoritar
                  </button>
                </div>
              </li>
            ))}
          </ul>
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

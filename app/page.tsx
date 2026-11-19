
"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import Link from "next/link";
import "./home.css";

interface City {
  name: string;
  region: string;
  latitude: number;
  longitude: number;
}

interface Favorite extends City {
  id: number;
  label: string | null;
}

interface CurrentWeather {
  temperature: number;
  description: string;
  humidity: number;
  windSpeed: number;
}

function weatherIcon(description: string) {
  const value = description.toLowerCase();
  if (value.includes("trovoada")) return "⛈️";
  if (value.includes("chuva") || value.includes("garoa")) return "🌧️";
  if (value.includes("neve")) return "❄️";
  if (value.includes("nublado")) return "☁️";
  if (value.includes("parcial")) return "🌤️";
  return "☀️";
}

function FavoriteCard({ favorite }: { favorite: Favorite }) {
  const [weather, setWeather] = useState<CurrentWeather | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetch(`/api/weather/${favorite.latitude}/${favorite.longitude}`)
      .then(async (res) => {
        if (!res.ok) throw new Error();
        const data = await res.json();
        if (!cancelled) setWeather(data.current);
      })
      .catch(() => {
        if (!cancelled) setWeather(null);
      });

    return () => {
      cancelled = true;
    };
  }, [favorite.latitude, favorite.longitude]);

  return (
    <li className="favorite-weather-card">
      <Link
        href={`/weather/${favorite.latitude}/${favorite.longitude}`}
        className="favorite-weather-link"
      >
        <div className="favorite-card-top">
          <span className="favorite-card-label">
            {favorite.label || "Favorita"}
          </span>
          <span className="favorite-card-icon" aria-hidden="true">
            {weather ? weatherIcon(weather.description) : "•"}
          </span>
        </div>

        <div className="favorite-card-location">
          <h3>{favorite.name}</h3>
          <p>{favorite.region}</p>
        </div>

        {weather ? (
          <div className="favorite-card-weather">
            <strong>{weather.temperature}°C</strong>
            <span>{weather.description}</span>
            <small>
              💧 {weather.humidity}% · 🌬️ {weather.windSpeed} km/h
            </small>
          </div>
        ) : (
          <div className="favorite-card-weather favorite-card-loading">
            <span>Carregando clima...</span>
          </div>
        )}
      </Link>
    </li>
  );
}

export default function Home() {
  const [name, setName] = useState("");
  const [cities, setCities] = useState<City[]>([]);
  const [favorites, setFavorites] = useState<Favorite[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [favoritesError, setFavoritesError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);
  const messageTimer = useRef<number | null>(null);

  async function fetchFavorites(): Promise<Favorite[]> {
    const res = await fetch("/api/favorite-cities");

    if (!res.ok) {
      throw new Error((await res.json()).error);
    }

    return res.json();
  }

  async function loadFavorites() {
    try {
      setFavoritesError(null);
      setFavorites(await fetchFavorites());
    } catch (e) {
      setFavoritesError((e as Error).message);
    }
  }

  useEffect(() => {
    let cancelled = false;

    fetchFavorites()
      .then((items) => {
        if (!cancelled) setFavorites(items);
      })
      .catch((e: Error) => {
        if (!cancelled) setFavoritesError(e.message);
      });

    return () => {
      cancelled = true;
      if (messageTimer.current !== null) {
        window.clearTimeout(messageTimer.current);
      }
    };
  }, []);

  async function search(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSearched(true);
    setCities([]);
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
        if (messageTimer.current !== null) {
          window.clearTimeout(messageTimer.current);
        }
        messageTimer.current = window.setTimeout(() => {
          setMessage(null);
          messageTimer.current = null;
        }, 3000);
        await loadFavorites();
      } else {
        setError((await res.json()).error);
      }
    } catch {
      setError("Erro ao adicionar cidade aos favoritos.");
    }
  }

  return (
    <main className="home-page">
      <div className="home-container">

        {/* Cabeçalho */}
        <header className="home-header">
          <div>
            <h1>Weather App</h1>
            <p>Encontre cidades e acompanhe o clima.</p>
          </div>

          <Link href="/favorites" className="favorites-link">
            ★ Favoritas
          </Link>
        </header>

        {/* Busca */}
        <section className="search-section">
          <h2>Buscar cidades</h2>

          <p className="search-description">
            Digite o nome de uma cidade para consultar sua previsão.
          </p>

          <form onSubmit={search} className="search-form">
            <div className="search-input-group">
              <label htmlFor="name">
                Nome da cidade
              </label>

              <input
                id="name"
                type="text"
                placeholder="Ex: Parnaíba, Teresina..."
                value={name}
                onChange={(e) => {
                  const value = e.target.value;
                  setName(value);

                  if (!value.trim()) {
                    setSearched(false);
                    setCities([]);
                    setError(null);
                  }
                }}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="search-button"
            >
              {loading ? "Buscando..." : "Buscar cidade"}
            </button>
          </form>
        </section>

        {/* Favoritos */}
        {!searched && favoritesError && (
          <div className="home-error" role="alert">
            {favoritesError}
          </div>
        )}

        {!searched && favorites && favorites.length > 0 && (
          <section className="favorites-home-section">
            <div className="results-header">
              <h2>Suas favoritas</h2>
              <Link href="/favorites" className="favorites-home-link">
                Gerenciar
              </Link>
            </div>

            <ul className="favorite-weather-grid">
              {favorites.map((favorite) => (
                <FavoriteCard favorite={favorite} key={favorite.id} />
              ))}
            </ul>
          </section>
        )}

        {/* Mensagens */}
        {error && (
          <div className="home-error" role="alert">
            {error}
          </div>
        )}

        {message && (
          <div className="home-success" role="status">
            {message}
          </div>
        )}

        {/* Resultados */}
        <section className="results-section">
          {searched && (
            <div className="results-header">
              <h2>Resultados</h2>
              <span>{cities.length} cidade(s)</span>
            </div>
          )}

          {searched && !loading && cities.length === 0 && !error && (
            <div className="empty-results">
              <h3>Nenhuma cidade encontrada.</h3>
              <p>Tente pesquisar por outro nome.</p>
            </div>
          )}

          {loading && (
            <div className="loading-results">
              <div className="spinner" />
              <p>Buscando cidades...</p>
            </div>
          )}

          <ul className="city-list">
            {cities.map((city) => (
              <li
                className="city-card"
                key={`${city.latitude},${city.longitude}`}
              >
                <div className="city-info">
                  <Link
                    href={`/weather/${city.latitude}/${city.longitude}`}
                    className="city-name"
                  >
                    {city.name}
                  </Link>

                  <p className="city-region">{city.region}</p>

                  <p className="city-coordinates">
                    {city.latitude}, {city.longitude}
                  </p>
                </div>

                <div className="city-actions">
                  <Link
                    href={`/weather/${city.latitude}/${city.longitude}`}
                    className="weather-link"
                  >
                    Ver clima
                  </Link>

                  <button
                    type="button"
                    className="favorite-button"
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
        <footer className="home-footer">
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

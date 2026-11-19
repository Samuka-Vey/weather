
"use client";

import { useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";

type Favorite = { id: number; name: string; region: string; temperature: number; condition: string };

const initialFavorites: Favorite[] = [
  { id: 1, name: "Parnaíba", region: "Piauí, Brasil", temperature: 28, condition: "Parcialmente nublado" },
  { id: 2, name: "Teresina", region: "Piauí, Brasil", temperature: 32, condition: "Céu limpo" },
  { id: 3, name: "São Paulo", region: "São Paulo, Brasil", temperature: 21, condition: "Nublado" },
];

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState(initialFavorites);

  return (
    <>
      <Header />
    <main className="page-shell page-narrow">
        <section className="page-heading">
          <span className="eyebrow">SUA LISTA</span>
          <h1>Cidades favoritas</h1>
          <p>Tenha suas cidades preferidas sempre por perto.</p>
        </section>
        <section className="content-section favorites-section">
       <div className="section-heading">
            <div>
              <h2>Minhas cidades</h2>
        <p>{favorites.length} cidade(s) salvas</p>
            </div>
            <Link href="/" className="text-link">Buscar cidade <span aria-hidden="true">→</span></Link>
          </div>

     {favorites.length > 0 ? (
            <div className="city-list">
              {favorites.map((city) => (
                <article className="favorite-row" key={city.id}>
                  <div className="city-main">
                    <h3>{city.name}</h3>
                    <p>{city.region}</p>
                    <span className="favorite-condition">{city.condition}</span>
                </div>
                  <div className="favorite-weather">
                    <strong>{city.temperature}°C</strong>
                      <button
                      type="button"
                      className="remove-button"
                      onClick={() => setFavorites((current) => current.filter((item) => item.id !== city.id))}
                      aria-label={`Remover ${city.name} dos favoritos`}
                      title="Remover dos favoritos"
                    >
                      
                    </button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <span className="empty-icon" aria-hidden="true">☆</span>
              <h3>Nenhuma cidade favorita</h3>
              <p>Quando você salvar cidades, elas vao aparecer aqui.</p>
              <Link href="/" className="primary-link">Buscar uma cidade</Link>
            </div>
          )}
          <p className="demo-note">Lista ilustrativa. A integração com os favoritos será feita depois...</p>
        </section>

        <footer className="site-footer">
          <span>Weather App</span>
          <span>Interface em desenvolvimento</span>
        </footer>
      </main>
    </>
  );
}

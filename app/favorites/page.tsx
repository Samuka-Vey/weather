
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Favorite {
  id: number;
  name: string;
  region: string;
  latitude: number;
  longitude: number;
  label: string | null;
}

function FavoriteItem({
  fav,
  onChanged,
}: {
  fav: Favorite;
  onChanged: () => void;
}) {
  const [label, setLabel] = useState(fav.label ?? "");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [removing, setRemoving] = useState(false);

  async function save() {
    setError(null);
    setMessage(null);
    setSaving(true);

    try {
      const res = await fetch(`/api/favorite-cities/${fav.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label }),
      });

      if (res.ok) {
        setMessage("Rótulo atualizado com sucesso.");
        onChanged();
      } else {
        setError((await res.json()).error);
      }
    } catch {
      setError("Erro ao atualizar o rótulo.");
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    setError(null);
    setMessage(null);
    setRemoving(true);

    try {
      const res = await fetch(`/api/favorite-cities/${fav.id}`, {
        method: "DELETE",
      });

      if (res.status === 204) {
        onChanged();
      } else {
        setError((await res.json()).error);
      }
    } catch {
      setError("Erro ao remover cidade.");
    } finally {
      setRemoving(false);
    }
  }

  return (
    <li>
      <div>
        {/* Informações da cidade */}
        <div>
          <div>
            <Link
              href={`/weather/${fav.latitude}/${fav.longitude}`}
            >
              {fav.name}
            </Link>

            <p>{fav.region}</p>

            <p>
              {fav.latitude}, {fav.longitude}
            </p>
          </div>

          <span>
            ★ Favorita
          </span>
        </div>

        {/* Campo de rótulo */}
        <div>
          <label htmlFor={`label-${fav.id}`}>
            Rótulo personalizado
          </label>

          <input
            id={`label-${fav.id}`}
            type="text"
            value={label}
            maxLength={30}
            placeholder="Ex: Minha cidade, Trabalho..."
            onChange={(e) => setLabel(e.target.value)}
          />

          <p>
            {label.length}/30 caracteres
          </p>
        </div>

        {/* Botões */}
        <div>
          <button
            type="button"
            onClick={save}
            disabled={saving || removing}
          >
            {saving ? "Salvando..." : "Salvar alterações"}
          </button>

          <button
            type="button"
            onClick={remove}
            disabled={saving || removing}
          >
            {removing ? "Removendo..." : "Remover favorito"}
          </button>
        </div>

        {/* Mensagens */}
        {error && (
          <p role="alert">
            {error}
          </p>
        )}

        {message && (
          <p role="status">
            {message}
          </p>
        )}
      </div>
    </li>
  );
}

export default function FavoritesPage() {
  const [items, setItems] = useState<Favorite[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      setError(null);

      const res = await fetch("/api/favorite-cities");

      if (!res.ok) {
        throw new Error((await res.json()).error);
      }

      setItems(await res.json());
    } catch (e) {
      setError((e as Error).message);
    }
  }

  useEffect(() => {
    let cancelled = false;

    fetch("/api/favorite-cities")
      .then(async (res) => {
        if (!res.ok) {
          throw new Error((await res.json()).error);
        }

        return res.json() as Promise<Favorite[]>;
      })
      .then((favorites) => {
        if (!cancelled) setItems(favorites);
      })
      .catch((e: Error) => {
        if (!cancelled) setError(e.message);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main>
      <div>
        {/* Cabeçalho */}
        <header>
          <div>
            <h1>Minhas favoritas</h1>

            <p>
              Gerencie suas cidades favoritas.
            </p>
          </div>

          <Link href="/">
            ← Buscar cidades
          </Link>
        </header>

        {/* Contador */}
        {items && items.length > 0 && (
          <div>
            <div>
              <p>Suas cidades salvas</p>
              <p>
                Acesse a previsão ou personalize seus rótulos.
              </p>
            </div>

            <span>
              {items.length}
            </span>
          </div>
        )}

        {/* Erro */}
        {error && (
          <div role="alert">
            {error}

            <button
              type="button"
              onClick={load}
            >
              Tentar novamente
            </button>
          </div>
        )}

        {/* Carregamento */}
        {!items && !error && (
          <div>
            <p>
              Carregando cidades favoritas...
            </p>
          </div>
        )}

        {/* Lista vazia */}
        {items?.length === 0 && (
          <div>
            <div>☆</div>

            <h2>Nenhuma cidade favorita</h2>

            <p>
              Você ainda não adicionou nenhuma cidade aos favoritos.
            </p>

            <Link href="/">
              Explorar cidades
            </Link>
          </div>
        )}

        {/* Lista de favoritos */}
        {items && items.length > 0 && (
          <ul>
            {items.map((fav) => (
              <FavoriteItem
                key={fav.id}
                fav={fav}
                onChanged={load}
              />
            ))}
          </ul>
        )}

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

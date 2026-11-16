import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";

const DB_PATH = path.join(process.cwd(), "data/db.sqlite");

const SEED = [
  { name: "Parnaíba", region: "Piauí, Brasil", latitude: -2.9055, longitude: -41.7734, label: "Casa" },
  { name: "Teresina", region: "Piauí, Brasil", latitude: -5.0892, longitude: -42.8019, label: null },
  { name: "São Paulo", region: "São Paulo, Brasil", latitude: -23.5475, longitude: -46.6361, label: "Trabalho" },
  { name: "Lisboa", region: "Lisboa, Portugal", latitude: 38.7167, longitude: -9.1333, label: null },
  { name: "Tóquio", region: "Tóquio, Japão", latitude: 35.6895, longitude: 139.6917, label: "Viagem" },
];

function createDB(): Database.Database {
    fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
    const isNew = !fs.existsSync(DB_PATH);
    const db = new Database(DB_PATH);

    db.exec(`
    CREATE TABLE IF NOT EXISTS favorite_cities (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      region TEXT NOT NULL,
      latitude REAL NOT NULL,
      longitude REAL NOT NULL,
      label TEXT CHECK (label IS NULL OR length(label) <= 30),
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE (latitude, longitude)
    )
  `);

  if (isNew) {
    const insert = db.prepare("INSERT INTO favorite_cities (name, region, latitude, longitude, label) VALUES (@name, @region, @latitude, @longitude, @label)");
    db.transaction(() => SEED.forEach((c) => insert.run(c)))();
  }
  return db;
}
const g = globalThis as unknown as { __db?: Database.Database };
export const db = g.__db ?? (g.__db = createDB());
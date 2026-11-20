import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { errorResponse } from "@/lib/http";
import { parseLatitude, parseLongitude, parseLabel } from "@/lib/validation";

export async function GET() {
  const rows = db.prepare("SELECT * FROM favorite_cities ORDER BY created_at DESC, id DESC").all();
  return NextResponse.json(rows, { status: 200 });
}

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try { body = await request.json(); } catch { return errorResponse("Corpo da requisição inválido.", 400); }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const region = typeof body.region === "string" ? body.region.trim() : "";
  const lat = parseLatitude(String(body.latitude ?? ""));
  const lon = parseLongitude(String(body.longitude ?? ""));
  const label = parseLabel(body.label);

  if (!name || !region) return errorResponse("Campos 'name' e 'region' são obrigatórios.", 400);
  if (lat === null || lon === null) return errorResponse("Latitude ou longitude inválida.", 400);
  if (label === undefined) return errorResponse("O rótulo deve ter até 30 caracteres.", 400);

  const exists = db.prepare("SELECT 1 FROM favorite_cities WHERE latitude = ? AND longitude = ?").get(lat, lon);
  if (exists) return errorResponse("Esta cidade já está nos favoritos.", 409);

  const info = db
    .prepare("INSERT INTO favorite_cities (name, region, latitude, longitude, label) VALUES (?, ?, ?, ?, ?)")
    .run(name, region, lat, lon, label);
  const created = db.prepare("SELECT * FROM favorite_cities WHERE id = ?").get(info.lastInsertRowid);
  return NextResponse.json(created, { status: 201 });
}
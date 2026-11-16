import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { errorResponse } from "@/lib/http";
import { parseId, parseLabel } from "@/lib/validation";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Ctx) {
  const id = parseId((await params).id);
  if (id === null) return errorResponse("ID inválido.", 400);

  let body: Record<string, unknown>;
  try { body = await request.json(); } catch { return errorResponse("Corpo da requisição inválido.", 400); }

  if (!("label" in body)) return errorResponse("Informe o campo editável 'label'.", 400);
  const label = parseLabel(body.label);
  if (label === undefined) return errorResponse("O rótulo deve ter até 30 caracteres.", 400);

  const info = db.prepare("UPDATE favorite_cities SET label = ? WHERE id = ?").run(label, id);
  if (info.changes === 0) return errorResponse("Cidade favorita não encontrada.", 404);
  return NextResponse.json(db.prepare("SELECT * FROM favorite_cities WHERE id = ?").get(id));
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const id = parseId((await params).id);
  if (id === null) return errorResponse("ID inválido.", 400);
  const info = db.prepare("DELETE FROM favorite_cities WHERE id = ?").run(id);
  if (info.changes === 0) return errorResponse("Cidade favorita não encontrada.", 404);
  return new NextResponse(null, { status: 204 });
}
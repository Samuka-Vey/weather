import { NextResponse } from "next/server";
import { errorResponse } from "@/lib/http";
import { searchCities, ExternalApiError } from "@/lib/open-meteo";

export async function GET(request: Request) {
  const q = new URL(request.url).searchParams.get("name")?.trim() ?? "";
  if (q.length < 2) return errorResponse("Informe o parâmetro 'name' com ao menos 2 caracteres.", 400);

  try {
    const results = await searchCities(q);
    return NextResponse.json(
      results.map((c) => ({
        name: c.name,
        region: [c.admin1, c.country].filter(Boolean).join(", "),
        latitude: c.latitude,
        longitude: c.longitude,
      }))
    );
  } catch (e) {
    if (e instanceof ExternalApiError) return errorResponse(e.message, 502);
    return errorResponse("Erro interno.", 500);
  }
}
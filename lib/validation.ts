export function parseCoordinate(raw: string, min: number, max: number): number | null {
  if (raw.trim() === "") return null;
  const n = Number(raw);
  return Number.isFinite(n) && n >= min && n <= max ? n : null;
}
export const parseLatitude = (s: string) => parseCoordinate(s, -90, 90);
export const parseLongitude = (s: string) => parseCoordinate(s, -180, 180);

export function parseId(raw: string): number | null {
  const n = Number(raw);
  return Number.isInteger(n) && n > 0 ? n : null;
}

export function parseLabel(value: unknown): string | null | undefined {
  if (value === undefined || value === null || value === "") return null;
  if (typeof value !== "string") return undefined;
  const t = value.trim();
  return t.length <= 30 ? (t || null) : undefined;
}
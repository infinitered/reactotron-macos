export function normalize(v: unknown): string {
  return String(v ?? "")
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
}

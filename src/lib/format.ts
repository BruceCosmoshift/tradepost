/**
 * Deterministic ZAR formatter for SSR + client (no locale surprises).
 * Example: 3500 => "R 3 500"
 */
export function formatZar(value?: number | null) {
  if (value == null || Number.isNaN(Number(value))) return "";
  const n = Math.round(Number(value));
  const grouped = n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return `R ${grouped}`;
}

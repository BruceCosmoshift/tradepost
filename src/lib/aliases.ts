export const TEXT_ALIASES: Record<string, string> = {
  "capetown": "Cape Town",
  "cape-town": "Cape Town",
  "cpt": "Cape Town",
  "simonstown": "Simon's Town",

  "harry smith": "Harrismith",
  "harrie smith": "Harrismith",
  "harriesmith": "Harrismith",

  "wilge park": "Wilgepark",
  "wilge-park": "Wilgepark",
  "volker park": "Wilgepark",
  "volkier park": "Wilgepark",

  "mitchels plain": "Mitchells Plain",
  "mitchels plein": "Mitchells Plain",
  "mitchel's plain": "Mitchells Plain",
  "mitchel's plein": "Mitchells Plain",
  "mitchels": "Mitchells Plain"
};

export function normalizeName(s: string): string {
  const k = s.trim().toLowerCase().replace(/\s+/g, " ").replace(/’/g, "'");
  // Special composed case: "harrismith ... wilge ..."
  if (k.includes("harrismith") && (k.includes("wilge ") || k.includes("wilge-") || k.endsWith("wilge"))) {
    return "Harrismith Wilgepark";
  }
  return TEXT_ALIASES[k] ?? s;
}
export function buildThreatTable(result) {
  if (!result?.attackSummary) return [];

  let id = 1001;

  return Object.entries(result.attackSummary).map(([attack, count]) => ({
    id: id++,
    prediction: attack,
    confidence: `${result.confidence}%`,
    severity:
      attack === "Benign"
        ? "Low"
        : attack.includes("DoS") || attack.includes("DDoS")
        ? "High"
        : "Medium",
    status: attack === "Benign" ? "Safe" : "Detected",
    count,
  }));
}
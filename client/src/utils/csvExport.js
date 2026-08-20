export function exportCSV(result) {
  if (!result) return;

  const rows = [
    ["Field", "Value"],
    ["Dataset", result.datasetName],
    ["Model", result.model],
    ["Prediction", result.prediction],
    ["Confidence", `${result.confidence}%`],
    ["Severity", result.severity],
    ["Packets Analyzed", result.packetsAnalyzed],
    ["Safe Traffic", `${result.safeTraffic}%`],
    ["Malicious Traffic", `${result.maliciousTraffic}%`],
    ["Analysis Time", result.analysisTime],
  ];

  const csvContent = rows
    .map((row) => row.join(","))
    .join("\n");

  const blob = new Blob([csvContent], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");

  link.href = url;
  link.download = "Sentinel_AI_Report.csv";

  document.body.appendChild(link);

  link.click();

  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}
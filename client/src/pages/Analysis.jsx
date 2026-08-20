import React, { useEffect, useState } from "react";
import { generatePDFReport } from "../utils/pdfReport";
import {
  AnalysisHeader,
  DatasetInformation,
  TrafficStats,
  ThreatSeverity,
  DetectionSummary,
  TrafficDistribution,
  DetectionResults,
  SecurityRecommendations,
  DecisionEngine,
  ModelPerformance,
  ExportSection,
  AttackDistribution,
  AnalysisOverview,
} from "../components/analysis";
import { getRecommendations } from "../utils/recommendations";
import { buildThreatTable } from "../utils/threatTable";
import { exportCSV } from "../utils/csvExport";
import * as XLSX from "xlsx";
import {
  buildResults,
  buildTrafficStats,
  buildDatasetInfo,
  buildSeverityStats,
  buildDecisionEngine,
  buildModelPerformance,
} from "../utils/viewModels";

import { ShieldAlert, Activity, Globe, CheckCircle } from "lucide-react";

function Analysis() {
  const [result, setResult] = useState(null);

  const recommendations = getRecommendations(result);

  useEffect(() => {
    try {
      const storedResult = localStorage.getItem("analysisResult");

      if (!storedResult) {
        return;
      }

      const parsedData = JSON.parse(storedResult);

      console.log("STORED RESULT:", parsedData);

      setResult(parsedData);
    } catch (error) {
      console.error("Failed to load analysis result:", error);
      setResult(null);
    }
  }, []);

  // LOADING CHECK
  if (!result) {
    return (
      <div className="min-h-screen bg-[#020617] text-white flex items-center justify-center text-3xl">
        No Analysis Data Found
      </div>
    );
  }

  const results = buildResults(result);

  const trafficStats = buildTrafficStats(result);

  const datasetInfo = buildDatasetInfo(result);

  const severityStats = buildSeverityStats(result);

  const decisionEngine = buildDecisionEngine(result);

  const modelPerformance = buildModelPerformance(result);

  const threatTable = buildThreatTable(result);

  const analysisSummary = [
    "Dataset successfully processed.",
    "Machine learning analysis completed.",
    result.maliciousTraffic > 0
      ? "Potentially malicious traffic detected."
      : "No malicious traffic detected.",
    `Confidence score: ${result.confidence ?? 0}%.`,
    result.maliciousTraffic > 0
      ? "Further investigation is recommended."
      : "No immediate investigation is required.",
  ];

  const handleDownloadPDF = () => {
    generatePDFReport(result, recommendations);
  };

  const handleExportCSV = () => {
    exportCSV(result);
  };

  // NEW: Human-readable Excel report
  const handleExportExcel = () => {
    if (!result) return;

    const reportId = `SAI-${Date.now()}`;
    const generatedAt = new Date().toLocaleString();

    const attackSummary = Object.entries(result.attackSummary || {}).map(
      ([attack, count]) => ({
        "Attack Type": attack,
        Packets: Number(count) || 0,
        Percentage: result.packetsAnalyzed
          ? Number(
              ((Number(count) / Number(result.packetsAnalyzed)) * 100).toFixed(
                2,
              ),
            )
          : 0,
      }),
    );

    // -----------------------------
    // SHEET 1: ANALYSIS SUMMARY
    // -----------------------------
    const summaryRows = [
      ["SENTINEL AI"],
      ["Enterprise Network Intrusion Detection System"],
      [],
      ["Report Information", "Value"],
      ["Report ID", reportId],
      ["Generated", generatedAt],
      ["Status", "Completed"],
      [],
      ["Analysis Summary", "Value"],
      ["Dataset", result.datasetName || "—"],
      ["Model", result.model || "—"],
      ["Prediction", result.prediction || "—"],
      ["Confidence", result.confidence != null ? `${result.confidence}%` : "—"],
      ["Severity", result.severity || "—"],
      ["Packets Analyzed", Number(result.packetsAnalyzed || 0)],
      [
        "Safe Traffic",
        result.safeTraffic != null ? `${result.safeTraffic}%` : "—",
      ],
      [
        "Malicious Traffic",
        result.maliciousTraffic != null ? `${result.maliciousTraffic}%` : "—",
      ],
      ["Analysis Time", result.analysisTime || "—"],
      [
        "Attack Types",
        attackSummary.filter((item) => item["Attack Type"] !== "normal").length,
      ],
    ];

    const summarySheet = XLSX.utils.aoa_to_sheet(summaryRows);
    summarySheet["!cols"] = [{ wch: 26 }, { wch: 34 }];

    // -----------------------------
    // SHEET 2: ATTACK DISTRIBUTION
    // -----------------------------
    const attackRows = [
      ["SENTINEL AI - ATTACK DISTRIBUTION"],
      [],
      ["Attack Type", "Packets", "Percentage"],
      ...attackSummary.map((item) => [
        item["Attack Type"],
        item.Packets,
        `${item.Percentage}%`,
      ]),
      [],
      ["Total Packets", Number(result.packetsAnalyzed || 0), "100%"],
    ];

    const attackSheet = XLSX.utils.aoa_to_sheet(attackRows);
    attackSheet["!cols"] = [{ wch: 28 }, { wch: 16 }, { wch: 16 }];
    attackSheet["!autofilter"] = { ref: `A3:C${attackRows.length - 2}` };

    // -----------------------------
    // SHEET 3: SECURITY RECOMMENDATIONS
    // -----------------------------
    const recommendationRows = [
      ["SENTINEL AI - SECURITY RECOMMENDATIONS"],
      [],
      ["#", "Recommendation"],
      ...recommendations.map((item, index) => [index + 1, item]),
    ];

    const recommendationSheet = XLSX.utils.aoa_to_sheet(recommendationRows);
    recommendationSheet["!cols"] = [{ wch: 8 }, { wch: 90 }];

    // Workbook
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, summarySheet, "Analysis Summary");
    XLSX.utils.book_append_sheet(workbook, attackSheet, "Attack Distribution");
    XLSX.utils.book_append_sheet(
      workbook,
      recommendationSheet,
      "Recommendations",
    );

    const datasetName = String(result.datasetName || "Analysis")
      .replace(/\.csv$/i, "")
      .replace(/[^a-z0-9_-]+/gi, "_");

    XLSX.writeFile(workbook, `Sentinel_AI_${datasetName}_${Date.now()}.xlsx`);
  };

  return (
    <div
      id="analysis-report"
      className="min-h-screen bg-[#020617] text-white p-6"
    >
      <AnalysisHeader result={result} />
      <br />
      <DatasetInformation datasetInfo={datasetInfo} />
      <br />
      <TrafficStats trafficStats={trafficStats} />
      <br />
      <ThreatSeverity severityStats={severityStats} />
      <br />

      {/* MAIN GRID */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* LEFT SIDE */}
        <div
          className="xl:col-span-2 flex flex-col gap-6"
          style={{ marginLeft: "10px" }}
        >
          <DetectionSummary results={results} />

          <TrafficDistribution result={result} />

          <AttackDistribution result={result} />

          <DetectionResults threatTable={threatTable} />

          <SecurityRecommendations recommendations={recommendations} />
        </div>

        {/* RIGHT SIDE */}
        <div
          className="flex flex-col gap-6"
          style={{ marginLeft: "10px", marginRight: "10px" }}
        >
          <DecisionEngine result={result} />

          <ModelPerformance result={result} />

          <AnalysisOverview result={result} />

          <ExportSection
            handleDownloadPDF={handleDownloadPDF}
            handleExportExcel={handleExportExcel}
          />
        </div>
      </div>
      <br />
    </div>
  );
}

export default Analysis;

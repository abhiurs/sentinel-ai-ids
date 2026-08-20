import {
  Activity,
  ShieldAlert,
  CheckCircle,
  Globe,
} from "lucide-react";

export function buildResults(result) {
  return [
    {
      label: "Prediction",
      value: result?.prediction || "No Threat",
      color: "text-red-400",
    },
    {
      label: "Severity",
      value: result?.severity || "Low",
      color: "text-red-400",
    },
    {
      label: "Confidence Score",
      value: `${result?.confidence || 0}%`,
      color: "text-green-400",
    },
    {
      label: "Model Used",
      value: result?.model || "Random Forest",
      color: "text-blue-400",
    },
  ];
}

export function buildTrafficStats(result) {
  return [
    {
      title: "Packets Analyzed",
      value: result?.packetsAnalyzed
        ? result.packetsAnalyzed.toLocaleString()
        : 0,
      description: "Network packets processed",
      icon: Activity,
      color: "text-blue-400",
    },
    {
      title: "Malicious Traffic",
      value: `${result?.maliciousTraffic || 0}%`,
      percentage: result?.maliciousTraffic || 0,
      description: "Suspicious traffic detected",
      icon: ShieldAlert,
      color: "text-red-400",
    },
    {
      title: "Safe Traffic",
      value: `${result?.safeTraffic || 0}%`,
      percentage: result?.safeTraffic || 0,
      description: "Legitimate network traffic",
      icon: CheckCircle,
      color: "text-green-400",
    },
    {
      title: "Attack Types",
      value: Object.keys(result?.attackSummary || {})
      .filter((attack) => attack.toLowerCase() !== "benign")
      .length,
      description: "Unique attack categories",
      icon: Globe,
      color: "text-yellow-400",
    },
  ];
}

export function buildDatasetInfo(result) {
  return [
    {
      label: "Dataset Name",
      value: result?.datasetName || "NSL_Binary.csv",
    },
    {
      label: "Dataset Type",
      value: "CSV",
    },
    {
      label: "Total Records",
      value: result?.packetsAnalyzed?.toLocaleString() || "25,192",
    },
    {
      label: "Total Features",
      value: result?.features || 42,
    },
    {
      label: "Missing Values",
      value: result?.missingValues || 0,
    },
    {
      label: "Upload Size",
      value: result?.fileSize || "6.4 MB",
    },
  ];
}

export function buildSeverityStats(result) {
  return [
    {
      level: "Critical",
      count: result?.severityBreakdown?.critical ?? 0,
      color: "text-red-500",
      bg: "bg-red-500/10",
      border: "border-red-500/20",
    },
    {
      level: "High",
      count: result?.severityBreakdown?.high ?? 0,
      color: "text-orange-400",
      bg: "bg-orange-500/10",
      border: "border-orange-500/20",
    },
    {
      level: "Medium",
      count: result?.severityBreakdown?.medium ?? 0,
      color: "text-yellow-400",
      bg: "bg-yellow-500/10",
      border: "border-yellow-500/20",
    },
    {
      level: "Low",
      count: result?.severityBreakdown?.low ?? 0,
      color: "text-green-400",
      bg: "bg-green-500/10",
      border: "border-green-500/20",
    },
  ];
}

export function buildDecisionEngine(result) {
  return [
    {
      label: "Detection Model",
      value: result?.model || "Random Forest",
      color: "text-blue-400",
    },
    {
      label: "Dataset",
      value: result?.datasetName || "NSL_Binary.csv",
      color: "text-white",
    },
    {
      label: "Prediction",
      value: result?.prediction || "Normal",
      color: "text-red-400",
    },
    {
      label: "Confidence",
      value: `${result?.confidence || 0}%`,
      color: "text-green-400",
    },
    {
      label: "Analysis Status",
      value: "Completed",
      color: "text-green-400",
    },
    {
      label: "Inference Time",
      value: result?.analysisTime || "0.42 sec",
      color: "text-yellow-400",
    },
  ];
}

export function buildModelPerformance(result) {
  return [
    {
      model: result?.model || "XGBoost",
      accuracy: `${result?.confidence ?? 0}%`,
      status: "Active",
      color: "text-green-400",
    },
  ];
}
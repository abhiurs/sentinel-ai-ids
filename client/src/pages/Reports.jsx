import ReportAnalyticsChart from "../components/ReportAnalyticsChart";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import ReportActionMenu from "../components/reports/ReportActionMenu";
import { generatePDFReport } from "../utils/pdfReport";
import { getRecommendations } from "../utils/recommendations";

import {
  FileText,
  Download,
  ShieldAlert,
  Activity,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";

function Reports() {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const res = await api.get("/history/");
      setReports(Array.isArray(res.data?.history) ? res.data.history : []);
      console.log(res.data.history);
    } catch (err) {
      console.error(err);
    }
  };

  const handleViewReport = async (id) => {
    try {
      const res = await api.get(`/history/${id}`);

      localStorage.setItem("analysisResult", JSON.stringify(res.data.report));

      navigate("/analysis");
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteReport = async (id) => {
    const confirmDelete = window.confirm("Delete this report?");

    if (!confirmDelete) return;

    try {
      await api.delete(`/history/${id}`);

      fetchReports();
    } catch (err) {
      console.error(err);
    }
  };

  const totalReports = reports.length;

  const criticalReports = reports.filter(
    (report) => report.severity === "Critical",
  ).length;

  const highReports = reports.filter(
    (report) => report.severity === "High",
  ).length;

  const mediumReports = reports.filter(
    (report) => report.severity === "Medium",
  ).length;

  const lowReports = reports.filter(
    (report) => report.severity === "Low",
  ).length;

  const benignReports = reports.filter(
    (report) => report.prediction === "Benign",
  ).length;

  const maliciousReports = reports.filter(
    (report) => report.prediction === "Malicious",
  ).length;

  const attackCounts = {};

  reports.forEach((report) => {
    const attack = report.prediction;

    attackCounts[attack] = (attackCounts[attack] || 0) + 1;
  });

  const mostFrequentAttack =
    Object.keys(attackCounts).length > 0
      ? Object.keys(attackCounts).reduce((a, b) =>
          attackCounts[a] > attackCounts[b] ? a : b,
        )
      : "None";

  const highestConfidence =
    reports.length > 0
      ? Math.max(...reports.map((report) => report.confidence))
      : 0;

  const severityScore = {
    Low: 1,
    Medium: 2,
    High: 3,
    Critical: 4,
  };

  const averageSeverity = (() => {
    if (reports.length === 0) return "None";

    const avg =
      reports.reduce((sum, report) => sum + severityScore[report.severity], 0) /
      reports.length;

    if (avg >= 3.5) return "Critical";
    if (avg >= 2.5) return "High";
    if (avg >= 1.5) return "Medium";

    return "Low";
  })();

  const aiRecommendation = (() => {
    if (criticalReports > 0) return "Immediate incident response required";

    if (highReports > 0) return "Strengthen network monitoring";

    if (mediumReports > 0) return "Review firewall and IDS policies";

    return "Network operating normally";
  })();

  const aiReportSummary = [
    {
      title: "Most Frequent Attack",
      value: mostFrequentAttack,
      color: "text-red-400",
    },
    {
      title: "Highest Confidence",
      value: `${highestConfidence}%`,
      color: "text-orange-400",
    },
    {
      title: "Average Risk",
      value: averageSeverity,
      color: "text-yellow-400",
    },
    {
      title: "AI Recommendation",
      value: aiRecommendation,
      color: "text-cyan-400",
    },
  ];

  const reportActivity = reports

    .slice()

    .reverse()

    .slice(0, 5)

    .map((report) => ({
      time: report.createdAt
        ? new Date(report.createdAt).toLocaleString()
        : "Unknown",

      event: `${report.prediction} detected in ${report.datasetName}`,

      type:
        report.severity === "Critical"
          ? "Critical"
          : report.prediction === "Benign"
            ? "Success"
            : "Info",
    }));

  return (
    <div className="min-h-screen bg-[#020617] text-white p-6">
      <div className="h-2"></div>
      {/* HEADER */}
      <div className="mb-8" style={{ marginLeft: "10px" }}>
        <h1 className="text-5xl font-bold">Security Reports Center</h1>

        <p className="text-slate-400 text-xl mt-2">
          AI generated cybersecurity reports and threat intelligence summaries
        </p>
      </div>
      <br />
      {/* TOP STATS */}
      <div
        className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 mb-8"
        style={{ marginLeft: "10px", marginRight: "10px" }}
      >
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400" style={{ marginLeft: "10px" }}>
                Total Reports
              </p>

              <h2
                className="text-4xl font-bold mt-2"
                style={{ marginLeft: "10px" }}
              >
                {totalReports}
              </h2>
            </div>

            <FileText
              className="text-blue-400"
              size={34}
              style={{ marginRight: "10px" }}
            />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400" style={{ marginLeft: "10px" }}>
                Critical Threats
              </p>

              <h2
                className="text-4xl font-bold mt-2 text-red-400"
                style={{ marginLeft: "10px" }}
              >
                {criticalReports}
              </h2>
            </div>

            <ShieldAlert
              className="text-red-400"
              size={34}
              style={{ marginRight: "10px" }}
            />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400" style={{ marginLeft: "10px" }}>
                High Severity
              </p>

              <h2
                className="text-4xl font-bold mt-2 text-yellow-400"
                style={{ marginLeft: "10px" }}
              >
                {highReports}
              </h2>
            </div>

            <AlertTriangle
              className="text-yellow-400"
              size={34}
              style={{ marginRight: "10px" }}
            />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400" style={{ marginLeft: "10px" }}>
                Benign Analyses
              </p>

              <h2
                className="text-4xl font-bold mt-2 text-green-400"
                style={{ marginLeft: "10px" }}
              >
                {benignReports}
              </h2>
            </div>

            <CheckCircle
              className="text-green-400"
              size={34}
              style={{ marginRight: "10px" }}
            />
          </div>
        </div>
      </div>
      <br />
      {/* REPORT ANALYTICS */}

      <ReportAnalyticsChart reports={reports} />

      <br />

      {/* REPORTS TABLE */}
      <div
        className="bg-slate-900 border border-slate-800 rounded-2xl h-[220px] flex flex-col"
        style={{ marginLeft: "10px", marginRight: "10px" }}
      >
        <div className="h-2"></div>
        <div className="p-6 border-b border-slate-800">
          <h2
            className="text-3xl font-bold flex items-center gap-3"
            style={{ marginLeft: "10px" }}
          >
            <Activity className="text-blue-400" />
            Threat Investigation Reports
          </h2>
        </div>
        <div className="h-2"></div>

        <div
          className="overflow-x-auto overflow-y-auto max-h-[150px] pr-2"
          style={{ marginLeft: "10px", marginRight: "10px" }}
        >
          <table className="w-full border-collapse">
            <thead className="sticky top-0 z-10 bg-slate-800 text-slate-300">
              <tr>
                <th className="text-left px-6 py-4">Dataset</th>

                <th className="text-left px-6 py-4">Prediction</th>

                <th className="text-left px-6 py-4">Confidence</th>

                <th className="text-left px-6 py-4">Severity</th>

                <th className="text-left px-6 py-4">Analysis Time</th>

                <th className="text-left px-6 py-4">Actions</th>
              </tr>
            </thead>

            <tbody>
              {reports.map((report) => (
                <tr
                  key={report._id}
                  className="border-b border-slate-800 hover:bg-slate-800/40 transition"
                >
                  <td className="px-6 py-5 font-medium">
                    {report.datasetName}
                  </td>

                  <td className="px-6 py-5 font-medium">{report.prediction}</td>

                  <td className="px-6 py-5 font-medium">
                    {" "}
                    {report.confidence}%
                  </td>

                  <td className="px-6 py-5">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium
                      ${
                        report.severity === "Critical"
                          ? "bg-red-500/20 text-red-400"
                          : report.severity === "High"
                            ? "bg-orange-500/20 text-orange-400"
                            : "bg-yellow-500/20 text-yellow-400"
                      }`}
                    >
                      {report.severity}
                    </span>
                  </td>

                  <td className="px-6 py-5 font-medium">
                    {report.analysisTime}
                  </td>

                  <td className="px-6 py-5">
                    <ReportActionMenu
                      report={report}
                      onView={handleViewReport}
                      onDelete={handleDeleteReport}
                      onDownloadPDF={(report) =>
                        generatePDFReport(report, getRecommendations(report))
                      }
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <br />
      {/* AI REPORT SUMMARY */}

      <div
        className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mt-8 h-[150px]"
        style={{ marginLeft: "10px", marginRight: "10px" }}
      >
        <div className="h-2"></div>
        <h2 className="text-3xl font-bold mb-6" style={{ marginLeft: "10px" }}>
          AI Report Summary
        </h2>
        <div className="h-2"></div>
        <div
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5"
          style={{ marginLeft: "10px", marginRight: "10px" }}
        >
          {aiReportSummary.map((item, index) => (
            <div
              key={index}
              className="bg-slate-800 border border-slate-700 rounded-xl p-5"
            >
              <p
                className="text-slate-400 text-sm"
                style={{ marginLeft: "10px" }}
              >
                {item.title}
              </p>

              <h3
                className={`text-xl font-semibold mt-2 ${item.color}`}
                style={{ marginLeft: "10px" }}
              >
                {item.value}
              </h3>
            </div>
          ))}
        </div>
      </div>
      <br />
      {/* RECENT REPORT ACTIVITY */}

      <div
        className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mt-8 h-[350px]"
        style={{ marginLeft: "10px", marginRight: "10px" }}
      >
        <div className="h-2"></div>
        <h2 className="text-3xl font-bold mb-6" style={{ marginLeft: "10px" }}>
          Recent Report Activity
        </h2>
        <div className="h-2"></div>
        <div className="flex flex-col gap-3" style={{ marginLeft: "10px" }}>
          {reportActivity.map((activity, index) => (
            <div
              key={index}
              className="flex items-start justify-between bg-slate-800 border border-slate-700 rounded-xl p-5 hover:border-blue-500 transition"
            >
              <div>
                <p
                  className="text-white font-medium"
                  style={{ marginLeft: "10px" }}
                >
                  {activity.event}
                </p>

                <p
                  className="text-slate-400 text-sm mt-1"
                  style={{ marginLeft: "10px" }}
                >
                  {activity.time}
                </p>
              </div>

              <span
                className={` relative top-1 px-3 py-1 rounded-full text-sm font-medium
            ${
              activity.type === "Critical"
                ? "bg-red-500/20 text-red-400"
                : activity.type === "Success"
                  ? "bg-green-500/20 text-green-400"
                  : "bg-blue-500/20 text-blue-400"
            }`}
                style={{ marginRight: "10px" }}
              >
                {activity.type}
              </span>
            </div>
          ))}
        </div>
      </div>
      <br />
    </div>
  );
}

export default Reports;

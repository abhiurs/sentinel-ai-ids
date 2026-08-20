import React from "react";
import {
  ShieldAlert,
  CheckCircle2,
  Circle,
  LoaderCircle,
  Clock3,
  Target,
} from "lucide-react";

const getSeverityStyle = (severity) => {
  switch (severity) {
    case "Critical":
      return {
        badge: "bg-red-500/15 text-red-400 border-red-500/30",
        value: "text-red-400",
      };
    case "High":
      return {
        badge: "bg-orange-500/15 text-orange-400 border-orange-500/30",
        value: "text-orange-400",
      };
    case "Medium":
      return {
        badge: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
        value: "text-yellow-400",
      };
    case "Normal":
      return {
        badge: "bg-green-500/15 text-green-400 border-green-500/30",
        value: "text-green-400",
      };
    default:
      return {
        badge: "bg-blue-500/15 text-blue-400 border-blue-500/30",
        value: "text-blue-400",
      };
  }
};

const getStatusStyle = (status) => {
  if (status === "Responding") return "text-red-400";
  if (status === "Investigating") return "text-yellow-400";
  if (status === "Detected") return "text-orange-400";
  if (status === "Monitoring") return "text-green-400";
  return "text-blue-400";
};

const Info = ({ label, value, valueClass = "" }) => (
  <div className="bg-slate-800 rounded-xl p-3 min-h-[76px] flex flex-col justify-center items-center text-center">
    <p className="text-sm text-slate-400 mb-1">{label}</p>

    <span className={`font-semibold ${valueClass}`}>{value || "—"}</span>
  </div>
);

function IncidentResponse({ incident }) {
  if (!incident) return null;

  const steps = Array.isArray(incident.steps) ? incident.steps : [];

  const progress = Math.min(100, Math.max(0, Number(incident.progress) || 0));

  const severityStyle = getSeverityStyle(incident.severity);

  return (
    <div className="bg-[#111827] rounded-2xl border border-slate-700 p-6 shadow-lg h-[560px] transition-all duration-500">
      <div className="h-2"></div>
      {/* Header */}
      <div className="flex justify-between items-center mb-5">
        <div className="flex items-center gap-3" style={{ marginLeft: "10px" }}>
          <ShieldAlert
            className={
              incident.severity === "Normal" ? "text-green-400" : "text-red-500"
            }
            size={28}
          />

          <div>
            <h2 className="text-2xl font-bold text-white">
              Incident Response Center
            </h2>

            <p className="text-slate-400 text-sm">
              Data-driven SOC response assessment
            </p>
          </div>
        </div>

        <span
          className={`px-3 py-1 rounded-full border text-xs font-semibold w-[72px] text-center ${severityStyle.badge}`}
          style={{ marginRight: "10px" }}
        >
          {incident.status === "Waiting" ? "READY" : "LIVE"}
        </span>
      </div>
      <div className="h-2"></div>
      {/* Incident Details */}
      <div
        className="grid grid-cols-2 gap-3 mb-5"
        style={{ marginLeft: "10px", marginRight: "10px" }}
      >
        <Info label="Attack" value={incident.attack} />
        <Info
          label="Severity"
          value={incident.severity}
          valueClass={severityStyle.value}
        />
        <Info label="Phase" value={incident.phase} />
        <Info
          label="Status"
          value={incident.status}
          valueClass={getStatusStyle(incident.status)}
        />
        <Info label="MITRE" value={incident.mitreId} />
        <Info label="Tactic" value={incident.tactic} />
      </div>
      <div className="h-2"></div>
      {/* Progress */}
      <div className="mb-4" style={{ marginLeft: "10px", marginRight: "10px" }}>
        <div className="flex justify-between mb-2">
          <span
            className="text-slate-300 font-medium"
            style={{ marginLeft: "5px" }}
          >
            Playbook Progress
          </span>

          <span className="text-blue-400 font-semibold">
            {incident.progress}%
          </span>
        </div>

        <div className="w-full bg-slate-700 rounded-full h-2.5 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${
              incident.severity === "Critical"
                ? "bg-red-500"
                : incident.severity === "High"
                  ? "bg-orange-500"
                  : incident.severity === "Medium"
                    ? "bg-yellow-500"
                    : "bg-blue-500"
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
      <div className="h-1"></div>
      {/* Remaining Time */}
      <div
        className="flex items-center gap-2 mb-5 text-slate-300"
        style={{ marginLeft: "10px" }}
      >
        <Clock3 size={18} />

        <span>
          {incident.remainingTime === 0
            ? "Assessment complete"
            : incident.remainingTime === "—"
              ? "Waiting for live detection"
              : `Next assessment update: ${incident.remainingTime}s`}
        </span>
      </div>
      <div className="h-1"></div>
      {/* Playbook */}
      <div>
        <div
          className="flex items-center gap-2 mb-3"
          style={{ marginLeft: "10px" }}
        >
          <Target className="text-blue-400" size={18} />

          <h3 className="text-white font-semibold">Response Playbook</h3>
        </div>

        <div className="space-y-2.5" style={{ marginLeft: "10px" }}>
          {steps.map((step, index) => (
            <div
              key={`${step.title}-${index}`}
              className="flex items-center gap-3"
            >
              {step.completed ? (
                <CheckCircle2 className="text-green-400" size={19} />
              ) : step.active ? (
                <LoaderCircle
                  className="text-blue-400 animate-spin"
                  size={19}
                />
              ) : (
                <Circle className="text-slate-500" size={18} />
              )}

              <span
                className={
                  step.completed
                    ? "text-green-400"
                    : step.active
                      ? "text-blue-400"
                      : "text-slate-400"
                }
              >
                {step.title}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default IncidentResponse;

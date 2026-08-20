import { ShieldAlert } from "lucide-react";

function ThreatSeverity({ severityStats }) {
  return (
    <div
      className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-8 h-[150px]"
      style={{ marginLeft: "10px", marginRight: "10px" }}
    >
      <div className="h-2"></div>

      <div
        className="flex items-center gap-3 mb-6"
        style={{ marginLeft: "10px" }}
      >
        <ShieldAlert className="text-red-400" size={28} />

        <h2 className="text-2xl font-bold">Threat Severity Overview</h2>
      </div>

      <div className="h-2"></div>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-5">
        {severityStats.map((item) => (
          <div
            key={item.level}
            className={`rounded-xl border ${item.border} ${item.bg} p-5`}
            style={{ marginLeft: "10px" }}
          >
            <p
              className={`text-lg font-semibold ${item.color}`}
              style={{ marginLeft: "10px" }}
            >
              {item.level}
            </p>

            <h2
              className="text-4xl font-bold mt-3"
              style={{ marginLeft: "10px" }}
            >
              {item.count}
            </h2>

            <p
              className="text-slate-400 text-sm mt-2"
              style={{ marginLeft: "10px" }}
            >
              Detected Threats
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ThreatSeverity;

import {
  ClipboardList,
  Activity,
  ShieldAlert,
  Bug,
  Brain,
  Timer,
} from "lucide-react";

function AnalysisOverview({ result }) {
  const threatsDetected = Object.entries(result.attackSummary || {})
    .filter(([attack]) => attack !== "Benign")
    .reduce((sum, [, count]) => sum + count, 0);

  const attackTypes = Object.keys(result.attackSummary || {}).filter(
    (attack) => attack !== "Benign",
  ).length;

  const OverviewItem = ({ icon, label, value, color }) => (
    <div
      className="flex items-center justify-between
            bg-slate-800
            rounded-xl
            border
            border-slate-700
            p-3"
    >
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${color}`}>{icon}</div>

        <span className="text-slate-300">{label}</span>
      </div>

      <span className="font-bold text-white">{value}</span>
    </div>
  );

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 h-[280px]">
      <div className="h-2"></div>
      <div
        className="flex items-center gap-3 mb-6"
        style={{ marginLeft: "10px" }}
      >
        <ClipboardList className="text-cyan-400" />

        <div>
          <h2 className="text-2xl font-bold">Analysis Overview</h2>

          <p className="text-slate-400 text-sm">Overall Scan Summary</p>
        </div>
      </div>
      <div className="h-2"></div>
      <div
        className="flex flex-col gap-3"
        style={{ marginLeft: "10px", marginRight: "10px" }}
      >
        <OverviewItem
          icon={<Activity size={18} />}
          label="Total Packets"
          value={result.packetsAnalyzed.toLocaleString()}
          color="bg-cyan-500/20 text-cyan-400"
        />

        <OverviewItem
          icon={<ShieldAlert size={18} />}
          label="Threats Detected"
          value={threatsDetected.toLocaleString()}
          color="bg-red-500/20 text-red-400"
        />

        <OverviewItem
          icon={<Bug size={18} />}
          label="Attack Types"
          value={attackTypes}
          color="bg-yellow-500/20 text-yellow-400"
        />

        <OverviewItem
          icon={<Brain size={18} />}
          label="AI Model"
          value={result.model}
          color="bg-blue-500/20 text-blue-400"
        />

        <OverviewItem
          icon={<Timer size={18} />}
          label="Scan Duration"
          value={result.analysisTime}
          color="bg-green-500/20 text-green-400"
        />
      </div>
    </div>
  );
}

export default AnalysisOverview;

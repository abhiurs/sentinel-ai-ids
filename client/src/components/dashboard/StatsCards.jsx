import { ShieldAlert, Activity, ShieldCheck, Brain } from "lucide-react";
import { useMemo } from "react";
import AnimatedNumber from "../common/AnimatedNumber";

const getStoredAnalysis = () => {
  try {
    const stored = localStorage.getItem("analysisResult");

    return stored ? JSON.parse(stored) : {};
  } catch (error) {
    console.error("Failed to parse stored analysis:", error);
    return {};
  }
};

function StatsCards() {
  const analysis = getStoredAnalysis();

  const stats = useMemo(() => {
    const totalPackets = analysis.packetsAnalyzed || 0;

    const threatsDetected = Math.round(
      totalPackets * ((analysis.maliciousTraffic || 0) / 100),
    );

    const secureConnections = totalPackets - threatsDetected;

    return [
      {
        title: "Total Requests",
        value: totalPackets,
        status: "Latest Analysis",
        statusColor: "text-slate-400",
        icon: <Activity size={26} className="text-blue-400" />,
      },

      {
        title: "Threats Detected",
        value: threatsDetected,
        status: analysis.severity || "Normal",
        statusColor: "text-red-400",
        icon: <ShieldAlert size={26} className="text-red-400" />,
      },

      {
        title: "Secure Connections",
        value: secureConnections,
        status: `${analysis.safeTraffic || 0}% Safe`,
        statusColor: "text-green-400",
        icon: <ShieldCheck size={26} className="text-green-400" />,
      },

      {
        title: "AI Accuracy",
        value: analysis.confidence || 0,
        status: analysis.model || "Unknown",
        statusColor: "text-cyan-400",
        icon: <Brain size={26} className="text-cyan-400" />,
      },
    ];
  }, [analysis]);

  return (
    <div
      className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5"
      style={{ marginLeft: "10px", marginRight: "10px" }}
    >
      {stats.map((item, index) => (
        <div
          key={index}
          className="
    bg-slate-900
    border border-slate-700/60
    rounded-xl
    px-5
    py-4
    h-[150px]
    flex
    flex-col
    items-center
    justify-center
    text-center
    transition-all
    duration-300
    hover:border-blue-500/30
  "
        >
          {/* Top Section */}

          <div className="mb-3">{item.icon}</div>

          <p className="text-sm text-slate-400">{item.title}</p>

          <h2 className="text-3xl font-bold text-white mt-1">
            <AnimatedNumber
              value={item.value}
              duration={1800}
              decimals={item.title === "AI Accuracy" ? 2 : 0}
              suffix={item.title === "AI Accuracy" ? "%" : ""}
            />
          </h2>

          {/* Bottom Status */}

          <div className="flex items-center gap-2 mt-2">
            <span
              className={`w-2 h-2 rounded-full ${
                item.status.includes("Updated")
                  ? "bg-slate-400"
                  : item.status.includes("High")
                    ? "bg-red-400"
                    : item.status.includes("Operational")
                      ? "bg-green-400"
                      : "bg-cyan-400"
              }`}
            />

            <p className={`text-xs ${item.statusColor}`}>{item.status}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export default StatsCards;

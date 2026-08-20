import { useMemo } from "react";

function getSeverity(type) {
  const attack = String(type).toLowerCase();

  if (
    attack.includes("dos") ||
    attack.includes("ddos") ||
    attack.includes("hulk")
  ) {
    return "Critical";
  }

  if (
    attack.includes("portscan") ||
    attack.includes("port scan") ||
    attack.includes("bruteforce") ||
    attack.includes("brute force")
  ) {
    return "High";
  }

  if (attack.includes("bot") || attack.includes("web")) {
    return "Medium";
  }

  if (attack === "benign" || attack === "normal") {
    return "Normal";
  }

  return "Low";
}

function getSeverityStyle(severity) {
  switch (severity) {
    case "Critical":
      return {
        dot: "bg-red-500",
        text: "text-red-400",
      };

    case "High":
      return {
        dot: "bg-orange-400",
        text: "text-orange-400",
      };

    case "Medium":
      return {
        dot: "bg-yellow-400",
        text: "text-yellow-400",
      };

    case "Normal":
      return {
        dot: "bg-blue-400",
        text: "text-blue-400",
      };

    default:
      return {
        dot: "bg-green-400",
        text: "text-green-400",
      };
  }
}

function RecentDetections() {
  const attacks = useMemo(() => {
    try {
      const stored = localStorage.getItem("analysisResult");

      if (!stored) return [];

      const analysis = JSON.parse(stored);

      if (!analysis?.attackSummary) return [];

      return Object.entries(analysis.attackSummary)
        .filter(([, count]) => Number(count) > 0)
        .sort((a, b) => Number(b[1]) - Number(a[1]))
        .map(([type, count], index) => {
          const severity = getSeverity(type);

          return {
            id: `${type}-${index}`,
            type,
            count: Number(count),
            severity,
          };
        });
    } catch (error) {
      console.error("Failed to load recent detections:", error);
      return [];
    }
  }, []);

  return (
    <div
      className="bg-slate-900 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm shadow-2xl h-[300px]"
      style={{ marginLeft: "10px", marginRight: "10px" }}
    >
      <div className="h-2"></div>

      <h2
        className="text-xl font-bold text-white"
        style={{ marginLeft: "10px" }}
      >
        Recent Detections
      </h2>

      <p className="text-sm text-slate-400 mt-1" style={{ marginLeft: "10px" }}>
        Attack categories identified in the latest analysis
      </p>

      <div className="h-3"></div>

      <div
        className="space-y-3 max-h-[220px] overflow-y-auto pr-2"
        style={{ marginLeft: "5px", marginRight: "5px" }}
      >
        {attacks.length === 0 ? (
          <div className="flex items-center justify-center h-[180px]">
            <p className="text-slate-500 text-sm">No detections available.</p>
          </div>
        ) : (
          attacks.map((attack) => {
            const styles = getSeverityStyle(attack.severity);

            return (
              <div
                key={attack.id}
                className="
                  hover:bg-slate-700
                  transition-all
                  duration-300
                  rounded
                  p-4
                  border
                  border-slate-700
                  hover:border-blue-500/40
                "
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1" style={{ marginLeft: "10px" }}>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2.5 rounded-full ${styles.dot}`} />

                      <h3 className="font-semibold text-white">
                        {attack.type}
                      </h3>
                    </div>

                    <p className="text-slate-300 text-sm mt-2">
                      {attack.count.toLocaleString()} packets detected
                    </p>

                    <div className="flex items-center gap-3 mt-2">
                      <p className={`text-xs font-medium ${styles.text}`}>
                        {attack.severity}
                      </p>

                      <span className="text-slate-600">•</span>

                      <p className="text-xs text-slate-500">Latest analysis</p>
                    </div>
                  </div>

                  <span
                    className="
                      px-3
                      py-1
                      rounded-xl
                      text-xs
                      font-semibold
                      bg-slate-700/50
                      text-slate-300
                    "
                    style={{ marginRight: "5px" }}
                  >
                    Detected
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default RecentDetections;

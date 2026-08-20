import { PieChart } from "lucide-react";

import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

import { Doughnut } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);

function AttackDistribution({ result }) {
  // Used for the Doughnut Chart (includes Benign)
  const attackEntries = Object.entries(result.attackSummary || {}).sort(
    (a, b) => b[1] - a[1],
  );

  // Used for the Threat Summary & Top Attack Types (excludes Benign)
  const maliciousAttackEntries = attackEntries.filter(
    ([attack]) => attack.toLowerCase() !== "benign",
  );

  const labels = attackEntries.map(([name]) => name);

  const values = attackEntries.map(([, count]) => count);

  const chartData = {
    labels,

    datasets: [
      {
        data: values,

        backgroundColor: [
          "#22c55e",
          "#ef4444",
          "#3b82f6",
          "#f59e0b",
          "#8b5cf6",
          "#06b6d4",
          "#ec4899",
          "#14b8a6",
          "#f97316",
          "#84cc16",
          "#e11d48",
          "#6366f1",
          "#0ea5e9",
          "#a855f7",
        ],

        borderColor: "#0f172a",

        borderWidth: 2,
      },
    ],
  };

  const chartOptions = {
    responsive: true,

    maintainAspectRatio: false,

    cutout: "65%",

    plugins: {
      legend: {
        display: false,
      },
    },
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 h-[500px]">
      {/* Header */}
      <div className="h-2"></div>
      <div
        className="flex items-center gap-3 mb-8"
        style={{ marginLeft: "10px" }}
      >
        <PieChart className="text-blue-400" size={30} />

        <div>
          <h2 className="text-3xl font-bold">Attack Distribution</h2>

          <p className="text-slate-400">
            Machine Learning Attack Classification Summary
          </p>
        </div>
      </div>

      {/* Body */}
      <div className="h-2"></div>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Chart */}

        <div className="h-[380px] flex items-center justify-center">
          <Doughnut data={chartData} options={chartOptions} />
        </div>

        {/* Summary */}

        <div
          className="flex flex-col justify-center"
          style={{ marginLeft: "10px", marginRight: "10px" }}
        >
          <h3 className="text-xl font-semibold mb-6">Threat Ranking</h3>
          <div className="h-2"></div>
          <div className="flex flex-col gap-2">
            {maliciousAttackEntries
              .slice(0, 5)
              .map(([attack, count], index) => {
                const percentage = (
                  (count / result.packetsAnalyzed) *
                  100
                ).toFixed(2);

                return (
                  <div
                    key={attack}
                    className={`rounded-xl px-5 py-4 transition-all duration-300
${
  index === 0
    ? "bg-gradient-to-r from-red-950/40 to-slate-800 border border-red-500/30 hover:border-red-400"
    : "bg-slate-800 hover:bg-slate-700"
}`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <h4
                          className="font-semibold text-white"
                          style={{ marginLeft: "10px" }}
                        >
                          <div className="flex items-center gap-2">
                            {index === 0 && (
                              <span className="text-yellow-400 text-xl">
                                🏆
                              </span>
                            )}

                            <div>
                              <h4 className="font-semibold text-white">
                                {attack}
                              </h4>

                              <p className="text-xs text-slate-400 mt-1">
                                {index === 0
                                  ? "Dominant Attack"
                                  : "Network attack detected"}
                              </p>
                            </div>
                          </div>
                        </h4>
                      </div>

                      <div
                        className="text-right"
                        style={{ marginRight: "10px" }}
                      >
                        <p className="font-bold text-lg">
                          {count.toLocaleString()}
                        </p>

                        <p className="text-xs text-slate-400">
                          {percentage}% of traffic
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
          <div className="h-2"></div>
          <div className="mt-8 grid grid-cols-3 gap-4">
            <div className="bg-slate-800 rounded-xl p-4">
              <p
                className="text-slate-400 text-sm"
                style={{ marginLeft: "10px" }}
              >
                Attack Types
              </p>

              <h3
                className="text-2xl font-bold mt-2"
                style={{ marginLeft: "10px" }}
              >
                {labels.length}
              </h3>
            </div>

            <div className="bg-slate-800 rounded-xl p-4">
              <p
                className="text-slate-400 text-sm"
                style={{ marginLeft: "10px" }}
              >
                Packets
              </p>

              <h3
                className="text-2xl font-bold mt-2"
                style={{ marginLeft: "10px" }}
              >
                {result.packetsAnalyzed.toLocaleString()}
              </h3>
            </div>

            <div className="bg-slate-800 rounded-xl p-4">
              <p
                className="text-slate-400 text-sm"
                style={{ marginLeft: "10px" }}
              >
                Severity
              </p>

              <h3
                className="text-2xl font-bold mt-2 text-red-400"
                style={{ marginLeft: "10px" }}
              >
                {result.severity}
              </h3>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AttackDistribution;

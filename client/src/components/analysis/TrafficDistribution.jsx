import { Radar } from "lucide-react";

import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

import { Doughnut } from "react-chartjs-2";

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

function TrafficDistribution({ result }) {
  const attackLabels = Object.keys(result.attackSummary || {});

  const attackValues = Object.values(result.attackSummary || {});

  const chartData = {
    labels: attackLabels,

    datasets: [
      {
        data: attackValues,

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
        ],

        borderWidth: 2,
        borderColor: "#0f172a",
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,

    plugins: {
      legend: {
        position: "bottom",

        labels: {
          color: "#ffffff",
          padding: 20,
          font: {
            size: 13,
          },
        },
      },
    },
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 h-[150px]">
      <div className="h-2"></div>

      <div
        className="flex items-center gap-3 mb-6"
        style={{ marginLeft: "10px" }}
      >
        <Radar className="text-blue-400" size={30} />

        <h2 className="text-3xl font-bold">Traffic Distribution</h2>
      </div>

      <div className="h-1"></div>

      <div
        className="space-y-6"
        style={{ marginLeft: "10px", marginRight: "10px" }}
      >
        {/* Malicious */}
        <div>
          <div className="flex justify-between mb-2">
            <span>Malicious Traffic</span>

            <span className="text-red-400">{result.maliciousTraffic}%</span>
          </div>

          <div className="w-full bg-slate-800 rounded-full h-5">
            <div
              className="bg-red-500 h-5 rounded-full"
              style={{
                width: `${result.maliciousTraffic}%`,
              }}
            />
          </div>
        </div>

        {/* Safe */}
        <div>
          <div className="flex justify-between mb-2">
            <span>Safe Traffic</span>

            <span className="text-green-400">{result.safeTraffic}%</span>
          </div>

          <div className="w-full bg-slate-800 rounded-full h-5">
            <div
              className="bg-green-500 h-5 rounded-full"
              style={{
                width: `${result.safeTraffic}%`,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default TrafficDistribution;

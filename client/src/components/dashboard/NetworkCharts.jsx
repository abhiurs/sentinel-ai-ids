import {
  LineChart,
  Line,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  LabelList,
  AreaChart,
  Area,
  CartesianGrid,
  Legend,
} from "recharts";
import { useState, useEffect, useMemo } from "react";
import api from "../../api/api";

const initialLineData = [];

const getBarData = (analysis) => {
  if (!analysis?.modelMetrics?.models) return [];

  return Object.entries(analysis.modelMetrics.models).map(
    ([algorithm, metrics]) => ({
      algorithm,
      accuracy: metrics.accuracy,
    }),
  );
};

const COLORS = [
  "#4F7CFF",
  "#F87171",
  "#FBBF24",
  "#34D399",
  "#A855F7",
  "#F97316",
  "#06B6D4",
  "#EAB308",
  "#EC4899",
  "#22C55E",
  "#EF4444",
  "#3B82F6",
  "#8B5CF6",
  "#14B8A6",
  "#F59E0B",
];

const getPieData = (analysis) => {
  if (!analysis?.attackSummary) return [];

  const totalPackets = analysis.packetsAnalyzed || 1;

  return Object.entries(analysis.attackSummary)
    .map(([name, value]) => ({
      name,
      value,
      percentage: (value / totalPackets) * 100,
    }))
    .filter((item) => item.value > 0)
    .sort((a, b) => b.value - a.value);
};

function NetworkCharts({ analysis }) {
  const [lineData, setLineData] = useState(initialLineData);

  console.log("Analysis received:", analysis);

  const pieData = useMemo(() => getPieData(analysis), [analysis]);

  const barData = useMemo(() => {
    const models = analysis?.modelMetrics;

    if (!models || typeof models !== "object") {
      return [];
    }

    return Object.entries(models)
      .map(([algorithm, metrics]) => ({
        algorithm,
        accuracy: Number(metrics?.accuracy),
      }))
      .filter((item) => item.algorithm && Number.isFinite(item.accuracy));
  }, [analysis]);

  console.log("MODEL METRICS RAW:", analysis?.modelMetrics);
  console.log("BAR DATA:", barData);

  console.log(barData);

  useEffect(() => {
    let isMounted = true;

    const fetchLiveTraffic = async () => {
      try {
        const response = await api.get("/live/packets");

        const data = response.data;

        if (!isMounted || !Array.isArray(data?.packets)) {
          return;
        }

        /*
         * Group the real captured packets by time.
         * The backend packet buffer is the source of the data.
         */
        const trafficByTime = {};

        data.packets.forEach((packet) => {
          // Support the timestamp fields returned by the backend
          const rawTime =
            packet.time ||
            packet.timestamp ||
            packet.captured_at ||
            packet.created_at;

          if (!rawTime) return;

          let timeLabel;

          // If backend gives HH:MM:SS
          if (
            typeof rawTime === "string" &&
            /^\d{2}:\d{2}:\d{2}/.test(rawTime)
          ) {
            timeLabel = rawTime.slice(0, 8);
          } else {
            // If backend gives an ISO timestamp
            const date = new Date(rawTime);

            if (Number.isNaN(date.getTime())) return;

            timeLabel = date.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
              hour12: false,
            });
          }

          trafficByTime[timeLabel] = (trafficByTime[timeLabel] || 0) + 1;
        });

        const updatedData = Object.entries(trafficByTime)
          .map(([time, traffic]) => ({
            time,
            traffic,
          }))
          .sort((a, b) => {
            const timeToSeconds = (time) => {
              const [hours, minutes, seconds] = time.split(":").map(Number);
              return hours * 3600 + minutes * 60 + seconds;
            };

            return timeToSeconds(a.time) - timeToSeconds(b.time);
          });

        console.log("PACKETS FROM BACKEND:", data.packets);
        console.log("LIVE NETWORK DATA:", updatedData);

        setLineData(updatedData);
      } catch (error) {
        console.error("Live network activity error:", error);
      }
    };

    // Fetch immediately
    fetchLiveTraffic();

    // Refresh every 3 seconds
    const interval = setInterval(fetchLiveTraffic, 3000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  if (!analysis) {
    return (
      <div className="text-slate-400 p-10 text-center">
        No analysis data available.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 2xl:grid-cols-3 gap-6">
      {/* LINE CHART */}
      <div
        className="xl:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5 backdrop-blur-sm shadow-2xl"
        style={{ marginLeft: "10px", marginRight: "10px" }}
      >
        <div className="h-2"></div>
        <div className="flex justify-between items-center mb-5">
          <div>
            <h2
              className="text-xl font-semibold text-white"
              style={{ marginLeft: "10px" }}
            >
              Network Activity
            </h2>

            <p
              className="text-sm text-slate-400"
              style={{ marginLeft: "10px" }}
            >
              Traffic derived from live captured packets
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />

            <span
              className="text-green-400 text-sm"
              style={{ marginRight: "10px" }}
            >
              LIVE
            </span>
          </div>
        </div>
        <div className="h-2"></div>
        <div className="h-[360px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={lineData}
              animationDuration={800}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <XAxis
                dataKey="time"
                stroke="#64748b"
                tickLine={false}
                axisLine={false}
              />
              <YAxis stroke="#64748b" tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#111827",
                  border: "1px solid #334155",
                  borderRadius: "12px",
                  color: "#fff",
                }}
              />
              <Area
                type="monotone"
                dataKey="traffic"
                stroke="#3b82f6"
                strokeWidth={3}
                fill="url(#trafficGradient)"
              />
              <CartesianGrid
                stroke="#334155"
                strokeDasharray="3 3"
                opacity={0.25}
              />
              <defs>
                <linearGradient id="trafficGradient">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.45} />

                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* PIE CHART */}
      <div
        className="bg-slate-900 border border-slate-800 rounded-2xl p-5 h-[480px]"
        style={{ marginLeft: "10px", marginRight: "10px" }}
      >
        <div className="h-2"></div>
        <div className="mb-5">
          <h2
            className="text-xl font-semibold text-white"
            style={{ marginLeft: "10px" }}
          >
            Attack Distribution
          </h2>

          <p
            className="text-sm text-slate-400 mt-1"
            style={{ marginLeft: "10px" }}
          >
            Live attack categories
          </p>
        </div>
        <div className="h-2"></div>
        <div className="flex flex-col items-center">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <text
                x="50%"
                y="47%"
                textAnchor="middle"
                dominantBaseline="middle"
                className="fill-white text-4xl font-bold"
              >
                {Math.round(
                  (analysis?.packetsAnalyzed || 0) *
                    ((analysis?.maliciousTraffic || 0) / 100),
                ).toLocaleString()}
              </text>

              <text
                x="50%"
                y="59%"
                textAnchor="middle"
                dominantBaseline="middle"
                className="fill-slate-400 text-sm"
              >
                Total Threats
              </text>
              <Pie
                data={pieData}
                dataKey="value"
                innerRadius={80}
                outerRadius={125}
                paddingAngle={2}
                cornerRadius={10}
                isAnimationActive
                animationDuration={1200}
              >
                {pieData.map((entry, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>

              <Tooltip
                contentStyle={{
                  backgroundColor: "#111827",
                  border: "1px solid #334155",
                  borderRadius: "10px",
                  color: "#ffffff",
                }}
              />
            </PieChart>
          </ResponsiveContainer>

          {/* Legend */}

          <div
            className="w-full mt-4 space-y-2 max-h-[100px] overflow-y-auto pr-2"
            style={{ marginLeft: "10px", marginRight: "10px" }}
          >
            {pieData.map((item, index) => (
              <div
                key={item.name}
                className="flex items-center justify-between text-sm"
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: COLORS[index] }}
                  />

                  <span className="text-slate-300">{item.name}</span>
                </div>

                <span
                  className="font-medium text-white"
                  style={{ marginRight: "10px" }}
                >
                  {item.percentage.toFixed(2)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* BAR CHART */}
      <div
        className="xl:col-span-3 bg-slate-900 border border-slate-800 rounded-2xl p-5"
        style={{ marginLeft: "10px", marginRight: "10px" }}
      >
        <div className="h-2"></div>
        <div className="mb-5">
          <h2
            className="text-xl font-semibold text-white"
            style={{ marginLeft: "10px" }}
          >
            Machine Learning Model Performance
          </h2>

          <p
            className="text-sm text-slate-400 mt-1"
            style={{ marginLeft: "10px" }}
          >
            Accuracy comparison across trained IDS models
          </p>
        </div>
        <div className="h-2"></div>
        <div className="w-full h-[320px]" style={{ marginRight: "10px" }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData} barCategoryGap={5}>
              <CartesianGrid
                stroke="#334155"
                strokeDasharray="3 3"
                opacity={0.25}
              />

              <XAxis
                dataKey="algorithm"
                stroke="#94a3b8"
                tick={{ fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />

              <YAxis
                domain={[0, 105]}
                stroke="#94a3b8"
                tick={{ fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(value) => `${value}%`}
              />

              <Tooltip
                formatter={(value) => `${value}%`}
                contentStyle={{
                  backgroundColor: "#111827",
                  border: "1px solid #334155",
                  borderRadius: "10px",
                  color: "#fff",
                }}
              />

              <Bar
                dataKey="accuracy"
                fill="#3b82f6"
                radius={[10, 10, 0, 0]}
                barSize={150}
                animationDuration={1200}
              >
                <LabelList
                  dataKey="accuracy"
                  position="top"
                  formatter={(value) => `${value}%`}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

export default NetworkCharts;

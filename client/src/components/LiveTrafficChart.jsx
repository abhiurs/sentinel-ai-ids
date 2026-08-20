import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

function LiveTrafficChart({ chartData = [], throughput = 0, isLive = false }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 h-[450px]">
      <div className="h-2"></div>

      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-3xl font-bold" style={{ marginLeft: "10px" }}>
              Live Network Traffic
            </h2>

            {isLive && (
              <div className="flex items-center gap-2 text-xs font-semibold text-green-400">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                LIVE DATA
              </div>
            )}
          </div>

          <p className="text-slate-400 mt-1" style={{ marginLeft: "10px" }}>
            {isLive
              ? "Real-time traffic from captured network packets"
              : "Real-time packet monitoring"}
          </p>
        </div>

        <div className="flex items-center gap-6 mt-3 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span className="text-slate-300">Total Traffic</span>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="text-slate-300">Benign</span>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span className="text-slate-300">Malicious</span>
          </div>
        </div>

        <div className="text-right" style={{ marginRight: "10px" }}>
          <h2 className="text-3xl font-bold text-blue-400">
            {Number(throughput || 0).toFixed(2)} Mbps
          </h2>

          <p className="text-slate-400 text-sm">
            {isLive ? "Current Throughput" : "Current Throughput"}
          </p>
        </div>
      </div>

      <div className="h-2"></div>

      <div className="h-[340px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={Array.isArray(chartData) ? chartData : []}
            margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />

            <XAxis
              dataKey="time"
              stroke="#94A3B8"
              tick={{ fontSize: 12 }}
              minTickGap={25}
            />

            <YAxis
              stroke="#94A3B8"
              tick={{ fontSize: 12 }}
              allowDecimals={false}
            />

            <Tooltip
              contentStyle={{
                backgroundColor: "#0f172a",
                border: "1px solid #334155",
                borderRadius: "10px",
                color: "#ffffff",
              }}
              labelStyle={{
                color: "#cbd5e1",
                marginBottom: "4px",
              }}
            />

            <Line
              type="monotone"
              dataKey="packets"
              name="Total Traffic"
              stroke="#3B82F6"
              strokeWidth={3}
              dot={false}
              isAnimationActive={false}
            />

            <Line
              type="monotone"
              dataKey="benign"
              name="Benign"
              stroke="#22C55E"
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />

            <Line
              type="monotone"
              dataKey="malicious"
              name="Malicious"
              stroke="#EF4444"
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {isLive && (
        <div
          className="mt-2 text-xs text-slate-500"
          style={{ marginLeft: "10px" }}
        >
          Data source: Live packet capture + CICIDS2017 ML detection
        </div>
      )}
    </div>
  );
}

export default LiveTrafficChart;

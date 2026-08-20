import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

const COLORS = ["#ef4444", "#f97316", "#eab308", "#22c55e"];

function ThreatChart() {
  let analysis = {};

  try {
    const stored = localStorage.getItem("analysisResult");
    analysis = stored ? JSON.parse(stored) : {};
  } catch (error) {
    console.error("Failed to load threat chart analysis:", error);
  }

  const breakdown = analysis?.severityBreakdown || {};

  const data = [
    {
      name: "Critical",
      value: Number(breakdown.critical || 0),
    },
    {
      name: "High",
      value: Number(breakdown.high || 0),
    },
    {
      name: "Medium",
      value: Number(breakdown.medium || 0),
    },
    {
      name: "Low",
      value: Number(breakdown.low || 0),
    },
  ].filter((item) => item.value > 0);

  const hasData = data.length > 0;

  return (
    <div
      className="bg-slate-900 border border-slate-800 rounded-2xl p-6 h-[300px]"
      style={{ marginLeft: "10px" }}
    >
      <div className="h-2"></div>

      <h2
        className="text-2xl font-bold mb-6 text-white"
        style={{ marginLeft: "10px" }}
      >
        Global Threat Landscape
      </h2>

      <div className="flex items-center justify-center gap-16 h-[250px]">
        {/* PIE CHART */}
        <div className="w-[420px] h-full">
          {hasData ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={75}
                  outerRadius={110}
                  paddingAngle={3}
                  cornerRadius={6}
                  label={false}
                  labelLine={false}
                >
                  {data.map((entry, index) => (
                    <Cell key={index} fill={COLORS[index]} />
                  ))}
                </Pie>

                <text
                  x="50%"
                  y="47%"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="#ffffff"
                  fontSize="34"
                  fontWeight="700"
                >
                  {breakdown.critical || 0}
                </text>

                <text
                  x="50%"
                  y="57%"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="#94a3b8"
                  fontSize="15"
                >
                  Critical Threats
                </text>

                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-center">
              <p className="text-slate-500 text-sm">
                No threat landscape data available.
              </p>
            </div>
          )}
        </div>

        {/* LEGEND */}
        <div
          className="w-80 flex flex-col gap-3 space-y-4"
          style={{ marginRight: "5px" }}
        >
          {hasData ? (
            data.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between bg-slate-800 border border-slate-700 rounded-xl px-5 py-4"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{
                      backgroundColor: COLORS[index],
                      marginLeft: "10px",
                    }}
                  />

                  <span className="text-slate-300">{item.name}</span>
                </div>

                <span
                  className="font-semibold text-white"
                  style={{ marginRight: "10px" }}
                >
                  {item.value.toLocaleString()}
                </span>
              </div>
            ))
          ) : (
            <div className="text-slate-500 text-sm text-center py-8">
              Run an analysis to populate threat severity data.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ThreatChart;

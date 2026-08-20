import {
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

function ReportAnalyticsChart({ reports }) {
  const reportData = [
    {
      category: "Critical",
      reports: reports.filter((r) => r.severity === "Critical").length,
    },
    {
      category: "High",
      reports: reports.filter((r) => r.severity === "High").length,
    },
    {
      category: "Medium",
      reports: reports.filter((r) => r.severity === "Medium").length,
    },
    {
      category: "Low",
      reports: reports.filter((r) => r.severity === "Low").length,
    },
  ];

  return (
    <div
      className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-8"
      style={{ marginLeft: "10px", marginRight: "10px" }}
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-bold" style={{ marginLeft: "10px" }}>
            Report Analytics
          </h2>

          <p className="text-slate-400 mt-1" style={{ marginLeft: "10px" }}>
            Security reports generated during the last 7 days
          </p>
        </div>

        <div className="text-right">
          <h2
            className="text-3xl font-bold text-cyan-400"
            style={{ marginRight: "10px" }}
          >
            {reports.length}
          </h2>

          <p className="text-slate-400 text-sm" style={{ marginRight: "10px" }}>
            Stored Reports
          </p>
        </div>
      </div>
      <div className="h-2"></div>
      <div className="h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={reportData}>
            <CartesianGrid stroke="#334155" strokeDasharray="3 3" />

            <XAxis dataKey="category" stroke="#94A3B8" />

            <YAxis stroke="#94A3B8" />

            <Tooltip />

            <Bar dataKey="reports" fill="#3B82F6" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default ReportAnalyticsChart;

import { AlertTriangle } from "lucide-react";

function SecurityRecommendations({ recommendations }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 h-[210px]">
      <div className="h-2"></div>

      <div
        className="flex items-center gap-3 mb-5"
        style={{ marginLeft: "10px" }}
      >
        <AlertTriangle className="text-yellow-400" />

        <h2 className="text-2xl font-bold">Security Recommendations</h2>
      </div>

      <div className="h-2"></div>

      <div className="flex flex-col gap-2" style={{ marginLeft: "5px" }}>
        {recommendations.map((item, index) => (
          <div
            key={index}
            className="bg-slate-800 rounded-xl p-4 text-slate-300"
          >
            • {item}
          </div>
        ))}
      </div>
    </div>
  );
}

export default SecurityRecommendations;

import { ShieldAlert } from "lucide-react";

function DetectionSummary({ results }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 h-[250px]">
      <div className="h-2"></div>

      <div className="flex items-center gap-4 mb-6">
        <div
          className="w-16 h-16 rounded-2xl bg-red-500/20 flex items-center justify-center"
          style={{ marginLeft: "10px" }}
        >
          <ShieldAlert className="text-red-400" size={34} />
        </div>

        <div>
          <h2 className="text-4xl font-bold">Detection Summary</h2>

          <p className="text-slate-400 text-lg">
            AI engine identified malicious traffic behavior
          </p>
        </div>
      </div>

      <div className="h-2"></div>

      <div
        className="grid grid-cols-1 md:grid-cols-2 gap-5"
        style={{ marginLeft: "10px", marginRight: "10px" }}
      >
        {results.map((item, index) => (
          <div
            key={index}
            className="bg-slate-800 rounded-xl p-5 border border-slate-700"
          >
            <p
              className="text-slate-400 text-sm"
              style={{ marginLeft: "10px" }}
            >
              {item.label}
            </p>

            <h3
              className={`text-3xl font-bold mt-2 ${item.color}`}
              style={{ marginLeft: "10px" }}
            >
              {item.value}
            </h3>
          </div>
        ))}
      </div>
    </div>
  );
}

export default DetectionSummary;

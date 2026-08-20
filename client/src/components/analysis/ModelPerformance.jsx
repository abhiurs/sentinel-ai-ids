import { Activity } from "lucide-react";

function ModelPerformance({ result }) {
  const MODELS = [
    { name: "Decision Tree", accuracy: 98.41 },
    { name: "Random Forest", accuracy: 99.32 },
    { name: "Extra Trees", accuracy: 99.76 },
    { name: "XGBoost", accuracy: 99.84 },
    { name: "KNN", accuracy: 97.95 },
  ];

  const activeModel = MODELS.find((m) => m.name === result.model) || MODELS[0];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 h-[500px]">
      <div className="h-2"></div>
      <div
        className="flex items-center gap-3 mb-5"
        style={{ marginLeft: "10px" }}
      >
        <Activity className="text-blue-400" />

        <h2 className="text-2xl font-bold">Model Performance</h2>
      </div>
      <div className="h-2"></div>
      <div className="flex flex-col gap-3">
        {/* Active Model */}

        <div
          className="bg-slate-800 rounded-xl border border-blue-500/30 p-5"
          style={{ marginLeft: "10px" }}
        >
          <p className="text-slate-400 text-sm" style={{ marginLeft: "10px" }}>
            Active Model
          </p>

          <h2 className="text-2xl font-bold text-blue-400 mt-1">
            ⭐ {activeModel.name}
          </h2>

          <div className="mt-5">
            <p
              className="text-slate-400 text-sm"
              style={{ marginLeft: "10px" }}
            >
              Accuracy
            </p>

            <h1
              className="text-4xl font-bold text-green-400"
              style={{ marginLeft: "5px" }}
            >
              {activeModel.accuracy}%
            </h1>
          </div>
        </div>

        {/* Comparison */}

        <div
          className="flex flex-col gap-3"
          style={{ marginLeft: "10px", marginRight: "10px" }}
        >
          <h3 className="font-semibold text-lg mb-4">Model Comparison</h3>

          {MODELS.map((model) => {
            const width = `${model.accuracy}%`;

            const active = model.name === activeModel.name;

            return (
              <div key={model.name} className="mb-4">
                <div className="flex justify-between mb-1">
                  <span
                    className={`${
                      active ? "text-blue-400 font-semibold" : "text-slate-300"
                    }`}
                  >
                    {active ? "⭐ " : ""}
                    {model.name}
                  </span>

                  <span className="text-slate-400">{model.accuracy}%</span>
                </div>

                <div className="w-full h-2 bg-slate-700 rounded-full">
                  <div
                    className={`h-2 rounded-full ${
                      active ? "bg-blue-400" : "bg-slate-500"
                    }`}
                    style={{ width }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default ModelPerformance;

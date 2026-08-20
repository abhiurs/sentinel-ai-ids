function AnalysisHeader({ result }) {
  return (
    /* HEADER */
    <div className="mb-8">
      <div className="h-2"></div>
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6">
        {/* LEFT */}
        <div className="" style={{ marginLeft: "10px" }}>
          <p className="uppercase tracking-[4px] text-blue-400 text-sm font-semibold">
            Sentinel AI Report
          </p>

          <h1 className="text-5xl font-bold mt-2">AI Threat Analysis Report</h1>

          <p className="text-slate-400 text-lg mt-3">
            Machine Learning Based Intrusion Detection Analysis
          </p>
        </div>

        {/* RIGHT */}
        <div className="h-2"></div>
        <div
          className="grid grid-cols-2 xl:grid-cols-3 gap-4"
          style={{ marginLeft: "10px", marginRight: "10px" }}
        >
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 hover:border-blue-500 transition-all duration-300 hover:-translate-y-1">
            <p
              className="text-slate-400 text-sm"
              style={{ marginLeft: "10px" }}
            >
              Dataset
            </p>

            <h3
              className="font-semibold text-lg mt-1"
              style={{ marginLeft: "10px" }}
            >
              {result.datasetName || "NSL_Binary.csv"}
            </h3>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 hover:border-blue-500 transition-all duration-300 hover:-translate-y-1">
            <p
              className="text-slate-400 text-sm"
              style={{ marginLeft: "10px" }}
            >
              Detection Model
            </p>

            <h3
              className="font-semibold text-lg mt-1 text-blue-400"
              style={{ marginLeft: "10px" }}
            >
              {result.model || "Random Forest"}
            </h3>
          </div>

          {/* Prediction */}

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 hover:border-blue-500 transition-all duration-300 hover:-translate-y-1">
            <p
              className="text-slate-400 text-sm"
              style={{ marginLeft: "10px" }}
            >
              Overall Network Status
            </p>

            <h3
              className={`font-semibold text-lg mt-2 ${
                result.prediction === "Malicious"
                  ? "text-red-400"
                  : "text-green-400"
              }`}
              style={{ marginLeft: "10px" }}
            >
              {result.prediction}
            </h3>
          </div>

          {/* Confidence */}

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 hover:border-blue-500 transition-all duration-300 hover:-translate-y-1">
            <p
              className="text-slate-400 text-sm"
              style={{ marginLeft: "10px" }}
            >
              Confidence
            </p>

            <h3
              className="font-semibold text-lg mt-2 text-cyan-400"
              style={{ marginLeft: "10px" }}
            >
              {result.confidence}%
            </h3>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 hover:border-blue-500 transition-all duration-300 hover:-translate-y-1">
            <p
              className="text-slate-400 text-sm"
              style={{ marginLeft: "10px" }}
            >
              Analysis Status
            </p>

            <h3
              className="font-semibold text-green-400 mt-1"
              style={{ marginLeft: "10px" }}
            >
              Completed Successfully
            </h3>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 hover:border-blue-500 transition-all duration-300 hover:-translate-y-1">
            <p
              className="text-slate-400 text-sm"
              style={{ marginLeft: "10px" }}
            >
              Analysis Time
            </p>

            <h3 className="font-semibold mt-1" style={{ marginLeft: "10px" }}>
              {result.analysisTime}
            </h3>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AnalysisHeader;

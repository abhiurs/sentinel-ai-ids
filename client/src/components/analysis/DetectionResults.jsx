function DetectionResults({ threatTable }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 h-[420px]">
      <div className="h-2"></div>

      <div
        className="flex items-center justify-between mb-6"
        style={{ marginLeft: "10px", marginRight: "10px" }}
      >
        <h2 className="text-2xl font-bold">Detection Results</h2>

        <span className="text-sm text-slate-400">
          Scroll to view all {threatTable.length} results
        </span>
      </div>

      <div className="h-2"></div>

      <div
        className="overflow-x-auto"
        style={{ marginLeft: "10px", marginRight: "10px" }}
      >
        <div className="max-h-[360px] overflow-y-auto custom-scrollbar">
          <table className="w-full">
            <thead className="sticky top-0 bg-slate-900 z-10">
              <tr className="border-b border-slate-700 text-slate-400">
                <th className="text-left py-3">Record ID</th>
                <th className="text-left py-3">Prediction</th>
                <th className="text-left py-3">Confidence</th>
                <th className="text-left py-3">Severity</th>
                <th className="text-left py-3">Status</th>
                <th className="text-left py-3">Count</th>
              </tr>
            </thead>

            <tbody>
              {threatTable.map((item) => (
                <tr
                  key={item.id}
                  className={`border-b border-slate-800 transition-colors duration-200 ${
                    item.status === "Detected"
                      ? "hover:bg-red-500/5"
                      : "hover:bg-green-500/5"
                  }`}
                >
                  <td className="py-4">{item.id}</td>

                  <td
                    className={
                      item.status === "Detected"
                        ? "text-red-400 font-medium"
                        : "text-green-400 font-medium"
                    }
                  >
                    {item.prediction}
                  </td>

                  <td>{item.confidence}</td>

                  <td>{item.severity}</td>

                  <td>
                    <span
                      className={`px-3 py-1 rounded-full text-sm ${
                        item.status === "Detected"
                          ? "bg-red-500/20 text-red-400"
                          : "bg-green-500/20 text-green-400"
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>

                  <td>{item.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default DetectionResults;

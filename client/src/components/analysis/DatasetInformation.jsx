import { UploadCloud } from "lucide-react";

function DatasetInformation({ datasetInfo }) {
  return (
    <div
      className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-8 h-[100px]"
      style={{ marginLeft: "10px", marginRight: "10px" }}
    >
      <div className="h-2"></div>

      <div
        className="flex items-center gap-3 mb-6"
        style={{ marginLeft: "10px" }}
      >
        <UploadCloud className="text-blue-400" size={28} />

        <h2 className="text-2xl font-bold">Dataset Information</h2>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-5">
        {datasetInfo.map((item, index) => (
          <div
            key={index}
            className="bg-slate-800 border border-slate-700 rounded-xl p-4"
            style={{ marginLeft: "10px", marginRight: "10px" }}
          >
            <p
              className="text-slate-400 text-sm"
              style={{ marginLeft: "10px" }}
            >
              {item.label}
            </p>

            <h3
              className="text-lg font-semibold mt-2"
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

export default DatasetInformation;

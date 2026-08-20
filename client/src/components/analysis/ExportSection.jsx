import { FileText, FileSpreadsheet } from "lucide-react";

function ExportSection({
  handleDownloadPDF,
  handleExportCSV,
  handleExportExcel,
}) {
  return (
    <div
      className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mt-6 h-[120px]"
      style={{ marginLeft: "10px", marginRight: "10px" }}
    >
      <div className="h-2"></div>

      <div className="mb-5" style={{ marginLeft: "10px" }}>
        <h2 className="text-2xl font-bold mb-6">Export Analysis</h2>

        <p className="text-sm text-slate-400 mt-1">
          Save the current ML analysis for investigation and documentation.
        </p>
      </div>

      <div className="h-2"></div>

      <div
        className="grid grid-cols-1 sm:grid-cols-2 gap-4"
        style={{ marginLeft: "10px", marginRight: "10px" }}
      >
        <button
          onClick={handleDownloadPDF}
          className="
        group
        flex items-center gap-4
        w-full
        rounded-xl
        border border-blue-500/30
        bg-slate-800/80
        px-4 py-4
        text-left
        transition-all duration-200
        hover:border-blue-400/60
        hover:bg-blue-500/10
        hover:-translate-y-0.5
        hover:shadow-lg hover:shadow-blue-500/10
      "
        >
          <div
            className="
    flex h-11 w-11 shrink-0
    items-center justify-center
    rounded-lg
    bg-blue-500/15
    text-blue-400
    group-hover:bg-blue-500/25
  "
          >
            <FileText size={22} strokeWidth={2} />
          </div>

          <div>
            <p className="font-semibold text-white">Download PDF</p>

            <p className="text-xs text-slate-400 mt-0.5">
              Full analysis report
            </p>
          </div>
        </button>

        <button
          onClick={handleExportExcel}
          className="
        group
        flex items-center gap-4
        w-full
        rounded-xl
        border border-emerald-500/30
        bg-slate-800/80
        px-4 py-4
        text-left
        transition-all duration-200
        hover:border-emerald-400/60
        hover:bg-emerald-500/10
        hover:-translate-y-0.5
        hover:shadow-lg hover:shadow-emerald-500/10
      "
        >
          <div
            className="
    flex h-11 w-11 shrink-0
    items-center justify-center
    rounded-lg
    bg-emerald-500/15
    text-emerald-400
    group-hover:bg-emerald-500/25
  "
          >
            <FileSpreadsheet size={22} strokeWidth={2} />
          </div>

          <div>
            <p className="font-semibold text-white">Export Excel</p>

            <p className="text-xs text-slate-400 mt-0.5">
              Detailed analysis data
            </p>
          </div>
        </button>
      </div>

      <br />
    </div>
  );
}

export default ExportSection;

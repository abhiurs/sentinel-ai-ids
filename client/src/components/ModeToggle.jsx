import { Wifi, Cpu } from "lucide-react";
import { useSimulationMode } from "../context/SimulationContext";

export default function ModeToggle() {
  const { mode, toggleMode } = useSimulationMode();

  return (
    <div className="flex items-center gap-3 bg-slate-800 border border-slate-700 rounded-xl px-4 py-2">
      <div className="flex items-center gap-2" style={{ marginLeft: "10px" }}>
        <Cpu
          size={18}
          className={mode === "demo" ? "text-blue-400" : "text-slate-500"}
        />

        <span
          className={
            mode === "demo" ? "text-blue-400 font-medium" : "text-slate-500"
          }
        >
          Demo
        </span>
      </div>

      <button
        onClick={toggleMode}
        className={`w-14 h-7 rounded-full transition relative ${
          mode === "demo" ? "bg-blue-500" : "bg-green-500"
        }`}
      >
        <div
          className={`absolute top-1 w-5 h-5 rounded-full bg-white transition ${
            mode === "demo" ? "left-1" : "left-8"
          }`}
        />
      </button>

      <div className="flex items-center gap-2">
        <Wifi
          size={18}
          className={mode === "live" ? "text-green-400" : "text-slate-500"}
        />

        <span
          className={
            mode === "live" ? "text-green-400 font-medium" : "text-slate-500"
          }
        >
          Live
        </span>
      </div>
    </div>
  );
}

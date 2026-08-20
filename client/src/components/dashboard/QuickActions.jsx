import {
  Upload,
  Activity,
  FileText,
  RefreshCcw,
  ArrowRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const actions = [
  {
    title: "Analyze Traffic",
    description: "Upload CSV or PCAP files",
    icon: Upload,
    route: "/upload",
  },
  {
    title: "Live Monitoring",
    description: "Monitor network traffic",
    icon: Activity,
    route: "/monitoring",
  },
  {
    title: "Generate Report",
    description: "View detection reports",
    icon: FileText,
    route: "/reports",
  },
  {
    title: "Refresh Dashboard",
    description: "Reload dashboard metrics",
    icon: RefreshCcw,
    route: "refresh",
  },
];

function QuickActions() {
  const navigate = useNavigate();
  const handleRefresh = () => {
    window.location.reload();
  };
  return (
    <div
      className="bg-slate-900 h-[300px] border border-slate-800 rounded-2xl p-6 backdrop-blur-sm shadow-2xl"
      style={{ marginLeft: "10px", marginRight: "10px" }}
    >
      <div className="h-2"></div>
      <h3
        className="text-xl font-semibold text-white"
        style={{ marginLeft: "10px" }}
      >
        Quick Actions
      </h3>

      <p className="text-sm text-slate-400 mt-1" style={{ marginLeft: "10px" }}>
        Frequently used operations
      </p>
      <div className="h-2"></div>
      <div
        className="flex flex-col justify-between h-[220px] mt-6"
        style={{ marginLeft: "5px" }}
      >
        {actions.map((action, index) => {
          const Icon = action.icon;

          return (
            <div
              key={index}
              onClick={() =>
                action.route === "refresh"
                  ? handleRefresh()
                  : navigate(action.route)
              }
              className="
          cursor-pointer
          rounded-xl
          border
          border-slate-700
          bg-[#161d2e]
          h-[50px]
          transition-all
          duration-200
          hover:border-blue-500/40
          hover:bg-[#1b2335]
          hover:-translate-y-1
        "
            >
              <div className="flex items-center justify-between">
                <div className="flex gap-4 items-center">
                  <div
                    className="
              w-11
              h-11
              rounded-xl
              bg-blue-600/10
              flex
              items-center
              justify-center
            "
                  >
                    <Icon className="text-blue-400" size={20} />
                  </div>

                  <div>
                    <h4 className="text-white font-semibold">{action.title}</h4>

                    <p className="text-slate-400 text-sm">
                      {action.description}
                    </p>
                  </div>
                </div>

                <div className="ml-4">
                  <ArrowRight size={18} className="text-slate-500" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default QuickActions;

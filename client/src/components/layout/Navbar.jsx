import { Search, RefreshCw } from "lucide-react";
import { useState } from "react";
import { useLocation } from "react-router-dom";

const pageInfo = {
  "/dashboard": {
    title: "Dashboard",
    placeholder: "Search metrics...",
  },

  "/overview": {
    title: "Project Overview",
    placeholder: "Search algorithms...",
  },

  "/upload": {
    title: "Upload Dataset",
    placeholder: "Search datasets...",
  },

  "/analysis": {
    title: "Network Intrusion Detection Report",
    placeholder: "Search analysis...",
  },

  "/threat-intel": {
    title: "Threat Intelligence",
    placeholder: "Search threats...",
  },

  "/reports": {
    title: "Security Reports",
    placeholder: "Search reports...",
  },

  "/monitoring": {
    title: "Live Monitoring",
    placeholder: "Search IP address...",
  },
};

function Navbar() {
  const location = useLocation();

  const currentPage = pageInfo[location.pathname];

  const [lastUpdated, setLastUpdated] = useState(new Date());

  const [loading, setLoading] = useState(false);

  const handleRefresh = async () => {
    setLoading(true);

    await new Promise((resolve) => setTimeout(resolve, 700));

    setLastUpdated(new Date());

    setLoading(false);
  };

  return (
    <div className="h-[64px] bg-slate-900 border-b border-slate-800 flex items-center justify-between px-8">
      {/* LEFT */}
      <div>
        <h2 className="text-3xl font-bold text-white">{currentPage.title}</h2>

        <p className="text-sm text-slate-400 mt-1">
          Security Operations Center
        </p>
      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-5">
        {/* SEARCH */}
        <div className="flex w-[340px] h-10 items-center gap-2 bg-slate-800 px-3 py-2 rounded-xl border border-slate-700">
          <Search
            size={18}
            className="text-slate-400"
            style={{ marginLeft: "10px" }}
          />

          <input
            type="text"
            placeholder={currentPage.placeholder}
            className="bg-transparent outline-none text-sm text-white w-[280px]"
          />
        </div>

        <button
          onClick={handleRefresh}
          className="
flex
items-center
justify-center
w-10
h-10
rounded-xl
bg-slate-800
border
border-slate-700
hover:border-blue-500
hover:bg-slate-700
transition
"
        >
          <RefreshCw size={18} className="text-slate-300" />
        </button>

        <div className="text-right">
          <p className="text-xs text-slate-500" style={{ marginRight: "20px" }}>
            Last Updated
          </p>

          <p
            className="text-sm font-medium text-white"
            style={{ marginRight: "20px" }}
          >
            {lastUpdated.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            })}
          </p>
        </div>
      </div>
    </div>
  );
}

export default Navbar;

import StatsCards from "../components/dashboard/StatsCards";
import { useEffect, useState } from "react";
import NetworkCharts from "../components/dashboard/NetworkCharts";
import RecentDetections from "../components/dashboard/RecentDetections";
import QuickActions from "../components/dashboard/QuickActions";

function Dashboard() {
  const [analysis, setAnalysis] = useState(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("analysisResult");

      if (stored) {
        setAnalysis(JSON.parse(stored));
      }
    } catch (error) {
      console.error("Failed to load dashboard analysis:", error);
      setAnalysis(null);
    }
  }, []);

  return (
    <div className="space-y-10 pt-4">
      {/* HEADER */}
      <div className="h-2"></div>
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="mb-8">
          <h1
            className="text-5xl font-bold text-white"
            style={{ marginLeft: "10px" }}
          >
            Security Dashboard
          </h1>

          <p
            className="mt-2 text-slate-400 text-lg"
            style={{ marginLeft: "10px" }}
          >
            Real-time AI-powered Network Intrusion Detection & Threat Monitoring
          </p>
        </div>
      </div>

      <br />

      {/* STATS */}

      <StatsCards />

      <br />

      {/* CHARTS */}
      <div className="pt-2">
        <NetworkCharts analysis={analysis} />
      </div>
      <br />

      {/* LOWER SECTION */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* RECENT */}
        <div className="2xl:col-span-2">
          <RecentDetections />
        </div>

        {/* SIDE */}
        <div className="space-y-6">
          <QuickActions />
        </div>
      </div>
      <br />
    </div>
  );
}

export default Dashboard;

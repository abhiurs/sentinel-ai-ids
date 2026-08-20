import {
  LayoutDashboard,
  BarChart3,
  UploadCloud,
  ShieldAlert,
  FileBarChart,
  Activity,
  Shield,
  LogOut,
} from "lucide-react";

import { NavLink, useNavigate, useLocation } from "react-router-dom";

const menuItems = [
  {
    name: "Dashboard",
    path: "/dashboard",
    icon: <LayoutDashboard size={20} />,
  },
  {
    name: "Overview",
    path: "/overview",
    icon: <BarChart3 size={20} />,
  },
  {
    name: "Upload",
    path: "/upload",
    icon: <UploadCloud size={20} />,
  },
  {
    name: "Threat Intel",
    path: "/threat-intel",
    icon: <ShieldAlert size={20} />,
  },
  {
    name: "Reports",
    path: "/reports",
    icon: <FileBarChart size={20} />,
  },
  {
    name: "Live Monitoring",
    path: "/monitoring",
    icon: <Activity size={20} />,
  },
];

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const username = localStorage.getItem("username");

  const initial = username ? username.charAt(0).toUpperCase() : "U";

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("username");
    localStorage.removeItem("userEmail");

    navigate("/login", { replace: true });
  };

  return (
    <div className="w-[280px] bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border-r border-slate-800 h-screen sticky top-0 p-6 flex flex-col">
      {/* LOGO */}
      <div className="flex items-center gap-4 mb-8">
        <div className="bg-blue-600/20 p-3 rounded-xl">
          <Shield size={28} className="text-blue-400" />
        </div>

        <div>
          <h1 className="text-2xl font-bold text-white">Sentinel AI</h1>

          <p className="text-slate-400 text-sm">Enterprise IDS Platform</p>
        </div>
      </div>

      <div className="border-b border-slate-800 mb-6"></div>

      {/* MENU */}

      <p className="text-xs uppercase tracking-widest text-slate-500 mb-4 px-3">
        MAIN
      </p>

      <div className="flex-1 flex flex-col">
        <div className="flex-1 flex flex-col">
          {menuItems.map((item) => (
            <div key={item.name} className="mb-4">
              <NavLink to={item.path}>
                {({ isActive }) => {
                  const uploadWorkflowRoutes = [
                    "/upload",
                    "/analysis",
                    "/threat-details",
                  ];

                  const active =
                    isActive ||
                    (item.path === "/upload" &&
                      uploadWorkflowRoutes.includes(location.pathname));

                  return (
                    <div
                      className={`relative flex items-center gap-4 px-4 h-13 rounded-xl transition-all duration-200
                        ${
                          active
                            ? "bg-blue-600/15 border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.15)] text-white"
                            : "text-slate-300 hover:bg-slate-800 hover:translate-x-1"
                        }`}
                    >
                      {/* Active Bar */}
                      {active && (
                        <div className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-blue-500"></div>
                      )}

                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          active
                            ? "bg-blue-600 text-white"
                            : "bg-slate-800 text-slate-400"
                        }`}
                      >
                        {item.icon}
                      </div>

                      <span className="text-[15px] font-medium">
                        {item.name}
                      </span>
                    </div>
                  );
                }}
              </NavLink>
            </div>
          ))}
        </div>

        <div className="border-t border-slate-800 pt-5">
          <div className="bg-slate-800/50 rounded p-3 flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 shadow-lg shadow-blue-500/20 flex items-center justify-center text-white font-semibold">
              {initial}
            </div>

            <div className="flex-1">
              <h4 className="text-white font-medium">{username || "User"}</h4>

              <p className="text-slate-400 text-sm">SOC Analyst</p>
            </div>
          </div>
        </div>

        <div className="my-4 border-t border-slate-700" />

        <button
          onClick={handleLogout}
          className="
group
w-full
flex
items-center
justify-center
gap-2
rounded
py-3
bg-slate-800/70
border border-slate-700
hover:border-red-500/40
hover:bg-red-500/20
transition-all
duration-300
"
        >
          <LogOut size={18} className="group-hover:translate-x-1 transition" />
          Logout
        </button>
      </div>
    </div>
  );
}

export default Sidebar;

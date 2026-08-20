import Sidebar from "../components/layout/Sidebar";
import Navbar from "../components/layout/Navbar";

function MainLayout({ children }) {
  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden">

      {/* SIDEBAR */}
      <Sidebar />

      {/* MAIN AREA */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* NAVBAR */}
        <Navbar />

        {/* PAGE CONTENT */}
        <main className="flex-1 overflow-y-auto bg-slate-950 px-8 py-6">
          <div className="max-w-[1600px] mx-auto">
            {children}
          </div>
        </main>

      </div>
    </div>
  );
}

export default MainLayout;
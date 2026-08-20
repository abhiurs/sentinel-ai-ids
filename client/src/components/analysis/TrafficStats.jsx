function TrafficStats({ trafficStats }) {
  return (
    <div
      className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 mb-8"
      style={{ marginLeft: "10px", marginRight: "10px" }}
    >
      {trafficStats.map((item, index) => {
        const Icon = item.icon;

        return (
          <div
            key={index}
            className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-blue-500
hover:-translate-y-1
transition-all
duration-300 h-[100px]"
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="h-2"></div>
                <p
                  className="text-slate-400 text-xs uppercase tracking-wider font-semibold"
                  style={{ marginLeft: "10px" }}
                >
                  {item.title}
                </p>

                <p
                  className="text-slate-500 text-sm mt-2"
                  style={{ marginLeft: "10px" }}
                >
                  {item.description}
                </p>

                <h2
                  className="text-4xl font-extrabold tracking-tight mt-3"
                  style={{ marginLeft: "10px" }}
                >
                  {item.value}
                </h2>
              </div>

              <div
                className="w-14 h-14 relative top-5 rounded-xl bg-slate-800 flex items-center justify-center"
                style={{ marginRight: "5px" }}
              >
                <Icon className={item.color} size={28} />
              </div>

              {item.percentage !== undefined && (
                <div className="mt-5">
                  <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${item.color.replace(
                        "text",
                        "bg",
                      )}`}
                      style={{
                        width: `${item.percentage}%`,
                        transition: "width 1s ease-in-out",
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default TrafficStats;

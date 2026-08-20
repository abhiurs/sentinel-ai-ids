import ThreatChart from "../components/ThreatChart";

import {
  ShieldAlert,
  Globe,
  Activity,
  Radar,
  AlertTriangle,
  Brain,
  Server,
  ShieldCheck,
} from "lucide-react";

const getStoredAnalysis = () => {
  try {
    const stored = localStorage.getItem("analysisResult");

    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error("Failed to load threat intelligence analysis:", error);
    return {};
  }
};

function ThreatIntel() {
  const analysis = getStoredAnalysis();
  const hasAnalysis = Boolean(analysis && Object.keys(analysis).length > 0);
  console.log("Threat Intel Analysis:", analysis);
  console.log("Severity Breakdown:", analysis?.severityBreakdown);

  const attackCategories = analysis?.attackSummary
    ? Object.values(analysis?.attackSummary).filter((count) => count > 0).length
    : 0;

  const criticalThreats = analysis?.severityBreakdown?.critical || 0;

  const topAttack = analysis?.attackSummary
    ? Object.entries(analysis?.attackSummary)
        .filter(
          ([attack, count]) => attack.toLowerCase() !== "benign" && count > 0,
        )
        .sort((a, b) => b[1] - a[1])[0]
    : null;

  const aiThreatSummary = [
    {
      title: "Threat Correlation",
      value: (
        <>
          <div className="text-sm text-slate-500">Dominant Attack</div>

          <div className="text-3xl font-bold text-white mt-2">
            {topAttack ? topAttack[0] : "None"}
          </div>

          <div className="mt-8 text-sm text-slate-500">Detected Packets</div>

          <div className="text-2xl font-semibold text-blue-400 mt-2">
            {topAttack ? topAttack[1].toLocaleString() : 0}
          </div>
        </>
      ),
    },

    {
      title: "Risk Assessment",
      value: (
        <>
          <div className="text-sm text-slate-500">Threat Level</div>

          <div className="text-3xl font-bold text-white mt-2">
            {analysis?.severity || "No Analysis"}
          </div>

          <div className="mt-8 text-sm text-slate-500">Confidence</div>

          <div className="text-2xl font-semibold text-green-400 mt-2">
            {hasAnalysis ? `${analysis?.confidence ?? 0}%` : "No Data"}
          </div>
        </>
      ),
    },

    {
      title: "Recommended Action",
      value: (
        <>
          <ul className="space-y-4 text-slate-300">
            {!hasAnalysis && (
              <div className="text-slate-500 text-sm">
                Run an analysis to generate recommended security actions.
              </div>
            )}

            {analysis?.severity === "Critical" && (
              <>
                <li>✓ Isolate affected hosts</li>
                <li>✓ Block malicious traffic</li>
                <li>✓ Begin incident response</li>
              </>
            )}

            {analysis?.severity === "High" && (
              <>
                <li>✓ Investigate suspicious hosts</li>
                <li>✓ Apply firewall rules</li>
                <li>✓ Review IDS alerts</li>
              </>
            )}

            {analysis?.severity === "Medium" && (
              <>
                <li>✓ Monitor suspicious traffic</li>
                <li>✓ Verify network logs</li>
                <li>✓ Continue observation</li>
              </>
            )}

            {analysis?.severity === "Low" && (
              <>
                <li>✓ Continue monitoring</li>
                <li>✓ Archive analysis report</li>
                <li>✓ No immediate action</li>
              </>
            )}
          </ul>
        </>
      ),
    },
  ];

  const threatSummary = [
    {
      title: "Attack Categories",
      value: attackCategories,
      icon: Radar,
      color: "text-cyan-400",
    },
    {
      title: "Critical Threats",
      value: criticalThreats.toLocaleString(),
      icon: AlertTriangle,
      color: "text-red-400",
    },
    {
      title: "Overall Severity",
      value: analysis?.severity || "No Analysis",
      icon: ShieldAlert,
      color:
        analysis?.severity === "Critical"
          ? "text-red-400"
          : analysis?.severity === "High"
            ? "text-orange-400"
            : analysis?.severity === "Medium"
              ? "text-yellow-400"
              : "text-green-400",
    },
    {
      title: "Threat Confidence",
      value: `${analysis?.confidence || 0}%`,
      icon: Brain,
      color: "text-green-400",
    },
  ];

  const latestThreatIntel = analysis?.attackSummary
    ? Object.entries(analysis?.attackSummary)
        .filter(
          ([attack, count]) => count > 0 && attack.toLowerCase() !== "benign",
        )
        .sort((a, b) => b[1] - a[1])
        .slice(0, 6)
        .map(([attack, count]) => {
          let severity = "Low";

          if (attack.includes("DDoS") || attack.includes("DoS Hulk")) {
            severity = "Critical";
          } else if (
            attack.includes("FTP") ||
            attack.includes("SSH") ||
            attack.includes("Brute")
          ) {
            severity = "High";
          } else if (
            attack.includes("Port") ||
            attack.includes("GoldenEye") ||
            attack.includes("Slow")
          ) {
            severity = "Medium";
          }

          return {
            title: attack,

            type:
              attack.includes("DoS") || attack.includes("DDoS")
                ? "Denial of Service"
                : attack.includes("Port")
                  ? "Reconnaissance"
                  : attack.includes("FTP")
                    ? "Credential Attack"
                    : attack.includes("SSH")
                      ? "Remote Access Attack"
                      : attack.includes("Bot")
                        ? "Botnet Activity"
                        : "Network Intrusion",

            cve: `Detected Packets:${count.toLocaleString()}`,

            severity,
          };
        })
    : [];

  const liveFeed = analysis?.attackSummary
    ? Object.entries(analysis?.attackSummary)
        .filter(
          ([attack, count]) => attack.toLowerCase() !== "benign" && count > 0,
        )
        .sort((a, b) => b[1] - a[1])
        .slice(0, 6)
        .map(([attack], index) => {
          const time = new Date(Date.now() - index * 60000).toLocaleTimeString(
            [],
            {
              hour: "2-digit",
              minute: "2-digit",
            },
          );

          let action = "detected";

          if (attack.includes("DoS") || attack.includes("DDoS")) {
            action = "traffic blocked";
          } else if (attack.includes("Port")) {
            action = "scanning detected";
          } else if (attack.includes("FTP") || attack.includes("SSH")) {
            action = "authentication attack detected";
          } else if (attack.includes("Bot")) {
            action = "botnet activity detected";
          }

          return {
            time,
            message: `${attack} ${action}`,
          };
        })
    : [];

  const iocData = hasAnalysis
    ? [
        {
          type: "IP",
          indicator: "185.220.101.45",
          confidence: "High",
          source: "AbuseIPDB",
        },
        {
          type: "Domain",
          indicator: "secure-login-update.com",
          confidence: "Medium",
          source: "OpenPhish",
        },
        {
          type: "Hash",
          indicator: "9f5c2d7ab81e...",
          confidence: "High",
          source: "VirusTotal",
        },
        {
          type: "IP",
          indicator: "91.214.124.18",
          confidence: "Critical",
          source: "AlienVault OTX",
        },
        {
          type: "URL",
          indicator: "hxxps://verify-account-now.com",
          confidence: "Medium",
          source: "URLhaus",
        },
      ]
    : [];

  const intelligenceSources = [
    {
      name: "VirusTotal",
      description: "Malware & file reputation",
      status: "Active",
    },
    {
      name: "AbuseIPDB",
      description: "Malicious IP intelligence",
      status: "Active",
    },
    {
      name: "AlienVault OTX",
      description: "Open threat exchange",
      status: "Active",
    },
    {
      name: "MITRE ATT&CK",
      description: "Threat techniques framework",
      status: "Synced",
    },
    {
      name: "CISA KEV",
      description: "Known exploited vulnerabilities",
      status: "Updated",
    },
    {
      name: "OpenPhish",
      description: "Phishing intelligence",
      status: "Active",
    },
  ];

  return (
    <div className="min-h-screen bg-[#020617] text-white p-6">
      <div className="h-2"></div>
      {/* HEADER */}
      <div className="mb-8" style={{ marginLeft: "10px" }}>
        <h1 className="text-5xl font-bold">Threat Intelligence Center</h1>

        <p className="text-slate-400 text-xl mt-3">
          Real-time cyber threat monitoring and AI-powered intelligence analysis
        </p>
      </div>
      <br />
      {/* THREAT INTELLIGENCE SUMMARY */}

      <div
        className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 mb-8"
        style={{ marginLeft: "10px", marginRight: "10px" }}
      >
        {threatSummary.map((item, index) => {
          const Icon = item.icon;

          return (
            <div
              key={index}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400" style={{ marginLeft: "10px" }}>
                    {item.title}
                  </p>

                  <h2
                    className={`text-4xl font-bold mt-2 ${item.color}`}
                    style={{ marginLeft: "10px" }}
                  >
                    {item.value}
                  </h2>
                </div>

                <Icon
                  className={item.color}
                  size={36}
                  style={{ marginRight: "10px" }}
                />
              </div>
            </div>
          );
        })}
      </div>
      <br />
      {/* MAIN GRID */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* LEFT SIDE */}
        <div className="xl:col-span-2 flex flex-col gap-6">
          {/* LATEST THREAT INTELLIGENCE */}

          <div
            className="bg-slate-900 border border-slate-800 rounded-2xl p-8 h-[420px]"
            style={{ marginLeft: "10px" }}
          >
            <div className="h-2"></div>
            <div
              className="flex items-center gap-3 mb-6"
              style={{ marginLeft: "10px" }}
            >
              <Radar className="text-cyan-400" size={30} />

              <h2 className="text-3xl font-bold">Latest Threat Intelligence</h2>
            </div>
            <div className="h-2"></div>
            <div className="flex flex-col gap-3" style={{ marginLeft: "10px" }}>
              {latestThreatIntel.length === 0 ? (
                <div className="flex items-center justify-center h-[280px]">
                  <p className="text-slate-500 text-sm">
                    No threat intelligence available. Run an analysis to
                    populate this section.
                  </p>
                </div>
              ) : (
                latestThreatIntel.map((threat, index) => (
                  <div
                    key={index}
                    className="bg-slate-800 border border-slate-700 rounded-xl p-5 flex justify-between items-center"
                  >
                    <div>
                      <h3
                        className="text-xl font-semibold"
                        style={{ marginLeft: "10px" }}
                      >
                        {threat.title}
                      </h3>

                      <p
                        className="text-slate-400 mt-2"
                        style={{ marginLeft: "10px" }}
                      >
                        {threat.category}
                      </p>

                      <p
                        className="text-blue-400 text-sm mt-1"
                        style={{ marginLeft: "10px" }}
                      >
                        {threat.cve}
                      </p>
                    </div>

                    <span
                      className={`px-4 py-2 rounded-full w-[70px] font-semibold text-center ${
                        threat.severity === "Critical"
                          ? "bg-red-500/20 text-red-400"
                          : threat.severity === "High"
                            ? "bg-orange-500/20 text-orange-400"
                            : "bg-yellow-500/20 text-yellow-400"
                      }`}
                      style={{ marginRight: "10px" }}
                    >
                      {threat.severity}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* AI THREAT INTELLIGENCE SUMMARY */}

          <div
            className="bg-slate-900 border border-slate-800 rounded-2xl p-8 h-[340px]"
            style={{ marginLeft: "10px" }}
          >
            <div className="h-2"></div>
            <div
              className="flex items-center gap-3 mb-6"
              style={{ marginLeft: "10px" }}
            >
              <Brain className="text-blue-400" size={30} />

              <h2 className="text-3xl font-bold">
                AI Threat Intelligence Summary
              </h2>
            </div>
            <div className="h-4"></div>
            <div
              className="grid grid-cols-1 md:grid-cols-3 gap-5 min-h-[180px]"
              style={{ marginLeft: "10px", marginRight: "10px" }}
            >
              {aiThreatSummary.map((item, index) => (
                <div
                  key={index}
                  className="bg-slate-800 border border-slate-700 rounded-xl p-5 hover:border-slate-600 transition-all duration-300 min-h-[210px]"
                >
                  <h3
                    className="text-lg font-semibold text-white"
                    style={{ marginLeft: "10px" }}
                  >
                    {item.title}
                  </h3>
                  <div className="border-b border-slate-700 my-3"></div>
                  <div
                    className="text-white text-lg leading-7 font-medium"
                    style={{ marginLeft: "10px" }}
                  >
                    {item.value}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="flex flex-col gap-6">
          {/* THREAT INTELLIGENCE SOURCES */}

          <div
            className="bg-slate-900 border border-slate-800 rounded-2xl p-6 h-[420px]"
            style={{ marginLeft: "10px", marginRight: "10px" }}
          >
            <div className="h-2"></div>
            <div
              className="flex items-center gap-3 mb-5"
              style={{ marginLeft: "10px" }}
            >
              <ShieldAlert className="text-cyan-400" />

              <h2 className="text-2xl font-bold">
                Threat Intelligence Sources
              </h2>
            </div>
            <div className="h-2"></div>
            <div className="flex flex-col gap-3" style={{ marginLeft: "10px" }}>
              {intelligenceSources.map((source, index) => (
                <div
                  key={index}
                  className="bg-slate-800 border border-slate-700 rounded-xl p-4"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h3
                        className="font-semibold text-lg"
                        style={{ marginLeft: "10px" }}
                      >
                        {source.name}
                      </h3>

                      <p
                        className="text-slate-400 text-sm mt-1"
                        style={{ marginLeft: "10px" }}
                      >
                        {source.description}
                      </p>
                    </div>

                    <span
                      className={`px-3 py-1 rounded-full text-sm ${
                        source.status === "Updated"
                          ? "bg-yellow-500/20 text-yellow-400"
                          : source.status === "Synced"
                            ? "bg-blue-500/20 text-blue-400"
                            : "bg-green-500/20 text-green-400"
                      }`}
                      style={{ marginRight: "10px" }}
                    >
                      {source.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* LIVE FEED */}
          <div
            className="bg-slate-900 border border-slate-800 rounded-2xl p-6 h-[340px]"
            style={{ marginLeft: "10px", marginRight: "10px" }}
          >
            <div className="h-2"></div>
            <div
              className="flex items-center gap-3 mb-5"
              style={{ marginLeft: "10px" }}
            >
              <Activity className="text-cyan-400" />

              <h2 className="text-2xl font-bold">
                Real-Time Threat Intelligence Feed
              </h2>
            </div>
            <div className="h-2"></div>
            <div
              className="flex flex-col gap-3 overflow-y-auto pr-1"
              style={{
                marginLeft: "10px",
                maxHeight: "240px",
              }}
            >
              {liveFeed.length === 0 ? (
                <div className="flex items-center justify-center h-[180px]">
                  <p className="text-slate-500 text-sm">
                    No live threat events available.
                  </p>
                </div>
              ) : (
                liveFeed.map((event, index) => (
                  <div
                    key={index}
                    className="bg-slate-800 rounded-xl p-4 border border-slate-700"
                  >
                    <div className="text-xs text-slate-400 mb-1">
                      {event.time}
                    </div>

                    <div className="text-sm text-white">{event.message}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
      <br />
      <div
        className="grid grid-cols-1 xl:grid-cols-12 gap-6"
        style={{ marginLeft: "10px", marginRight: "10px" }}
      >
        {/* LEFT - Global Threat Landscape */}
        <div className="xl:col-span-7">
          <ThreatChart />
        </div>

        {/* RIGHT - Indicators of Compromise */}
        <div className="xl:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-6 h-[220px]">
          <div className="h-2"></div>
          <div
            className="flex items-center gap-3 mb-5"
            style={{ marginLeft: "10px" }}
          >
            <Server className="text-red-400" />

            <h2 className="text-2xl font-bold">Indicators of Compromise</h2>
          </div>
          <div className="h-2"></div>
          <div
            className="overflow-x-auto"
            style={{ marginLeft: "10px", marginRight: "10px" }}
          >
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700 text-slate-400">
                  <th className="text-left py-3">Type</th>

                  <th className="text-left py-3">Indicator</th>

                  <th className="text-left py-3">Confidence</th>

                  <th className="text-left py-3">Source</th>
                </tr>
              </thead>

              <tbody>
                {iocData.map((ioc, index) => (
                  <tr
                    key={index}
                    className="border-b border-slate-800 hover:bg-slate-800/40"
                  >
                    <td className="py-4 font-semibold">{ioc.type}</td>

                    <td className="font-mono text-sm">{ioc.indicator}</td>

                    <td>
                      <span
                        className={`px-3 py-1 rounded-full text-sm ${
                          ioc.confidence === "Critical"
                            ? "bg-red-500/20 text-red-400"
                            : ioc.confidence === "High"
                              ? "bg-orange-500/20 text-orange-400"
                              : "bg-yellow-500/20 text-yellow-400"
                        }`}
                      >
                        {ioc.confidence}
                      </span>
                    </td>

                    <td className="text-cyan-400">{ioc.source}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <br />
    </div>
  );
}

export default ThreatIntel;

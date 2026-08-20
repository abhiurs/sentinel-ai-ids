import React, { useEffect, useMemo, useRef, useState } from "react";
import LiveTrafficChart from "../components/LiveTrafficChart";
import { useSimulation } from "../simulation/SimulationEngine";
import IncidentResponse from "../components/IncidentResponse";
import ModeToggle from "../components/ModeToggle";
import { useSimulationMode } from "../context/SimulationContext";
import {
  startCapture,
  stopCapture,
  getStatus,
  getPackets,
  getDetections,
  getModel,
  setModel,
} from "../services/liveApi";

import {
  Activity,
  ShieldAlert,
  Cpu,
  Wifi,
  ShieldCheck,
  BrainCircuit,
} from "lucide-react";

const MODEL_OPTIONS = [
  "Auto",
  "Random Forest",
  "Extra Trees",
  "XGBoost",
  "Decision Tree",
  "KNN",
];

const getSeverity = (prediction) => {
  const value = String(prediction || "").toLowerCase();
  if (value === "benign" || value === "normal" || value === "normal traffic")
    return "Normal";
  if (
    [
      "ddos",
      "doS hulk",
      "goldeneye",
      "slowloris",
      "slowhttptest",
      "infiltration",
    ].some((x) => value.includes(x.toLowerCase()))
  )
    return "Critical";
  if (["bot", "patator", "brute", "sql", "xss"].some((x) => value.includes(x)))
    return "High";
  if (
    value.includes("portscan") ||
    value.includes("port scan") ||
    value.includes("probe")
  )
    return "Medium";
  return "Low";
};

const getSeverityClasses = (severity) => {
  if (severity === "Critical") return "bg-red-500/20 text-red-400";
  if (severity === "High") return "bg-orange-500/20 text-orange-400";
  if (severity === "Medium") return "bg-yellow-500/20 text-yellow-400";
  if (severity === "Normal") return "bg-green-500/20 text-green-400";
  return "bg-blue-500/20 text-blue-400";
};

/*
 * Build the Incident Response Center from the latest REAL live ML detection.
 *
 * Important:
 * The live backend currently provides detection data (prediction, confidence,
 * source/destination, protocol, packets, model, etc.), but it does not expose
 * actual SOC containment actions. Therefore the playbook below represents a
 * data-driven response assessment, not a claim that the application has
 * blocked or contained the traffic.
 */
const buildLiveIncident = (latestDetection, detections) => {
  if (!latestDetection) {
    return {
      attack: "Waiting for traffic",
      severity: "Normal",
      phase: "Monitoring",
      status: "Waiting",
      mitreId: "—",
      tactic: "Monitoring",
      progress: 0,
      remainingTime: "—",
      steps: [
        { title: "Monitor traffic", completed: false, active: true },
        { title: "Await ML detection", completed: false, active: false },
        { title: "Review flow", completed: false, active: false },
        { title: "Check system health", completed: false, active: false },
        { title: "Continue monitoring", completed: false, active: false },
      ],
    };
  }

  const prediction = String(latestDetection.prediction || "Unknown");
  const value = prediction.toLowerCase();
  const severity = getSeverity(prediction);
  const isBenign = severity === "Normal";

  if (isBenign) {
    return {
      attack: "Benign Traffic",
      severity: "Normal",
      phase: "Monitoring",
      status: "Monitoring",
      mitreId: "—",
      tactic: "Monitoring",
      progress: 100,
      remainingTime: 0,
      steps: [
        { title: "Monitor traffic", completed: true, active: false },
        { title: "Validate ML result", completed: true, active: false },
        { title: "Review flow", completed: true, active: false },
        { title: "Check system health", completed: true, active: false },
        { title: "Continue monitoring", completed: true, active: false },
      ],
    };
  }

  let attack = prediction;
  let mitreId = "—";
  let tactic = "Unknown";
  let phase = "Detection";
  let status = "Detected";

  if (
    value.includes("ddos") ||
    value.includes("dos hulk") ||
    value.includes("goldeneye") ||
    value.includes("slowloris") ||
    value.includes("slowhttptest")
  ) {
    attack = "DDoS / DoS";
    mitreId = "T1498";
    tactic = "Impact";
    phase = "Impact";
  } else if (value.includes("portscan") || value.includes("port scan")) {
    attack = "Port Scan";
    mitreId = "T1046";
    tactic = "Discovery";
    phase = "Discovery";
  } else if (value.includes("bot")) {
    attack = "Bot Activity";
    mitreId = "T1583";
    tactic = "Command & Control";
    phase = "Command & Control";
  } else if (value.includes("brute") || value.includes("patator")) {
    attack = "Brute Force";
    mitreId = "T1110";
    tactic = "Credential Access";
    phase = "Credential Access";
  } else if (value.includes("infiltration")) {
    attack = "Infiltration";
    mitreId = "T1190";
    tactic = "Initial Access";
    phase = "Investigation";
  }

  /*
   * Repeated detections of the same class indicate that the suspicious
   * activity is continuing. This changes the displayed response stage.
   */
  const samePredictionCount = detections.filter(
    (item) => String(item.prediction || "").toLowerCase() === value,
  ).length;

  let progress = 35;
  let activeIndex = 1;

  if (samePredictionCount >= 5) {
    progress = 75;
    activeIndex = 3;
    status = "Responding";
  } else if (samePredictionCount >= 3) {
    progress = 55;
    activeIndex = 2;
    status = "Investigating";
  }

  const stepTitles = [
    "Monitor traffic",
    "Validate ML detection",
    "Investigate flow",
    "Review containment",
    "Continue monitoring",
  ];

  return {
    attack,
    severity,
    phase,
    status,
    mitreId,
    tactic,
    progress,
    remainingTime: Math.max(1, 10 - samePredictionCount),
    steps: stepTitles.map((title, index) => ({
      title,
      completed: index < activeIndex,
      active: index === activeIndex,
    })),
  };
};

function LiveMonitoring() {
  const simulation = useSimulation();
  const { mode } = useSimulationMode();
  const [livePackets, setLivePackets] = useState([]);
  const [liveDetections, setLiveDetections] = useState([]);
  const [selectedModel, setSelectedModel] = useState("Auto");
  const [modelUsed, setModelUsed] = useState("XGBoost");
  const [modelLoading, setModelLoading] = useState(false);
  const [liveStatus, setLiveStatus] = useState({
    captured_packets: 0,
    detections: 0,
    dataset: "CICIDS2017",
    features: 77,
  });
  const [liveChartHistory, setLiveChartHistory] = useState([]);
  const latestLiveDetection = liveDetections[0] || null;

  const liveIncident = useMemo(
    () => buildLiveIncident(latestLiveDetection, liveDetections),
    [latestLiveDetection, liveDetections],
  );

  const liveNetworkEvents = useMemo(() => {
    return livePackets.map((packet) => ({
      time: packet.time || "--:--:--",
      protocol: packet.protocol || "Unknown",
      src: packet.src || "Unknown",
      dst: packet.dst || "Unknown",
      traffic:
        packet.application ||
        packet.info ||
        `${packet.protocol || "Unknown"} Traffic`,
      status: "Captured",
    }));
  }, [livePackets]);

  // ============================================================
  // 🔵 CHANGED: REAL LIVE CHART DATA
  // ============================================================
  // The API returns a rolling packet window (currently up to 100
  // packets). We must NOT plot that rolling "100" as the traffic
  // rate. Instead, compare the current poll with the previous poll
  // and plot only packets/detections newly observed during that
  // interval.
  const previousLivePacketsRef = useRef(new Set());
  const previousLiveDetectionsRef = useRef(new Set());
  const lastLiveSampleTimeRef = useRef(null);

  const getPacketKey = (packet) =>
    [
      packet.time,
      packet.src,
      packet.dst,
      packet.src_port,
      packet.dst_port,
      packet.protocol,
      packet.length,
      packet.payload_length,
    ].join("|");

  const getDetectionKey = (detection) =>
    [
      detection.time,
      detection.source,
      detection.destination,
      detection.src_port,
      detection.dst_port,
      detection.prediction,
      detection.bytes,
    ].join("|");

  const currentLiveChartPoint = useMemo(() => {
    if (mode !== "live" || !livePackets.length) return null;

    const now = Date.now();
    const previousTime = lastLiveSampleTimeRef.current;

    const elapsedSeconds = previousTime
      ? Math.max((now - previousTime) / 1000, 0.1)
      : 1;

    lastLiveSampleTimeRef.current = now;

    // 🔵 CHANGED: find only packets that appeared since the last poll.
    const currentPacketKeys = new Set(livePackets.map(getPacketKey));

    const newPackets = livePackets.filter(
      (packet) => !previousLivePacketsRef.current.has(getPacketKey(packet)),
    );

    previousLivePacketsRef.current = currentPacketKeys;

    // 🔵 CHANGED: find only new ML detections since the last poll.
    const currentDetectionKeys = new Set(liveDetections.map(getDetectionKey));

    const newDetections = liveDetections.filter(
      (detection) =>
        !previousLiveDetectionsRef.current.has(getDetectionKey(detection)),
    );

    previousLiveDetectionsRef.current = currentDetectionKeys;

    const benign = newDetections.filter((detection) => {
      const prediction = String(detection.prediction || "").toLowerCase();

      return (
        prediction === "benign" ||
        prediction === "normal" ||
        prediction === "normal traffic"
      );
    }).length;

    const malicious = newDetections.filter((detection) => {
      const prediction = String(detection.prediction || "").toLowerCase();

      return (
        prediction &&
        prediction !== "benign" &&
        prediction !== "normal" &&
        prediction !== "normal traffic"
      );
    }).length;

    // 🔵 CHANGED: calculate bytes only from newly observed packets.
    const bytes = newPackets.reduce(
      (sum, packet) =>
        sum +
        Number(packet.length || packet.payload_length || packet.bytes || 0),
      0,
    );

    // This is the number of packets observed during THIS
    // polling interval, not the rolling API count of 100.
    const packetsPerInterval = newPackets.length;

    // 🔵 CHANGED: calculate actual observed throughput for
    // this polling interval.
    const throughputMbps = (bytes * 8) / elapsedSeconds / 1000000;

    return {
      time:
        livePackets[livePackets.length - 1]?.time ||
        new Date().toLocaleTimeString(),

      packets: packetsPerInterval,
      benign,
      malicious,
      bytes,

      throughput: Number(throughputMbps.toFixed(2)),
    };
  }, [mode, livePackets, liveDetections]);

  // 🔵 CHANGED: maintain a rolling 30-point live chart.
  useEffect(() => {
    if (mode !== "live") {
      setLiveChartHistory([]);

      previousLivePacketsRef.current = new Set();

      previousLiveDetectionsRef.current = new Set();

      lastLiveSampleTimeRef.current = null;

      return;
    }

    if (!currentLiveChartPoint) return;

    setLiveChartHistory((previous) =>
      [...previous, currentLiveChartPoint].slice(-30),
    );
  }, [mode, currentLiveChartPoint]);

  // 🔵 CHANGED: show the latest calculated real throughput.
  const liveThroughputMbps = useMemo(() => {
    if (!liveChartHistory.length) return 0;

    const latest = liveChartHistory[liveChartHistory.length - 1];

    return Number(latest.throughput || 0);
  }, [liveChartHistory]);

  const chartData = mode === "live" ? liveChartHistory : simulation.chart;

  const monitoringSummary = useMemo(() => {
    if (mode === "live") {
      return [
        {
          title: "Packets Captured",
          value: Number(liveStatus.captured_packets || 0).toLocaleString(),
          icon: Activity,
          color: "text-blue-400",
        },
        {
          title: "ML Detections",
          value: Number(
            liveStatus.detections || liveDetections.length || 0,
          ).toLocaleString(),
          icon: ShieldAlert,
          color: "text-red-400",
        },
        {
          title: "Model Used",
          value: modelUsed,
          icon: Cpu,
          color: "text-cyan-400",
        },
        {
          title: "Monitoring Status",
          value: "ACTIVE",
          icon: ShieldCheck,
          color: "text-emerald-400",
        },
      ];
    }
    if (!simulation.traffic) return [];
    return [
      {
        title: "Packets Captured",
        value: simulation.traffic.packetsPerSecond.toLocaleString(),
        icon: Activity,
        color: "text-blue-400",
      },
      {
        title: "Threat Alerts",
        value: simulation.traffic.maliciousPackets.toLocaleString(),
        icon: ShieldAlert,
        color: "text-red-400",
      },
      {
        title: "Network Throughput",
        value: `${simulation.traffic.throughput} Mbps`,
        icon: Wifi,
        color: "text-green-400",
      },
      {
        title: "Monitoring Status",
        value: "ACTIVE",
        icon: ShieldCheck,
        color: "text-emerald-400",
      },
    ];
  }, [mode, simulation.traffic, liveStatus, liveDetections.length, modelUsed]);

  const aiEngine = useMemo(() => {
    if (mode === "live") {
      return [
        { title: "Model Used", value: modelUsed, color: "text-cyan-400" },
        { title: "Dataset", value: "CICIDS2017", color: "text-blue-400" },
        { title: "Features", value: "77", color: "text-purple-400" },
        {
          title: "Latest Prediction",
          value: latestLiveDetection?.prediction || "Waiting...",
          color:
            latestLiveDetection &&
            getSeverity(latestLiveDetection.prediction) !== "Normal"
              ? "text-red-400"
              : "text-green-400",
        },
        {
          title: "Latest Confidence",
          value: latestLiveDetection
            ? `${(Number(latestLiveDetection.confidence || 0) * 100).toFixed(2)}%`
            : "Waiting...",
          color: "text-purple-400",
        },
      ];
    }
    return simulation.ai
      ? [
          {
            title: "Detection Model",
            value: simulation.ai.model,
            color: "text-cyan-400",
          },
          {
            title: "Detection Speed",
            value: `${simulation.ai.detectionSpeed} sec`,
            color: "text-green-400",
          },
          {
            title: "Packets / Sec",
            value: simulation.ai.packetsPerSecond.toLocaleString(),
            color: "text-blue-400",
          },
          {
            title: "Detection Confidence",
            value: `${simulation.ai.confidence}%`,
            color: "text-purple-400",
          },
          {
            title: "Engine Status",
            value: simulation.ai.status,
            color: "text-emerald-400",
          },
        ]
      : [];
  }, [mode, simulation.ai, modelUsed, latestLiveDetection]);

  const systemHealth = simulation.health
    ? [
        {
          title: "Packet Capture",
          value:
            mode === "live"
              ? `${liveStatus.captured_packets > 0 ? "ACTIVE" : "READY"} • ${liveStatus.captured_packets.toLocaleString()} packets`
              : `${simulation.health.packetCapture.status} • ${simulation.health.packetCapture.uptime}`,
        },
        {
          title: "AI Detection Engine",
          value:
            mode === "live"
              ? `${liveStatus.detections > 0 ? "ACTIVE" : "READY"} • ${modelUsed}`
              : `${simulation.health.aiEngine.status} • ${simulation.health.aiEngine.memory} MB`,
        },
        {
          title: "Firewall",
          value: `${simulation.health.firewall.rules} Rules`,
        },
        {
          title: "Database",
          value: `${simulation.health.database.latency} ms`,
        },
        {
          title: "API Server",
          value: `${simulation.health.apiServer.latency} ms`,
        },
      ]
    : [];

  useEffect(() => {
    if (mode !== "live") return;
    let active = true;
    const pollLiveData = async () => {
      try {
        const [
          packetResponse,
          detectionResponse,
          statusResponse,
          modelResponse,
        ] = await Promise.all([
          getPackets(),
          getDetections(),
          getStatus(),
          getModel(),
        ]);
        if (!active) return;
        setLivePackets(packetResponse?.packets || []);
        setLiveDetections(detectionResponse?.detections || []);
        setLiveStatus({
          captured_packets: Number(statusResponse?.captured_packets || 0),
          detections: Number(statusResponse?.detections || 0),
          dataset: statusResponse?.dataset || "CICIDS2017",
          features: Number(statusResponse?.features || 77),
        });
        setSelectedModel(modelResponse?.selected_model || "Auto");
        setModelUsed(
          modelResponse?.model_used || statusResponse?.model_used || "XGBoost",
        );
      } catch (err) {
        console.error("Live monitoring polling error:", err);
      }
    };
    const initialize = async () => {
      try {
        await startCapture();
        await pollLiveData();
      } catch (err) {
        console.error("Failed to start live capture:", err);
      }
    };
    initialize();
    const interval = setInterval(pollLiveData, 1000);
    return () => {
      active = false;
      clearInterval(interval);
      stopCapture().catch((err) =>
        console.error("Failed to stop live capture:", err),
      );
    };
  }, [mode]);

  const handleModelChange = async (event) => {
    const newModel = event.target.value;
    setModelLoading(true);
    try {
      const response = await setModel(newModel);
      if (response?.success) {
        setSelectedModel(response.selected_model || newModel);
        setModelUsed(response.model_used || "XGBoost");
      } else {
        console.error(
          "Model selection failed:",
          response?.message || "Unknown error",
        );
      }
    } catch (err) {
      console.error("Failed to change detection model:", err);
    } finally {
      setModelLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen bg-[#020617] text-white p-6"
      style={{ marginLeft: "10px" }}
    >
      {/* HEADER */}
      <div className="h-2"></div>
      <div className="mb-8">
        <div>
          <h1 className="text-5xl font-bold">Live Security Monitoring</h1>

          <p className="text-slate-400 text-xl mt-2">
            {mode === "demo"
              ? "Enterprise Network Simulation"
              : "Live Packet Capture"}
          </p>
        </div>
        <div className="h-2"></div>
        <ModeToggle />
      </div>
      <div className="h-2"></div>
      {mode === "demo" ? (
        <div className="mb-6 rounded-xl border border-blue-500/30 bg-blue-500/10 p-4">
          <p
            className="text-blue-300 font-semibold"
            style={{ marginLeft: "10px" }}
          >
            🖥️ Simulation Mode
          </p>

          <p
            className="text-slate-300 text-sm mt-1"
            style={{ marginLeft: "10px" }}
          >
            Simulating enterprise network traffic, attack scenarios, and
            AI-based intrusion detection for demonstration purposes.
          </p>
        </div>
      ) : (
        <div className="mb-6 rounded-xl border border-green-500/30 bg-green-500/10 p-4">
          <p
            className="text-green-300 font-semibold"
            style={{ marginLeft: "10px" }}
          >
            🌐 Live Capture Mode
          </p>

          <p
            className="text-slate-300 text-sm mt-1"
            style={{ marginLeft: "10px" }}
          >
            Ready to capture and analyze real network packets. Connect the live
            packet capture service to begin monitoring...
          </p>
        </div>
      )}
      <br />

      {/* MONITORING SUMMARY */}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
        {monitoringSummary.map((item, index) => {
          const Icon = item.icon;

          return (
            <div
              key={index}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-6"
              style={{ marginLeft: "10px", marginRight: "10px" }}
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
                  size={34}
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
          {/* LIVE NETWORK TRAFFIC */}

          <LiveTrafficChart
            chartData={chartData}
            throughput={
              mode === "live"
                ? liveThroughputMbps
                : simulation.traffic?.throughput || 0
            }
            isLive={mode === "live"}
          />

          {/* LIVE LOGS */}

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 h-[560px]">
            <div className="h-2"></div>
            <div
              className="flex items-center gap-3 mb-6"
              style={{ marginLeft: "10px" }}
            >
              <Activity className="text-blue-400" />

              <h2 className="text-3xl font-bold">Real-Time Attack Logs</h2>
            </div>
            <div className="h-2"></div>
            <div
              className="space-y-4 max-h-[480px] overflow-y-auto flex flex-col gap-3"
              style={{ marginLeft: "10px" }}
            >
              {(mode === "demo"
                ? simulation.logs
                : liveDetections.map((detection) => ({
                    attack: detection.prediction || "Unknown",
                    message: `${detection.source || "Unknown"} → ${detection.destination || "Unknown"}`,
                    severity: getSeverity(detection.prediction),
                    status:
                      getSeverity(detection.prediction) === "Normal"
                        ? "Normal"
                        : "Detected",
                    time: detection.time || "--:--:--",
                  }))
              ).map((log, index) => (
                <div
                  key={index}
                  className="bg-slate-800 rounded-xl p-4 border border-slate-700"
                >
                  <div
                    className="flex justify-between items-center"
                    style={{ marginLeft: "10px", marginRight: "10px" }}
                  >
                    <div>
                      <p className="font-semibold text-white">{log.attack}</p>

                      <p className="text-sm text-slate-400 mt-1">
                        {log.message}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-blue-400">{log.time}</p>

                      <p
                        className={`font-semibold mt-1 ${
                          log.severity === "Critical"
                            ? "text-red-400"
                            : log.severity === "High"
                              ? "text-orange-400"
                              : log.severity === "Medium"
                                ? "text-yellow-400"
                                : "text-blue-400"
                        }`}
                      >
                        {log.severity}
                      </p>

                      <p
                        className={`font-semibold ${
                          log.status === "Resolved"
                            ? "text-green-400"
                            : "text-yellow-400"
                        }`}
                      >
                        {log.status}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT SIDE */}

        <div className="flex flex-col gap-6">
          {/* AI DETECTION ENGINE */}

          <div
            className="bg-slate-900 border border-slate-800 rounded-2xl h-[450px] p-6"
            style={{ marginRight: "10px" }}
          >
            <div className="h-2"></div>

            <div
              className="flex items-start gap-3 mb-5"
              style={{ marginLeft: "10px" }}
            >
              <BrainCircuit className="text-cyan-400 mt-1" />

              <div>
                <h2 className="text-2xl font-bold">AI Detection Engine</h2>
                <p className="text-sm text-slate-500 mt-1">
                  {mode === "demo"
                    ? "Simulated ML detection"
                    : "Real-time ML detection"}
                </p>
              </div>
            </div>
            <div className="h-2"></div>
            <div
              className="flex flex-col gap-4"
              style={{ marginLeft: "10px", marginRight: "10px" }}
            >
              {mode === "demo" ? (
                <>
                  {/* DEMO: DETECTION CONFIGURATION */}
                  <div className="rounded-xl border border-cyan-500/20 bg-slate-800/80 p-4 h-[160px]">
                    <div className="h-2"></div>
                    <div
                      className="flex items-center gap-2 mb-4"
                      style={{ marginLeft: "10px" }}
                    >
                      <Cpu size={17} className="text-cyan-400" />
                      <div>
                        <h3 className="text-lg font-semibold text-slate-200">
                          Detection Configuration
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                          ML pipeline configuration for simulated traffic
                        </p>
                      </div>
                    </div>
                    <div className="h-2"></div>
                    <div
                      className="grid grid-cols-2 gap-3"
                      style={{ marginLeft: "10px", marginRight: "10px" }}
                    >
                      <div className="rounded-lg bg-slate-900/80 border border-slate-700 p-3">
                        <p
                          className="text-xs text-slate-500"
                          style={{ marginLeft: "10px" }}
                        >
                          Detection Model
                        </p>
                        <p
                          className="text-sm font-semibold text-cyan-400 mt-1 truncate"
                          style={{ marginLeft: "10px" }}
                        >
                          {simulation.ai?.model || "Random Forest"}
                        </p>
                      </div>

                      <div className="rounded-lg bg-slate-900/80 border border-slate-700 p-3">
                        <p
                          className="text-xs text-slate-500"
                          style={{ marginLeft: "10px" }}
                        >
                          Dataset
                        </p>
                        <p
                          className="text-sm font-semibold text-blue-400 mt-1"
                          style={{ marginLeft: "10px" }}
                        >
                          CICIDS2017
                        </p>
                      </div>

                      <div className="rounded-lg bg-slate-900/80 border border-slate-700 p-3">
                        <p
                          className="text-xs text-slate-500"
                          style={{ marginLeft: "10px" }}
                        >
                          Feature Set
                        </p>
                        <p
                          className="text-sm font-semibold text-purple-400 mt-1"
                          style={{ marginLeft: "10px" }}
                        >
                          77 Features
                        </p>
                      </div>

                      <div className="rounded-lg bg-slate-900/80 border border-slate-700 p-3">
                        <p
                          className="text-xs text-slate-500"
                          style={{ marginLeft: "10px" }}
                        >
                          Classification
                        </p>
                        <p
                          className="text-sm font-semibold text-emerald-400 mt-1"
                          style={{ marginLeft: "10px" }}
                        >
                          Multi-Class
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* DEMO: SIMULATION STATUS */}
                  <div className="rounded-xl border border-emerald-500/20 bg-slate-800/80 p-4 h-[160px]">
                    <div className="h-2"></div>
                    <div
                      className="flex items-center justify-between mb-4"
                      style={{ marginLeft: "10px" }}
                    >
                      <div>
                        <h3 className="text-lg font-semibold text-slate-200">
                          Simulation Status
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Current state of the simulated detection engine
                        </p>
                      </div>

                      <span
                        className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 text-xs font-semibold text-emerald-400 w-[80px] justify-center"
                        style={{ marginRight: "10px" }}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                        ACTIVE
                      </span>
                    </div>

                    <div
                      className="grid grid-cols-2 gap-3"
                      style={{ marginLeft: "10px", marginRight: "10px" }}
                    >
                      <div className="rounded-lg bg-slate-900/80 border border-slate-700 p-3">
                        <p
                          className="text-xs text-slate-500"
                          style={{ marginLeft: "10px" }}
                        >
                          Detection Speed
                        </p>
                        <p
                          className="text-sm font-semibold text-green-400 mt-1"
                          style={{ marginLeft: "10px" }}
                        >
                          {simulation.ai?.detectionSpeed ?? "--"} sec
                        </p>
                      </div>

                      <div className="rounded-lg bg-slate-900/80 border border-slate-700 p-3">
                        <p
                          className="text-xs text-slate-500"
                          style={{ marginLeft: "10px" }}
                        >
                          Packets / Sec
                        </p>
                        <p
                          className="text-sm font-semibold text-blue-400 mt-1"
                          style={{ marginLeft: "10px" }}
                        >
                          {Number(
                            simulation.ai?.packetsPerSecond || 0,
                          ).toLocaleString()}
                        </p>
                      </div>

                      <div className="rounded-lg bg-slate-900/80 border border-slate-700 p-3">
                        <p
                          className="text-xs text-slate-500"
                          style={{ marginLeft: "10px" }}
                        >
                          Detection Confidence
                        </p>
                        <p
                          className="text-sm font-semibold text-purple-400 mt-1"
                          style={{ marginLeft: "10px" }}
                        >
                          {simulation.ai?.confidence ?? "--"}%
                        </p>
                      </div>

                      <div className="rounded-lg bg-slate-900/80 border border-slate-700 p-3">
                        <p
                          className="text-xs text-slate-500"
                          style={{ marginLeft: "10px" }}
                        >
                          Engine Status
                        </p>
                        <p
                          className="text-sm font-semibold text-emerald-400 mt-1"
                          style={{ marginLeft: "10px" }}
                        >
                          {simulation.ai?.status || "Simulating"}
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* LIVE: MODEL SELECTION */}
                  <div className="bg-slate-800 border border-blue-500/30 rounded-xl p-4 h-[100px]">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <label
                          className="text-slate-400 text-sm"
                          style={{ marginLeft: "10px" }}
                        >
                          Detection Model
                        </label>
                        <p
                          className="text-xs text-slate-500 mt-1"
                          style={{ marginLeft: "10px" }}
                        >
                          Model used for new live-flow predictions
                        </p>
                      </div>

                      <Cpu
                        size={18}
                        className="text-blue-400"
                        style={{ marginRight: "10px" }}
                      />
                    </div>
                    <div className="h-1"></div>
                    <select
                      value={selectedModel}
                      onChange={handleModelChange}
                      disabled={modelLoading}
                      className="w-[410px] mt-3 rounded-lg bg-slate-900 border border-slate-700 text-white px-3 py-2 outline-none focus:border-blue-400 disabled:opacity-60"
                      style={{ marginLeft: "5px" }}
                    >
                      {MODEL_OPTIONS.map((model) => (
                        <option key={model} value={model}>
                          {model === "Auto" ? "Auto — Best Performing" : model}
                        </option>
                      ))}
                    </select>

                    <p
                      className="text-xs text-slate-500 mt-2"
                      style={{ marginLeft: "10px" }}
                    >
                      {modelLoading
                        ? "Updating model..."
                        : "Selected model is used for new live-flow predictions."}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {aiEngine.map((item, index) => (
                      <div
                        key={index}
                        className={`bg-slate-800 border border-slate-700 rounded-xl p-4 ${
                          index === 0 ? "col-span-2" : ""
                        }`}
                      >
                        <p
                          className="text-slate-400 text-sm"
                          style={{ marginLeft: "10px" }}
                        >
                          {item.title}
                        </p>
                        <h3
                          className={`text-xl font-semibold mt-1 ${item.color}`}
                          style={{ marginLeft: "10px" }}
                        >
                          {item.value}
                        </h3>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          <IncidentResponse
            incident={mode === "live" ? liveIncident : simulation.incident}
          />
        </div>
      </div>
      <br />
      {/* SYSTEM HEALTH */}

      <div
        className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mt-8 h-[120px]"
        style={{ marginRight: "10px" }}
      >
        <div className="h-2"></div>
        <h2 className="text-3xl font-bold mb-6" style={{ marginLeft: "10px" }}>
          System Health
        </h2>
        <div className="h-2"></div>
        <div
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-5"
          style={{ marginLeft: "10px", marginRight: "10px" }}
        >
          {systemHealth.map((item, index) => (
            <div
              key={index}
              className="bg-slate-800 border border-slate-700 rounded-xl p-5"
            >
              <p
                className="text-slate-400 text-sm"
                style={{ marginLeft: "10px" }}
              >
                {item.title}
              </p>

              <h3
                className="text-xl font-semibold mt-2 text-green-400"
                style={{ marginLeft: "10px" }}
              >
                ● {item.value}
              </h3>
            </div>
          ))}
        </div>
      </div>
      <br />
      {/* RECENT DETECTION ALERTS / NETWORK EVENTS */}

      <div
        className="bg-slate-900 border border-slate-800 rounded-2xl p-6 h-[560px]"
        style={{ marginRight: "10px" }}
      >
        <div className="h-2"></div>

        <div
          className="flex items-center justify-between mb-5"
          style={{ marginLeft: "10px", marginRight: "10px" }}
        >
          <div className="flex items-center gap-3">
            <ShieldAlert
              className={mode === "demo" ? "text-red-400" : "text-cyan-400"}
              size={28}
            />

            <h2 className="text-2xl font-bold">
              {mode === "demo"
                ? "Recent Detection Alerts"
                : "Recent ML Detection Alerts"}
            </h2>
          </div>

          <div
            className="flex items-center gap-2 text-green-400 text-sm font-medium"
            style={{ marginRight: "10px" }}
          >
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
            LIVE
          </div>
        </div>

        <div className="h-2"></div>

        <div
          className="rounded border border-slate-700 overflow-hidden h-[480px]"
          style={{ marginLeft: "10px", marginRight: "10px" }}
        >
          {mode === "demo" ? (
            <>
              {/* DEMO MODE TABLE */}

              <table className="w-full table-fixed">
                <thead className="bg-slate-800">
                  <tr className="text-slate-400">
                    <th className="text-left py-3 px-3 w-[22%]">Time</th>

                    <th className="text-left py-3 px-3 w-[22%]">Severity</th>

                    <th className="text-left py-3 px-3 w-[34%]">Attack</th>

                    <th className="text-left py-3 px-3 w-[22%]">Status</th>
                  </tr>
                </thead>
              </table>

              <div className="max-h-[450px] overflow-y-auto">
                <table className="w-full table-fixed">
                  <tbody>
                    {simulation.alerts.map((alert, index) => (
                      <tr
                        key={index}
                        className="border-b border-slate-800 hover:bg-slate-800 transition"
                      >
                        <td className="py-3 px-3 w-[22%]">{alert.time}</td>

                        <td className="py-3 px-3 w-[22%]">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              alert.severity === "Critical"
                                ? "bg-red-500/20 text-red-400"
                                : alert.severity === "High"
                                  ? "bg-orange-500/20 text-orange-400"
                                  : alert.severity === "Medium"
                                    ? "bg-yellow-500/20 text-yellow-400"
                                    : "bg-blue-500/20 text-blue-400"
                            }`}
                          >
                            {alert.severity}
                          </span>
                        </td>

                        <td className="py-3 px-3 w-[34%]">{alert.attack}</td>

                        <td className="py-3 px-3 w-[22%] text-green-400 font-medium">
                          {alert.status}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <>
              {/* LIVE MODE ML DETECTION TABLE */}
              <table className="w-full table-fixed">
                <thead className="bg-slate-800">
                  <tr className="text-slate-400">
                    <th className="text-left py-3 px-3 w-[13%]">Time</th>
                    <th className="text-left py-3 px-3 w-[18%]">Prediction</th>
                    <th className="text-left py-3 px-3 w-[12%]">Severity</th>
                    <th className="text-left py-3 px-3 w-[20%]">
                      Source → Destination
                    </th>
                    <th className="text-left py-3 px-3 w-[12%]">Model</th>
                    <th className="text-left py-3 px-3 w-[13%]">Confidence</th>
                    <th className="text-left py-3 px-3 w-[12%]">Status</th>
                  </tr>
                </thead>
              </table>
              <div className="max-h-[450px] overflow-y-auto">
                <table className="w-full table-fixed">
                  <tbody>
                    {liveDetections.length > 0 ? (
                      liveDetections.map((detection, index) => {
                        const severity = getSeverity(detection.prediction);
                        return (
                          <tr
                            key={`${detection.time}-${detection.source}-${detection.src_port}-${index}`}
                            className="border-b border-slate-800 hover:bg-slate-800 transition"
                          >
                            <td className="py-3 px-3 w-[13%]">
                              {detection.time || "--:--:--"}
                            </td>
                            <td
                              className="py-3 px-3 w-[18%] font-medium truncate"
                              title={detection.prediction || "Unknown"}
                            >
                              {detection.prediction || "Unknown"}
                            </td>
                            <td className="py-3 px-3 w-[12%]">
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityClasses(severity)}`}
                              >
                                {severity}
                              </span>
                            </td>
                            <td
                              className="py-3 px-3 w-[20%] truncate"
                              title={`${detection.source || "Unknown"} → ${detection.destination || "Unknown"}`}
                            >
                              {detection.source || "Unknown"} →{" "}
                              {detection.destination || "Unknown"}
                            </td>
                            <td
                              className="py-3 px-3 w-[12%] truncate text-cyan-400"
                              title={detection.model || "Unknown"}
                            >
                              {detection.model || "Unknown"}
                            </td>
                            <td className="py-3 px-3 w-[13%]">
                              {(
                                Number(detection.confidence || 0) * 100
                              ).toFixed(2)}
                              %
                            </td>
                            <td
                              className={`py-3 px-3 w-[12%] font-medium ${severity === "Normal" ? "text-green-400" : "text-red-400"}`}
                            >
                              {severity === "Normal" ? "Normal" : "Detected"}
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td
                          colSpan="7"
                          className="py-12 text-center text-slate-500"
                        >
                          Waiting for ML detections...
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
      <br />
    </div>
  );
}

export default LiveMonitoring;

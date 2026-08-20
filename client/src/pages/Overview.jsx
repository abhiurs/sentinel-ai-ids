import {
  ShieldCheck,
  Database,
  Brain,
  Activity,
  Server,
  BarChart3,
  Layers3,
  ShieldAlert,
  Cpu,
  Target,
  Workflow,
  GitCompare,
  ChevronRight,
  Network,
  FileText,
  Globe,
  Upload,
  Monitor,
} from "lucide-react";

function Overview() {
  const algorithms = [
    {
      name: "Random Forest",
      category: "Ensemble Learning",
      description:
        "Builds multiple decision trees and combines their predictions to improve detection accuracy while reducing overfitting.",
      bestUse: "General Intrusion Detection",
      strength: "High Accuracy",
      status: "Ready for Training",
    },

    {
      name: "Extra Trees",
      category: "Ensemble Learning",
      description:
        "Uses randomized decision trees to provide faster training and efficient classification of malicious network traffic.",
      bestUse: "Fast Attack Classification",
      strength: "Fast Prediction",
      status: "Ready for Training",
    },

    {
      name: "Decision Tree",
      category: "Tree-Based Learning",
      description:
        "Creates easy-to-understand decision rules that help explain how different attacks are identified.",
      bestUse: "Explainable AI",
      strength: "Interpretable",
      status: "Ready for Training",
    },

    {
      name: "K-Nearest Neighbors (KNN)",
      category: "Instance-Based Learning",
      description:
        "Identifies malicious traffic by comparing new network flows with previously observed traffic patterns.",
      bestUse: "Traffic Similarity Analysis",
      strength: "Simple Classification",
      status: "Ready for Training",
    },

    {
      name: "XGBoost",
      category: "Gradient Boosting",
      description:
        "Optimized boosting algorithm capable of delivering high-performance intrusion detection across complex datasets.",
      bestUse: "Complex Threat Detection",
      strength: "High Performance",
      status: "Ready for Training",
    },
  ];

  const features = [
    {
      title: "Real-Time Threat Detection",
      description:
        "Continuously monitors incoming traffic and instantly identifies suspicious activities and malicious attacks in real time.",
      icon: ShieldAlert,
      color: "text-red-400",
      bg: "bg-red-500/20",
    },

    {
      title: "CSV Traffic Analysis",
      description:
        "Allows users to upload CSV traffic datasets for intelligent AI-powered intrusion analysis and attack prediction.",
      icon: Upload,
      color: "text-cyan-400",
      bg: "bg-cyan-500/20",
    },

    {
      title: "Live Monitoring Dashboard",
      description:
        "Displays real-time network activity, active connections, threat alerts, and security analytics through interactive dashboards.",
      icon: Activity,
      color: "text-green-400",
      bg: "bg-green-500/20",
    },

    {
      title: "Attack Visualization",
      description:
        "Provides graphical visualization of attack distribution, traffic behavior, and detected cybersecurity threats.",
      icon: BarChart3,
      color: "text-purple-400",
      bg: "bg-purple-500/20",
    },

    {
      title: "ML Based Classification",
      description:
        "Uses machine learning algorithms such as Random Forest, Extra Trees, KNN, Decision Tree and XGBoost for accurate attack classification.",
      icon: Brain,
      color: "text-blue-400",
      bg: "bg-blue-500/20",
    },

    {
      title: "Enterprise Security Reporting",
      description:
        "Generates detailed security reports including attack logs, suspicious IP addresses, and detection summaries.",
      icon: FileText,
      color: "text-orange-400",
      bg: "bg-orange-500/20",
    },
  ];

  const datasets = [
    {
      name: "CICIDS2017",
      provider: "Canadian Institute for Cybersecurity",
      traffic: "Enterprise Network Traffic",
      records: "2.8+ Million Flows",
      attacks: "DoS, DDoS, Port Scan, Botnet, Web Attacks",
      purpose: "Training & Evaluation",
    },

    {
      name: "CSE-CIC-IDS2018",
      provider: "Canadian Institute for Cybersecurity",
      traffic: "Large Scale Enterprise Traffic",
      records: "16+ Million Flows",
      attacks: "Brute Force, DDoS, Botnet, Web Attacks",
      purpose: "Large Scale Evaluation",
    },

    {
      name: "UNSW-NB15",
      provider: "Australian Centre for Cyber Security",
      traffic: "Modern Hybrid Traffic",
      records: "257K+ Records",
      attacks: "Fuzzers, Exploits, Backdoors, Worms",
      purpose: "Generalization Testing",
    },

    {
      name: "NSL-KDD",
      provider: "University of New Brunswick",
      traffic: "Benchmark Network Dataset",
      records: "148K+ Records",
      attacks: "DoS, Probe, R2L, U2R",
      purpose: "Algorithm Benchmarking",
    },
  ];

  const architecture = [
    {
      title: "Network Traffic",
      subtitle: "Incoming Packets",
      icon: Globe,
    },

    {
      title: "Packet Capture",
      subtitle: "Scapy",
      icon: Activity,
    },

    {
      title: "Feature Engineering",
      subtitle: "Cleaning & Scaling",
      icon: Cpu,
    },

    {
      title: "AI Prediction",
      subtitle: "Random Forest\nExtra Trees\nKNN\nXGBoost",
      icon: Brain,
    },

    {
      title: "Threat Detection",
      subtitle: "Attack Classification",
      icon: ShieldAlert,
    },

    {
      title: "Threat Intelligence",
      subtitle: "Severity Analysis",
      icon: ShieldCheck,
    },

    {
      title: "SOC Dashboard",
      subtitle: "Visualization",
      icon: BarChart3,
    },

    {
      title: "Reports",
      subtitle: "Analytics Export",
      icon: FileText,
    },
  ];

  return (
    <div className="space-y-12">
      {/* HEADER */}
      <div className="space-y-4" style={{ marginLeft: "10px" }}>
        <div>
          <p className="text-blue-400 text-sm font-semibold tracking-widest uppercase">
            Sentinel AI
          </p>

          <h1 className="text-5xl font-bold text-white mt-2">
            AI-Powered Network Intrusion Detection System
          </h1>
        </div>

        <p className="text-slate-400 text-lg leading-8 max-w-5xl">
          Sentinel AI is an intelligent cybersecurity platform that detects,
          classifies, and visualizes network intrusions using machine learning.
          It provides real-time threat analysis, interactive dashboards, and
          actionable security insights to help identify malicious activities
          across enterprise networks.
        </p>
      </div>

      <br />

      {/* PROJECT SUMMARY */}

      <section>
        <div
          className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6"
          style={{ marginLeft: "10px", marginRight: "10px" }}
        >
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-blue-500 transition-all">
            <div
              className="flex items-center justify-between"
              style={{ marginLeft: "10px" }}
            >
              <Brain className="text-blue-400" size={28} />

              <span
                className="text-3xl font-bold text-white"
                style={{ marginRight: "10px" }}
              >
                5
              </span>
            </div>

            <h3
              className="text-white font-semibold mt-5"
              style={{ marginLeft: "10px" }}
            >
              ML Models
            </h3>

            <p
              className="text-slate-400 text-sm mt-2"
              style={{ marginLeft: "10px" }}
            >
              Random Forest, Extra Trees, Decision Tree, KNN and XGBoost.
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-blue-500 transition-all">
            <div
              className="flex items-center justify-between"
              style={{ marginLeft: "10px" }}
            >
              <Database className="text-cyan-400" size={28} />

              <span
                className="text-3xl font-bold text-white"
                style={{ marginRight: "10px" }}
              >
                4
              </span>
            </div>

            <h3
              className="text-white font-semibold mt-5"
              style={{ marginLeft: "10px" }}
            >
              Benchmark Datasets
            </h3>

            <p
              className="text-slate-400 text-sm mt-2"
              style={{ marginLeft: "10px" }}
            >
              CICIDS2017, CSE-CIC-IDS2018, UNSW-NB15 and NSL-KDD.
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-blue-500 transition-all">
            <div
              className="flex items-center justify-between"
              style={{ marginLeft: "10px" }}
            >
              <ShieldAlert className="text-red-400" size={28} />

              <span
                className="text-3xl font-bold text-white"
                style={{ marginRight: "10px" }}
              >
                15+
              </span>
            </div>

            <h3
              className="text-white font-semibold mt-5"
              style={{ marginLeft: "10px" }}
            >
              Attack Categories
            </h3>

            <p
              className="text-slate-400 text-sm mt-2"
              style={{ marginLeft: "10px" }}
            >
              Covers reconnaissance, DoS, DDoS, brute-force, web attacks and
              more.
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-blue-500 transition-all">
            <div
              className="flex items-center justify-between"
              style={{ marginLeft: "10px" }}
            >
              <Layers3 className="text-green-400" size={28} />

              <span
                className="text-3xl font-bold text-white"
                style={{ marginRight: "10px" }}
              >
                10+
              </span>
            </div>

            <h3
              className="text-white font-semibold mt-5"
              style={{ marginLeft: "10px" }}
            >
              Technologies
            </h3>

            <p
              className="text-slate-400 text-sm mt-2"
              style={{ marginLeft: "10px" }}
            >
              Modern frontend, backend and machine learning technologies.
            </p>
          </div>
        </div>
      </section>

      <br />
      {/* ALGORITHMS */}
      <section>
        <div className="mb-8" style={{ marginLeft: "10px" }}>
          <div className="flex items-center gap-3">
            <Brain className="text-blue-400" />

            <h2 className="text-3xl font-bold text-white">
              Machine Learning Models
            </h2>
          </div>

          <p className="text-slate-400 mt-3 ml-9">
            Supervised learning algorithms selected for network intrusion
            detection and attack classification.
          </p>
        </div>
        <div className="h-2"></div>
        <div
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          style={{ marginLeft: "10px", marginRight: "10px" }}
        >
          {algorithms.map((algo, index) => (
            <div
              key={index}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:-translate-y-1
hover:shadow-blue-500/10 transition-all duration-300 shadow-lg h-[150px]"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3
                    className="text-xl font-bold text-white"
                    style={{ marginLeft: "10px" }}
                  >
                    {algo.name}
                  </h3>

                  <p
                    className="text-blue-400 text-sm mt-1"
                    style={{ marginLeft: "10px" }}
                  >
                    {algo.category}
                  </p>
                </div>

                <span
                  className="relative top-2 bg-blue-500/15 text-blue-400 text-xs px-3 py-1 rounded-xl"
                  style={{ marginRight: "10px" }}
                >
                  {algo.status}
                </span>
              </div>

              <p
                className="text-slate-300 text-sm leading-6 mt-5"
                style={{ marginLeft: "10px" }}
              >
                {algo.description}
              </p>

              <div className="border-t border-slate-800 mt-6 pt-5 grid grid-cols-2 gap-4">
                <div style={{ marginLeft: "10px" }}>
                  <p className="text-xs uppercase tracking-wide text-slate-500">
                    Best Use
                  </p>

                  <p className="text-white font-medium mt-1">{algo.bestUse}</p>
                </div>

                <div style={{ marginLeft: "10px" }}>
                  <p className="text-xs uppercase tracking-wide text-slate-500">
                    Key Strength
                  </p>

                  <p className="text-white font-medium mt-1">{algo.strength}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
      <br />
      {/* DATASET */}

      <section className="space-y-8">
        <div className="flex items-center gap-3" style={{ marginLeft: "10px" }}>
          <Database className="text-cyan-400" size={32} />

          <h2 className="text-3xl font-bold text-white">Datasets</h2>
        </div>
        <p className="text-slate-400 mt-1" style={{ marginLeft: "10px" }}>
          Public benchmark datasets used for training.
        </p>

        <div className="h-2"></div>

        <div
          className="bg-slate-900 border border-slate-800 rounded-2xl p-8 mb-8 h-[150px]"
          style={{ marginLeft: "10px", marginRight: "10px" }}
        >
          <div className="h-2"></div>
          <h3
            className="text-2xl font-bold text-white"
            style={{ marginLeft: "10px" }}
          >
            Dataset Overview
          </h3>

          <p className="text-slate-400 mt-2" style={{ marginLeft: "10px" }}>
            Sentinel AI utilizes four publicly available intrusion detection
            datasets for model training, validation and performance comparison.
          </p>
          <div className="h-2"></div>

          <div
            className="grid grid-cols-2 lg:grid-cols-4 gap-5 mt-8"
            style={{ marginLeft: "10px", marginRight: "10px" }}
          >
            {[
              { title: "Datasets", value: "4" },
              { title: "Records", value: "19M+" },
              { title: "Attack Types", value: "15+" },
              { title: "ML Models", value: "5" },
            ].map((item) => (
              <div className="bg-slate-800 rounded-xl p-5 text-center">
                <h4 className="text-3xl font-bold text-blue-400">
                  {item.value}
                </h4>

                <p className="text-slate-400 mt-2">{item.title}</p>
              </div>
            ))}
          </div>
        </div>
        <br />
        <div
          className="grid grid-cols-1 md:grid-cols-2 gap-6 h-[560px]"
          style={{ marginLeft: "10px", marginRight: "10px" }}
        >
          {datasets.map((dataset, index) => (
            <div
              key={index}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-7 hover:border-blue-500 transition-all duration-300 hover:-translate-y-1"
            >
              <div className="h-1"></div>
              <div
                className="flex justify-between items-start"
                style={{ marginLeft: "10px" }}
              >
                <h3 className="text-3xl font-bold text-white">
                  {dataset.name}
                </h3>
              </div>

              <div className="space-y-5 mt-8" style={{ marginLeft: "10px" }}>
                <div>
                  <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
                    Provider
                  </p>

                  <p className="text-white mt-2 text-lg">{dataset.provider}</p>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
                    Traffic Type
                  </p>

                  <p className="text-white mt-2">{dataset.traffic}</p>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
                    Records
                  </p>

                  <p className="text-white mt-2">{dataset.records}</p>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
                    Common Attack Types
                  </p>

                  <p className="text-white mt-2 leading-7">{dataset.attacks}</p>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
                    Purpose
                  </p>

                  <p className="text-white mt-2">{dataset.purpose}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
      <br />
      {/* TECH STACK */}
      <section>
        <div
          className="flex items-center gap-3 mb-6"
          style={{ marginLeft: "10px" }}
        >
          <Server className="text-green-400" />

          <h2 className="text-3xl font-bold text-white">Technology Stack</h2>
        </div>
        <p className="text-slate-400 mt-3 ml-9" style={{ marginLeft: "10px" }}>
          Frontend, backend and AI technologies
        </p>
        <div className="h-2"></div>
        <div
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
          style={{ marginLeft: "10px", marginRight: "10px" }}
        >
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-7 min-h-[140px]">
            <div className="h-2"></div>
            <h3
              className="text-xl font-bold text-white mb-5"
              style={{ marginLeft: "10px" }}
            >
              Frontend
            </h3>

            <div
              className="space-y-3 text-slate-400 h-[180px]"
              style={{ marginLeft: "5px" }}
            >
              <p>• React.js</p>
              <p>• Vite</p>
              <p>• Tailwind CSS</p>
              <p>• React Router DOM</p>
              <p>• Axios</p>
              <p>• Recharts</p>
              <p>• Lucid React</p>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-7 min-h-[140px]">
            <div className="h-2"></div>
            <h3
              className="text-xl font-bold text-white mb-5"
              style={{ marginLeft: "10px" }}
            >
              Backend
            </h3>

            <div
              className="space-y-3 text-slate-400"
              style={{ marginLeft: "5px" }}
            >
              <p>• FastAPI</p>
              <p>• Python</p>
              <p>• Uvicorn</p>
              <p>• Pydantic</p>
              <p>• REST APIs</p>
              <p>• JWT Authentication</p>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-7 min-h-[140px]">
            <div className="h-2"></div>
            <h3
              className="text-xl font-bold text-white mb-5"
              style={{ marginLeft: "10px" }}
            >
              Machine Learning
            </h3>

            <div
              className="space-y-3 text-slate-400"
              style={{ marginLeft: "5px" }}
            >
              <p>• Scikit-learn</p>
              <p>• Pandas</p>
              <p>• NumPy</p>
              <p>• Joblib</p>
              <p>• Matplotlib</p>
              <p>• XGBoost</p>
            </div>
          </div>
        </div>
      </section>
      <br />
      {/* FEATURES */}
      <section>
        <div
          className="flex items-center gap-3 mb-6"
          style={{ marginLeft: "10px" }}
        >
          <ShieldCheck className="text-blue-400" />

          <h2 className="text-3xl font-bold text-white">System Features</h2>
        </div>
        <p className="text-slate-400 mt-3 ml-9" style={{ marginLeft: "10px" }}>
          Core capabilities of Sentinel AI
        </p>
        <div className="h-2"></div>
        <div
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
          style={{ marginLeft: "10px", marginRight: "10px" }}
        >
          {features.map((feature, index) => {
            const Icon = feature.icon;

            return (
              <div
                key={index}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-7 min-h-[180px] flex items-center gap-4 hover:border-blue-500 transition"
              >
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-12 h-12 rounded-full ${feature.bg} flex items-center justify-center`}
                      style={{ marginLeft: "10px" }}
                    >
                      <Icon size={22} className={feature.color} />
                    </div>

                    <h3 className="text-2xl font-semibold text-white">
                      {feature.title}
                    </h3>
                  </div>

                  <p
                    className="text-slate-400 leading-8 text-lg"
                    style={{ marginLeft: "10px" }}
                  >
                    {feature.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>
      <br />
      {/* ARCHITECTURE */}
      <section>
        <div
          className="flex items-center gap-3 mb-6"
          style={{ marginLeft: "10px" }}
        >
          <BarChart3 className="text-purple-400" />

          <h2 className="text-3xl font-bold text-white">
            System Architecture Flow
          </h2>
        </div>
        <p className="text-slate-400 mt-3 ml-9" style={{ marginLeft: "10px" }}>
          End-to-end threat detection pipeline
        </p>
        <div className="h-2"></div>
        <div
          className="bg-slate-900 border border-slate-800 rounded-2xl p-10 min-h-[220px]"
          style={{ marginLeft: "10px", marginRight: "10px" }}
        >
          <div className="h-6"></div>
          <div className="overflow-x-auto overflow-y-hidden hide-scrollbar pb-4">
            <div className="flex items-center gap-6 w-max">
              {architecture.map((step, index) => {
                const Icon = step.icon;

                return (
                  <>
                    <div
                      key={index}
                      className="w-60 bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-blue-500 transition-all duration-300  h-[150px]"
                      style={{ marginLeft: "10px" }}
                    >
                      <div className="h-2"></div>
                      <div
                        className="w-14 h-14 rounded-full bg-blue-500/20 flex items-center justify-center "
                        style={{ marginLeft: "10px" }}
                      >
                        <Icon size={28} className="text-blue-400 top-2 " />
                      </div>

                      <h3
                        className="text-xl font-semibold text-white mt-6"
                        style={{ marginLeft: "10px" }}
                      >
                        {step.title}
                      </h3>

                      <p
                        className="text-slate-400 mt-3 leading-7 whitespace-pre-line"
                        style={{ marginLeft: "10px" }}
                      >
                        {step.subtitle}
                      </p>
                    </div>

                    {index !== architecture.length - 1 && (
                      <ChevronRight
                        size={30}
                        className="text-blue-400 flex-shrink-0"
                      />
                    )}
                  </>
                );
              })}
            </div>
          </div>
        </div>
      </section>
      <br />
    </div>
  );
}

export default Overview;

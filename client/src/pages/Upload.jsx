import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import Papa from "papaparse";

import {
  UploadCloud,
  Cpu,
  Database,
  FileText,
  ShieldAlert,
  CheckCircle2,
  Activity,
  Brain,
  FileSpreadsheet,
  HardDrive,
  DatabaseZap,
  Table,
  SearchCheck,
  Workflow,
  Binary,
  ArrowRight,
  BarChart3,
} from "lucide-react";

const uploadStats = [
  {
    title: "Supported Format",
    value: "CSV",
    icon: FileSpreadsheet,
    color: "text-cyan-400",
  },
  {
    title: "Maximum Size",
    value: "2GB",
    icon: HardDrive,
    color: "text-orange-400",
  },
  {
    title: "Datasets",
    value: "4",
    icon: Database,
    color: "text-green-400",
  },
  {
    title: "ML Models",
    value: "5",
    icon: Brain,
    color: "text-blue-400",
  },
];

const Upload = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadComplete, setUploadComplete] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [analysisStage, setAnalysisStage] = useState("Idle");
  const [engineStatus, setEngineStatus] = useState("Idle");
  const [selectedModel, setSelectedModel] = useState("XGBoost");
  const [previewData, setPreviewData] = useState([]);
  const [previewColumns, setPreviewColumns] = useState([]);
  const [detectedDataset, setDetectedDataset] = useState("Waiting...");

  const navigate = useNavigate();

  // Frontend schema-based dataset detection.
  // The backend prediction response remains the authoritative result after analysis.
  const detectDatasetFromColumns = (columns) => {
    const normalized = columns.map((column) =>
      String(column).trim().toLowerCase(),
    );

    const hasAny = (names) =>
      names.some((name) => normalized.includes(name.toLowerCase()));

    const hasAll = (names) =>
      names.every((name) => normalized.includes(name.toLowerCase()));

    // NSL-KDD: classic 41-feature structure
    if (
      hasAll(["protocol_type", "service", "flag", "src_bytes", "dst_bytes"]) ||
      hasAny(["num_compromised", "root_shell", "num_file_creations"])
    ) {
      return "NSL-KDD";
    }

    // UNSW-NB15: characteristic UNSW fields
    if (
      hasAll(["proto", "service", "state", "sbytes", "dbytes"]) ||
      hasAny(["attack_cat", "ct_srv_src", "ct_dst_ltm", "sttl", "dttl"])
    ) {
      return "UNSW-NB15";
    }

    // CICIDS2017 / CSE-CIC-IDS2018: CIC flow-based columns
    const cicColumns = [
      "flow duration",
      "total fwd packets",
      "total backward packets",
      "destination port",
      "flow bytes/s",
      "flow packets/s",
    ];

    const cicMatches = cicColumns.filter((name) =>
      normalized.includes(name),
    ).length;

    if (cicMatches >= 3) {
      // These two datasets share many CIC flow features, so the filename
      // can help distinguish them before the backend confirms the dataset.
      const currentName = fileName.toLowerCase();

      if (
        currentName.includes("2018") ||
        currentName.includes("cse-cic") ||
        currentName.includes("cicids2018")
      ) {
        return "CSE-CIC-IDS2018";
      }

      return "CICIDS2017";
    }

    return "Unknown / Unsupported";
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];

    if (!file) {
      alert("No file selected");
      return;
    }

    setSelectedFile(file);
    setFileName(file.name);

    const blob = file.slice(0, 1024 * 1024); // Read only the first 1 MB

    Papa.parse(blob, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const rows = results.data.slice(0, 5);

        console.log(results);

        setPreviewData(rows);

        if (rows.length > 0) {
          const columns = Object.keys(rows[0]);
          setPreviewColumns(columns);
          setDetectedDataset(detectDatasetFromColumns(columns));
        } else {
          setDetectedDataset("Unable to detect");
        }
      },
      error: (err) => {
        console.error(err);
      },
    });

    setDetectedDataset("Detecting...");
    setUploadProgress(0);
    setUploadComplete(false);

    // Only CSV files
    if (!file.name.toLowerCase().endsWith(".csv")) {
      alert("Please upload a CSV file.");
      return;
    }

    // 2GB limit
    if (file.size > 2 * 1024 * 1024 * 1024) {
      alert("Maximum allowed size is 2 GB.");
      return;
    }

    setIsUploading(true);
    setUploadStatus("Uploading Dataset...");
    setEngineStatus("Running");
    setAnalysisStage("Uploading...");
    setLoading(true);

    let progress = 0;

    const interval = setInterval(() => {
      progress += 5;

      setUploadProgress(progress);

      if (progress >= 100) {
        clearInterval(interval);

        setLoading(false);
        setUploadComplete(true);

        setEngineStatus("Ready");
        setAnalysisStage("Dataset Uploaded");
      }
    }, 80);
  };

  const handleAnalyze = async () => {
    if (!selectedFile) return;

    try {
      setLoading(true);
      setEngineStatus("Running");
      setAnalysisStage("Analyzing Dataset...");

      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("model", selectedModel);

      const response = await api.post("/predict", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const predictionResult = response.data;

      // Backend dataset detection is authoritative after analysis.
      if (predictionResult.datasetName) {
        setDetectedDataset(predictionResult.datasetName);
      }

      console.log("Backend Response:");
      console.log(response);
      console.log(predictionResult);

      localStorage.setItem(
        "analysisResult",
        JSON.stringify({
          packetsAnalyzed: predictionResult.packetsAnalyzed,
          prediction: predictionResult.prediction,
          confidence: predictionResult.confidence,
          maliciousTraffic: predictionResult.maliciousTraffic,
          safeTraffic: predictionResult.safeTraffic,

          model: predictionResult.model,
          datasetName: predictionResult.datasetName,
          severity: predictionResult.severity,

          blockedIPs: 0,

          features: predictionResult.totalFeatures,
          missingValues: predictionResult.missingValues,
          fileSize: predictionResult.fileSize,
          analysisTime: predictionResult.analysisTime,

          severityBreakdown: predictionResult.severityBreakdown,
          attackSummary: predictionResult.attackSummary,

          // ⭐ ADD THIS
          modelMetrics: predictionResult.modelMetrics,
        }),
      );

      setEngineStatus("Complete");
      setAnalysisStage("Analysis Complete");

      console.log("Navigating...");

      navigate("/analysis");
    } catch (error) {
      console.error("Prediction Error:", error);

      if (error.response) {
        console.log(error.response.data);
        alert(error.response.data.message);
      } else {
        alert(error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const supportedDatasets = [
    {
      name: "CICIDS2017",
      provider: "Canadian Institute for Cybersecurity",
    },
    {
      name: "CSE-CIC-IDS2018",
      provider: "Canadian Institute for Cybersecurity",
    },
    {
      name: "UNSW-NB15",
      provider: "Australian Centre for Cyber Security",
    },
    {
      name: "NSL-KDD",
      provider: "University of New Brunswick",
    },
  ];

  const detectionModels = [
    {
      name: "Random Forest",
      type: "Ensemble Learning",
      status: "Ready",
    },
    {
      name: "Extra Trees",
      type: "Ensemble Learning",
      status: "Ready",
    },
    {
      name: "Decision Tree",
      type: "Tree-Based",
      status: "Ready",
    },
    {
      name: "K-Nearest Neighbors",
      type: "Distance-Based",
      status: "Ready",
    },
    {
      name: "XGBoost",
      type: "Gradient Boosting",
      status: "Ready",
    },
  ];

  const pipelineSteps = [
    {
      title: "CSV Upload",
      description: "Network traffic dataset uploaded",
      icon: UploadCloud,
      color: "text-blue-400",
    },
    {
      title: "Validation",
      description: "Validate structure & dataset format",
      icon: SearchCheck,
      color: "text-green-400",
    },
    {
      title: "Dataset Detection",
      description: "Identify uploaded dataset",
      icon: DatabaseZap,
      color: "text-amber-400",
    },
    {
      title: "Preprocessing",
      description: "Prepare features for ML detection",
      icon: Workflow,
      color: "text-orange-400",
    },
    {
      title: "ML Detection",
      description: "Run trained IDS model",
      icon: Brain,
      color: "text-cyan-400",
    },
    {
      title: "Threat Report",
      description: "Generate intrusion analysis",
      icon: BarChart3,
      color: "text-purple-400",
    },
  ];

  return (
    <div className="min-h-screen bg-[#020617] text-white p-8">
      {/* PAGE HEADER */}

      <div className="h-2"></div>

      <div className="mb-10" style={{ marginLeft: "10px" }}>
        <h1 className="text-5xl font-bold mb-3">Traffic Dataset Upload</h1>

        <p className="text-slate-400 text-xl">
          Upload CSV network traffic files for AI-powered intrusion analysis
        </p>
      </div>
      <br />
      {/* MAIN GRID */}

      <div className="space-y-8">
        {/* LEFT SIDE */}

        <div className="space-y-8">
          {/* UPLOAD BOX */}

          <section className="space-y-8">
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-7">
              {/* Upload Box */}

              <div className="xl:col-span-3" style={{ marginLeft: "10px" }}>
                <div className="bg-slate-900 border-2 border-dashed border-slate-700 rounded-3xl p-16 hover:border-blue-500 transition-all duration-300 h-[310px]">
                  <div className="flex flex-col items-center text-center ">
                    <div className="h-2 "></div>
                    <div className="w-32 h-32 rounded-full bg-blue-500/15 flex items-center justify-center">
                      <UploadCloud size={60} className="text-blue-400" />
                    </div>

                    <h2 className="text-4xl font-bold text-white mt-10">
                      Upload Benchmark Dataset
                    </h2>

                    <p className="text-slate-400 mt-5 text-lg max-w-2xl leading-8">
                      Drag & Drop a network traffic CSV dataset or browse
                      manually from your computer.
                    </p>
                    <input
                      type="file"
                      accept=".csv"
                      id="datasetUpload"
                      className="hidden"
                      onChange={handleFileUpload}
                    />
                    <label
                      htmlFor="datasetUpload"
                      className="
    mt-8
    px-7
    py-3
    rounded-xl
    bg-blue-500/20
    border
    border-blue-500/30
    text-blue-300
    hover:bg-blue-500/30
    transition
    cursor-pointer
    inline-flex
    items-center
    justify-center
    h-[42px]
    w-[180px]
  "
                    >
                      Browse CSV Dataset
                    </label>
                    <div className="h-2"></div>
                    <div className="flex flex-wrap justify-center gap-3 mt-8">
                      <span className="px-3 py-2 rounded-lg bg-slate-800 text-slate-300 text-sm">
                        CSV Format
                      </span>

                      <span className="px-3 py-2 rounded-lg bg-slate-800 text-slate-300 text-sm">
                        Max 2GB
                      </span>

                      <span className="px-3 py-2 rounded-lg bg-slate-800 text-slate-300 text-sm">
                        Machine Learning Ready
                      </span>

                      <span className="px-3 py-2 rounded-lg bg-slate-800 text-slate-300 text-sm">
                        AI Analysis
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* AI Status */}

              <div>
                <div
                  className="bg-slate-900 border border-slate-800 rounded-3xl p-7 h-[250px] w-[200px]"
                  style={{ marginLeft: "10px" }}
                >
                  <div className="h-2"></div>
                  <div
                    className="flex items-center gap-3"
                    style={{ marginLeft: "10px" }}
                  >
                    <Cpu className="text-blue-400" size={28} />

                    <h3 className="text-2xl font-bold text-white">AI Engine</h3>
                  </div>

                  <div
                    className="space-y-6 mt-8"
                    style={{ marginLeft: "10px" }}
                  >
                    <div>
                      <p className="text-slate-500 text-xs uppercase">Status</p>

                      <p
                        className={`mt-2 ${
                          engineStatus === "Ready"
                            ? "text-green-400"
                            : engineStatus === "Running"
                              ? "text-yellow-400"
                              : engineStatus === "Complete"
                                ? "text-cyan-400"
                                : "text-slate-400"
                        }`}
                      >
                        ● {engineStatus}
                      </p>
                    </div>

                    <div>
                      <p className="text-slate-500 text-xs uppercase">
                        Detection Engine
                      </p>

                      <p className="text-white mt-2">Machine Learning IDS</p>
                    </div>

                    <div>
                      <p className="text-slate-500 text-xs uppercase">
                        Models Loaded
                      </p>

                      <p className="text-white mt-2">5</p>
                    </div>

                    <div>
                      <p className="text-slate-500 text-xs uppercase">
                        Dataset
                      </p>

                      <p className="text-white mt-2 truncate">
                        {selectedFile ? selectedFile.name : "Waiting..."}
                      </p>
                    </div>

                    <div>
                      <p className="text-slate-500 text-xs uppercase">Stage</p>

                      <p className="text-white mt-2">{analysisStage}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <br />

            {isUploading && (
              <div className="mt-8" style={{ marginLeft: "10px" }}>
                <div className="flex justify-between mb-2">
                  <span className="text-slate-300">{uploadStatus}</span>

                  <span className="text-cyan-400">{uploadProgress}%</span>
                </div>

                <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 transition-all duration-200"
                    style={{
                      width: `${uploadProgress}%`,
                    }}
                  />
                </div>
              </div>
            )}

            <br />

            <div className="mb-6">
              <label
                className="block text-slate-300 mb-2 font-semibold"
                style={{ marginLeft: "10px" }}
              >
                Detection Model
              </label>

              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="w-[1400px] bg-slate-900 border border-slate-700 rounded-xl p-3 text-white"
                style={{ marginLeft: "10px", marginRight: "10px" }}
              >
                <option>XGBoost</option>
                <option>Random Forest</option>
                <option>Extra Trees</option>
                <option>Decision Tree</option>
                <option>KNN</option>
              </select>
            </div>

            <br />

            <div className="flex justify-end mt-8">
              <button
                disabled={!selectedFile || loading}
                onClick={handleAnalyze}
                className="
    px-8
    py-3
    w-[180px]
    rounded-xl
    bg-blue-500/20
    border
    border-blue-500
    hover:bg-blue-500/50
    transition
    font-semibold
    disabled:opacity-50
  "
              >
                {loading ? "Analyzing..." : "Analyze Dataset"}
              </button>
            </div>
            <br />

            {/* FILE INFO */}

            {selectedFile && (
              <section
                className="bg-slate-900 border border-slate-800 rounded-3xl pt-8 px-8 pb-10"
                style={{ marginLeft: "10px", marginRight: "10px" }}
              >
                <div className="h-2"></div>
                <div
                  className="flex items-center gap-4 mb-8"
                  style={{ marginLeft: "10px" }}
                >
                  <CheckCircle2 className="text-green-400" size={34} />

                  <div>
                    <h2 className="text-2xl font-bold text-white">
                      Dataset Selected
                    </h2>

                    <p className="text-slate-400">
                      Dataset is ready for preprocessing and analysis.
                    </p>
                  </div>
                </div>
                <div className="h-4"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                  <div
                    className="bg-slate-800 rounded-2xl p-5"
                    style={{ marginLeft: "10px" }}
                  >
                    <div className="h-1"></div>
                    <p
                      className="text-slate-400 text-sm"
                      style={{ marginLeft: "10px" }}
                    >
                      File Name
                    </p>

                    <h3
                      className="text-lg font-semibold mt-2 break-words"
                      style={{ marginLeft: "10px" }}
                    >
                      {selectedFile.name}
                    </h3>
                  </div>

                  <div className="bg-slate-800 rounded-2xl p-5">
                    <div className="h-1"></div>
                    <p
                      className="text-slate-400 text-sm"
                      style={{ marginLeft: "10px" }}
                    >
                      File Size
                    </p>

                    <h3
                      className="text-lg font-semibold mt-2"
                      style={{ marginLeft: "10px" }}
                    >
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </h3>
                  </div>

                  <div className="bg-slate-800 rounded-2xl p-5">
                    <div className="h-1"></div>
                    <p
                      className="text-slate-400 text-sm"
                      style={{ marginLeft: "10px" }}
                    >
                      File Type
                    </p>

                    <h3
                      className="text-lg font-semibold mt-2"
                      style={{ marginLeft: "10px" }}
                    >
                      {selectedFile.type || "CSV"}
                    </h3>
                  </div>

                  <div
                    className="bg-slate-800 rounded-2xl p-5"
                    style={{ marginRight: "10px" }}
                  >
                    <div className="h-1"></div>
                    <p
                      className="text-slate-400 text-sm"
                      style={{ marginLeft: "10px" }}
                    >
                      Status
                    </p>

                    <h3
                      className="text-lg font-semibold text-green-400 mt-2"
                      style={{ marginLeft: "10px" }}
                    >
                      Ready for Analysis
                    </h3>
                  </div>
                  <div className="h-1"></div>
                </div>
              </section>
            )}
            <br />

            {selectedFile && (
              <section
                className="bg-slate-900 border border-slate-800 rounded p-8"
                style={{ marginLeft: "10px" }}
              >
                <div className="flex justify-between items-center mb-8">
                  <div
                    className="flex items-center gap-3"
                    style={{ marginLeft: "10px", marginRight: "10px" }}
                  >
                    <Table className="text-cyan-400" size={30} />

                    <div>
                      <h2 className="text-3xl font-bold">Dataset Preview</h2>

                      <p className="text-slate-400 mt-1">
                        Preview uploaded traffic before AI analysis.
                      </p>
                    </div>
                  </div>

                  <span
                    className="
px-4
py-2
rounded
bg-blue-500/15
border
border-blue-500/30
text-blue-400
text-sm
"
                    style={{ marginRight: "10px" }}
                  >
                    CSV Preview
                  </span>
                </div>

                <div
                  className="overflow-x-auto rounded-xl border border-slate-800"
                  style={{ marginLeft: "5px" }}
                >
                  <table className="w-full">
                    <thead className="bg-slate-800">
                      <tr>
                        {previewColumns.map((column) => (
                          <th
                            key={column}
                            className="px-6 py-4 text-left text-slate-300"
                          >
                            {column}
                          </th>
                        ))}
                      </tr>
                    </thead>

                    <tbody>
                      {previewData.map((row, index) => (
                        <tr key={index}>
                          {previewColumns.map((column) => (
                            <td key={column} className="px-6 py-4">
                              {String(row[column])}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div
                  className="flex justify-between mt-6 text-sm text-slate-500"
                  style={{ marginLeft: "5px" }}
                >
                  <p>Detected Columns</p>

                  <p>
                    Rows: {previewData.length} | Columns:{" "}
                    {previewColumns.length}
                  </p>
                </div>
              </section>
            )}
            <br />

            <section className="space-y-6">
              <div
                className="flex items-center gap-3"
                style={{ marginLeft: "10px" }}
              >
                <Database className="text-cyan-400" size={30} />

                <h2 className="text-3xl font-bold text-white">
                  Supported Benchmark Datasets
                </h2>
              </div>
              <p className="text-slate-400 mt-1" style={{ marginLeft: "10px" }}>
                Public intrusion detection datasets supported by Sentinel AI.
              </p>
              <div className="h-2"></div>
              <div
                className="grid grid-cols-2 lg:grid-cols-4 gap-5"
                style={{ marginLeft: "10px", marginRight: "10px" }}
              >
                {supportedDatasets.map((dataset, index) => (
                  <div
                    key={index}
                    className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-blue-500 transition-all duration-300 h-[100px]"
                  >
                    <div className="h-2"></div>
                    <h3
                      className="text-xl font-semibold text-white"
                      style={{ marginLeft: "10px" }}
                    >
                      {dataset.name}
                    </h3>

                    <p
                      className="text-slate-400 mt-3 leading-7"
                      style={{ marginLeft: "10px" }}
                    >
                      {dataset.provider}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            <br />

            <section
              className="bg-slate-900 border border-slate-800 rounded-3xl p-8 h-full "
              style={{ marginLeft: "10px", marginRight: "10px" }}
            >
              <div
                className="flex items-center justify-start gap-2 overflow-x-auto pb-2"
                style={{ marginLeft: "10px" }}
              >
                <Binary className="text-cyan-400" size={30} />

                <div>
                  <h2 className="text-3xl font-bold">AI Analysis Pipeline</h2>

                  <p className="text-slate-400 mt-1">
                    Understand how Sentinel AI processes uploaded datasets.
                  </p>
                </div>
              </div>
              <div className="h-2"></div>
              <div
                className="flex flex-wrap items-center justify-between gap-6"
                style={{ marginLeft: "10px", marginRight: "10px" }}
              >
                {pipelineSteps.map((step, index) => {
                  const Icon = step.icon;

                  return (
                    <div key={index} className="flex items-center">
                      <div
                        className="
bg-slate-800
border
border-slate-700
rounded-2xl
p-6
w-[190px]
hover:border-blue-500
transition
"
                      >
                        <div className="flex justify-center mb-4">
                          <Icon size={36} className={step.color} />
                        </div>

                        <h3 className="text-lg font-semibold text-center">
                          {step.title}
                        </h3>

                        <p className="text-slate-400 text-sm text-center mt-3">
                          {step.description}
                        </p>
                      </div>

                      {index !== pipelineSteps.length - 1 && (
                        <ArrowRight
                          className="mx-5 text-slate-500 "
                          size={20}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
              <div className="h-2"></div>
            </section>
            <br />

            <section className="space-y-6">
              <div
                className="flex items-center gap-3"
                style={{ marginLeft: "10px" }}
              >
                <Brain className="text-blue-400" size={30} />

                <h2 className="text-3xl font-bold text-white">
                  Supported Detection Models
                </h2>
              </div>
              <p className="text-slate-400 mt-1" style={{ marginLeft: "10px" }}>
                Machine learning algorithms available for intrusion detection
                and attack classification.
              </p>
              <div className="h-2"></div>
              <div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
                style={{ marginRight: "10px" }}
              >
                {detectionModels.map((model, index) => (
                  <div
                    key={index}
                    className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-blue-500 transition-all duration-300 h-[80px]"
                    style={{ marginLeft: "10px" }}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="h-2"></div>
                        <h3
                          className="text-xl font-semibold text-white"
                          style={{ marginLeft: "10px" }}
                        >
                          {model.name}
                        </h3>

                        <p
                          className="text-slate-400 mt-1"
                          style={{ marginLeft: "10px" }}
                        >
                          {model.type}
                        </p>
                      </div>

                      <span
                        className=" relative top-1 flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/15 border border-green-500/30 text-green-400 text-xs w-[65px]"
                        style={{ marginRight: "10px" }}
                      >
                        <CheckCircle2 size={14} style={{ marginLeft: "2px" }} />
                        Ready
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Upload Statistics */}
            <br />
            <div
              className="grid grid-cols-2 lg:grid-cols-4 gap-5"
              style={{ marginRight: "10px" }}
            >
              {uploadStats.map((item, index) => {
                const Icon = item.icon;

                return (
                  <div
                    key={index}
                    className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-blue-500 transition-all duration-300 hover:-translate-y-1
hover:shadow-lg
hover:shadow-blue-500/10"
                    style={{ marginLeft: "10px" }}
                  >
                    <div className="h-2"></div>
                    <div
                      className="flex items-center justify-between mb-6"
                      style={{ marginLeft: "10px" }}
                    >
                      <Icon size={28} className={item.color} />

                      <span
                        className="text-xs text-slate-500 uppercase"
                        style={{ marginRight: "10px" }}
                      >
                        Info
                      </span>
                    </div>

                    <h3
                      className="text-3xl font-bold text-white "
                      style={{ marginLeft: "10px" }}
                    >
                      {item.value}
                    </h3>

                    <p
                      className="text-slate-400 mt-2 "
                      style={{ marginLeft: "10px" }}
                    >
                      {item.title}
                    </p>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      </div>
      <br />
    </div>
  );
};

export default Upload;

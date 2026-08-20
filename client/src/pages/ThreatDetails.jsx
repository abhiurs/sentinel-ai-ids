import {
  ShieldAlert,
  AlertTriangle,
  Activity,
  Globe,
  Clock3,
  Brain,
  Radar,
  Server,
  Lock,
} from "lucide-react";

function ThreatDetails() {
  const timeline = [
    "Suspicious traffic detected from external IP",
    "AI model identified abnormal packet behavior",
    "Traffic spike exceeded threshold limits",
    "Firewall automatically blocked malicious requests",
    "Threat mitigation initiated successfully",
  ];

  const logs = [
    "[12:01:22] Incoming packets exceeded normal traffic volume",
    "[12:01:25] Random Forest model classified DDoS activity",
    "[12:01:28] Source IP added to temporary firewall blocklist",
    "[12:01:31] Security engine activated mitigation rules",
    "[12:01:35] Threat severity escalated to Critical",
  ];

  return (
    <div className="min-h-screen bg-[#020617] text-white p-6">

      {/* HEADER */}
      <div className="mb-8">

        <div className="flex items-center gap-4">

          <div className="w-20 h-20 rounded-2xl bg-red-500/20 flex items-center justify-center">
            <ShieldAlert className="text-red-400" size={40} />
          </div>

          <div>

            <h1 className="text-5xl font-bold">
              DDoS Attack Investigation
            </h1>

            <p className="text-slate-400 text-xl mt-2">
              Detailed AI powered threat intelligence and incident analysis
            </p>

          </div>

        </div>

      </div>

      {/* TOP CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">

          <div className="flex items-center justify-between">

            <div>
              <p className="text-slate-400">
                Threat Severity
              </p>

              <h2 className="text-4xl font-bold text-red-400 mt-2">
                Critical
              </h2>
            </div>

            <AlertTriangle className="text-red-400" size={34} />

          </div>

        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">

          <div className="flex items-center justify-between">

            <div>
              <p className="text-slate-400">
                Confidence Score
              </p>

              <h2 className="text-4xl font-bold text-green-400 mt-2">
                98.7%
              </h2>
            </div>

            <Brain className="text-green-400" size={34} />

          </div>

        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">

          <div className="flex items-center justify-between">

            <div>
              <p className="text-slate-400">
                Source IP
              </p>

              <h2 className="text-2xl font-bold text-blue-400 mt-2">
                192.168.1.24
              </h2>
            </div>

            <Globe className="text-blue-400" size={34} />

          </div>

        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">

          <div className="flex items-center justify-between">

            <div>
              <p className="text-slate-400">
                Attack Duration
              </p>

              <h2 className="text-4xl font-bold text-yellow-400 mt-2">
                14m
              </h2>
            </div>

            <Clock3 className="text-yellow-400" size={34} />

          </div>

        </div>

      </div>

      {/* MAIN GRID */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* LEFT SIDE */}
        <div className="xl:col-span-2 flex flex-col gap-6">

          {/* ATTACK SUMMARY */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8">

            <div className="flex items-center gap-3 mb-6">

              <Radar className="text-red-400" size={30} />

              <h2 className="text-3xl font-bold">
                Attack Summary
              </h2>

            </div>

            <p className="text-slate-300 text-lg leading-9">

              The AI detection engine identified a Distributed Denial Of Service
              attack originating from multiple suspicious traffic requests.
              The intrusion detection system detected abnormal traffic spikes,
              repeated packet flooding behavior, and malicious request patterns.
              Automated mitigation protocols were activated immediately to
              protect critical network infrastructure and minimize service disruption.

            </p>

          </div>

          {/* INCIDENT TIMELINE */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8">

            <div className="flex items-center gap-3 mb-6">

              <Activity className="text-blue-400" size={30} />

              <h2 className="text-3xl font-bold">
                Incident Timeline
              </h2>

            </div>

            <div className="space-y-5">

              {timeline.map((item, index) => (

                <div
                  key={index}
                  className="flex items-start gap-4 bg-slate-800 rounded-xl p-5"
                >

                  <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold">
                    {index + 1}
                  </div>

                  <p className="text-slate-300 text-lg">
                    {item}
                  </p>

                </div>

              ))}

            </div>

          </div>

          {/* TRAFFIC LOGS */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8">

            <div className="flex items-center gap-3 mb-6">

              <Server className="text-green-400" size={30} />

              <h2 className="text-3xl font-bold">
                Traffic Logs
              </h2>

            </div>

            <div className="space-y-4">

              {logs.map((log, index) => (

                <div
                  key={index}
                  className="bg-slate-800 rounded-xl p-4 text-slate-300 font-mono"
                >
                  {log}
                </div>

              ))}

            </div>

          </div>

        </div>

        {/* RIGHT SIDE */}
        <div className="flex flex-col gap-6">

          {/* AI ENGINE */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">

            <div className="flex items-center gap-3 mb-5">

              <Brain className="text-purple-400" />

              <h2 className="text-2xl font-bold">
                AI Detection Engine
              </h2>

            </div>

            <div className="space-y-5">

              <div className="bg-slate-800 rounded-xl p-4">
                <p className="text-slate-400 text-sm">
                  Detection Model
                </p>

                <h3 className="text-2xl font-bold text-blue-400 mt-1">
                  Random Forest
                </h3>
              </div>

              <div className="bg-slate-800 rounded-xl p-4">
                <p className="text-slate-400 text-sm">
                  Detection Accuracy
                </p>

                <h3 className="text-2xl font-bold text-green-400 mt-1">
                  98.7%
                </h3>
              </div>

              <div className="bg-slate-800 rounded-xl p-4">
                <p className="text-slate-400 text-sm">
                  Threat Category
                </p>

                <h3 className="text-2xl font-bold text-red-400 mt-1">
                  DDoS Attack
                </h3>
              </div>

            </div>

          </div>

          {/* MITIGATION */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">

            <div className="flex items-center gap-3 mb-5">

              <Lock className="text-yellow-400" />

              <h2 className="text-2xl font-bold">
                Recommended Mitigation
              </h2>

            </div>

            <div className="space-y-4">

              <div className="bg-slate-800 rounded-xl p-4">
                • Block malicious IP addresses
              </div>

              <div className="bg-slate-800 rounded-xl p-4">
                • Enable advanced rate limiting
              </div>

              <div className="bg-slate-800 rounded-xl p-4">
                • Activate firewall protection rules
              </div>

              <div className="bg-slate-800 rounded-xl p-4">
                • Continue deep packet inspection
              </div>

              <div className="bg-slate-800 rounded-xl p-4">
                • Monitor unusual traffic behavior
              </div>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}

export default ThreatDetails;
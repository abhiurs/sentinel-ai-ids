import { Brain } from "lucide-react";

const ATTACK_PROFILES = {
  "DoS Hulk": {
    reasoning: [
      "Abnormally high packet volume detected.",
      "Traffic pattern matches DoS behaviour.",
      "Network availability may be impacted.",
    ],
    actions: [
      "Enable rate limiting immediately.",
      "Block attacking source IP addresses.",
      "Monitor bandwidth utilization.",
    ],
  },

  DDoS: {
    reasoning: [
      "Distributed attack signatures detected.",
      "Multiple traffic sources involved.",
      "Service disruption risk is high.",
    ],
    actions: [
      "Enable DDoS mitigation.",
      "Block malicious IP ranges.",
      "Redirect traffic through protection service.",
    ],
  },

  PortScan: {
    reasoning: [
      "Reconnaissance behaviour detected.",
      "Multiple ports scanned rapidly.",
      "Possible attack preparation identified.",
    ],
    actions: [
      "Block scanning host.",
      "Review firewall policies.",
      "Audit exposed services.",
    ],
  },

  "FTP-Patator": {
    reasoning: [
      "Repeated FTP authentication failures detected.",
      "Possible brute-force attack identified.",
      "Credential compromise risk exists.",
    ],
    actions: [
      "Disable affected accounts.",
      "Force password reset.",
      "Enable MFA.",
    ],
  },

  "SSH-Patator": {
    reasoning: [
      "Repeated SSH login attempts detected.",
      "Credential guessing behaviour observed.",
      "Remote access is being targeted.",
    ],
    actions: [
      "Restrict SSH access.",
      "Enable MFA.",
      "Review authentication logs.",
    ],
  },

  Heartbleed: {
    reasoning: [
      "Heartbleed exploit signature detected.",
      "Sensitive memory exposure possible.",
      "Immediate patch verification required.",
    ],
    actions: [
      "Patch vulnerable systems.",
      "Replace SSL certificates.",
      "Reset exposed credentials.",
    ],
  },

  Infiltration: {
    reasoning: [
      "Possible internal compromise detected.",
      "Suspicious lateral movement observed.",
      "Host integrity should be verified.",
    ],
    actions: [
      "Isolate affected machine.",
      "Perform forensic investigation.",
      "Check persistence mechanisms.",
    ],
  },

  Bot: {
    reasoning: [
      "Botnet communication detected.",
      "Host may be remotely controlled.",
      "Outbound malicious traffic observed.",
    ],
    actions: [
      "Disconnect infected host.",
      "Run malware scan.",
      "Investigate command-and-control traffic.",
    ],
  },

  SQLInjection: {
    reasoning: [
      "SQL Injection signature detected.",
      "Database exploitation attempt identified.",
      "Application security is at risk.",
    ],
    actions: [
      "Inspect database logs.",
      "Validate user inputs.",
      "Deploy WAF rules.",
    ],
  },

  XSS: {
    reasoning: [
      "Cross-site scripting payload detected.",
      "Client-side exploitation attempt observed.",
      "Web application requires inspection.",
    ],
    actions: [
      "Sanitize user input.",
      "Review CSP configuration.",
      "Inspect web server logs.",
    ],
  },

  default: {
    reasoning: [
      "Suspicious behaviour detected.",
      "AI confidence indicates malicious activity.",
      "Further investigation recommended.",
    ],
    actions: [
      "Continue monitoring.",
      "Review security logs.",
      "Escalate if necessary.",
    ],
  },
};

function DecisionEngine({ result }) {
  // Get dominant attack (excluding Benign)
  const dominantAttack = Object.entries(result.attackSummary || {})
    .filter(([attack]) => attack.toLowerCase() !== "benign")
    .sort((a, b) => b[1] - a[1])[0];

  // AI Reasoning
  const attackName = dominantAttack?.[0] || "";

  let profile = ATTACK_PROFILES.default;

  if (attackName.includes("DoS Hulk")) profile = ATTACK_PROFILES["DoS Hulk"];
  else if (attackName.includes("DDoS")) profile = ATTACK_PROFILES.DDoS;
  else if (attackName.includes("PortScan")) profile = ATTACK_PROFILES.PortScan;
  else if (attackName.includes("FTP")) profile = ATTACK_PROFILES["FTP-Patator"];
  else if (attackName.includes("SSH")) profile = ATTACK_PROFILES["SSH-Patator"];
  else if (attackName.includes("Heartbleed"))
    profile = ATTACK_PROFILES.Heartbleed;
  else if (attackName.includes("Bot")) profile = ATTACK_PROFILES.Bot;
  else if (attackName.includes("Infiltration"))
    profile = ATTACK_PROFILES.Infiltration;
  else if (attackName.includes("Sql")) profile = ATTACK_PROFILES.SQLInjection;
  else if (attackName.includes("XSS")) profile = ATTACK_PROFILES.XSS;

  const reasoning = [...profile.reasoning];

  if (result.maliciousTraffic > 5) {
    reasoning.push(`${result.maliciousTraffic}% malicious traffic detected.`);
  }

  reasoning.push(`Severity classified as ${result.severity}.`);

  reasoning.push(`Detection confidence is ${result.confidence}%.`);

  // Recommended Actions

  const actions = [...profile.actions];

  if (result.severity === "Critical") {
    actions.push("Escalate incident to SOC immediately.");

    actions.push("Preserve forensic evidence.");
  } else if (result.severity === "High") {
    actions.push("Increase network monitoring.");
  } else if (result.severity === "Medium") {
    actions.push("Review suspicious sessions.");
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 h-[650px]">
      <div className="h-2"></div>

      <div
        className="flex items-center gap-3 mb-6"
        style={{ marginLeft: "10px" }}
      >
        <Brain className="text-blue-400" />

        <h2 className="text-2xl font-bold">AI Decision Engine</h2>
      </div>

      <div className="h-2"></div>

      <div
        className="bg-slate-800 rounded-xl p-5 mb-5"
        style={{ marginLeft: "10px" }}
      >
        <p className="text-slate-400 text-sm" style={{ marginLeft: "10px" }}>
          AI Decision
        </p>

        <h2
          className="text-2xl font-bold text-red-400 mt-2"
          style={{ marginLeft: "10px" }}
        >
          {result.prediction} Traffic Detected
        </h2>
      </div>
      <div className="h-4"></div>
      <div className="flex justify-between mt-3">
        <span className="text-slate-400" style={{ marginLeft: "10px" }}>
          Risk Level
        </span>

        <span
          className={`
px-3
py-1
rounded-full
text-sm
font-semibold
w-[58px]
text-center
${
  result.severity === "Critical"
    ? "bg-red-500/20 text-red-400"
    : result.severity === "High"
      ? "bg-orange-500/20 text-orange-400"
      : result.severity === "Medium"
        ? "bg-yellow-500/20 text-yellow-400"
        : "bg-green-500/20 text-green-400"
}
`}
          style={{ marginLeft: "10px" }}
        >
          {result.severity}
        </span>
      </div>
      <div className="h-4"></div>
      <div
        className="bg-slate-800 rounded-xl p-5 mb-5 h-[180px]"
        style={{ marginLeft: "10px" }}
      >
        <h3 className="font-semibold mb-4" style={{ marginLeft: "10px" }}>
          AI Reasoning
        </h3>

        <div className="space-y-3">
          {reasoning.map((reason, index) => (
            <div
              key={index}
              className="flex items-center gap-3"
              style={{ marginLeft: "5px" }}
            >
              <span className="text-green-400">✔</span>

              <span className="text-slate-300">{reason}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="h-4"></div>
      <div
        className="bg-slate-800 rounded-xl p-5 mb-5 h-[100px]"
        style={{ marginLeft: "10px" }}
      >
        <div className="h-1"></div>
        <div className="flex justify-between" style={{ marginLeft: "10px" }}>
          <span>AI Confidence</span>

          <span
            className="font-bold text-blue-400"
            style={{ marginRight: "10px" }}
          >
            {result.confidence}%
          </span>
        </div>

        <div
          className="mt-4 h-2 bg-slate-700 rounded-full"
          style={{ marginLeft: "10px", marginRight: "10px" }}
        >
          <div
            className="bg-blue-400 h-2 rounded-full"
            style={{
              width: `${result.confidence}%`,
            }}
          />
          <div className="h-2"></div>
          <div className="mt-5 text-sm text-slate-300">
            Based on current network behaviour, the AI engine classifies this
            traffic as
            <span className="text-red-400 font-semibold">
              {" "}
              {result.prediction}
            </span>
            with
            <span className="text-blue-400 font-semibold">
              {" "}
              {result.confidence}%
            </span>
            confidence.
          </div>
        </div>
      </div>
      <div className="h-4"></div>
      <div
        className="bg-slate-800 rounded-xl p-5 h-[160px]"
        style={{ marginLeft: "10px" }}
      >
        <div className="h-2"></div>
        <h3 className="font-semibold mb-4" style={{ marginLeft: "10px" }}>
          Recommended Actions
        </h3>
        <div className="h-1"></div>
        <div className="space-y-3">
          {actions.map((action, index) => (
            <div
              key={index}
              className="flex items-center gap-3"
              style={{ marginLeft: "5px" }}
            >
              <span className="text-blue-400">🛡️</span>

              <span className="text-slate-300">{action}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default DecisionEngine;

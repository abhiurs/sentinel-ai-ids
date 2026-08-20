// aiEngine.js

const modelProfiles = {

  "DDoS": {
    model: "Random Forest",
    baseConfidence: 99.2,
    detectionSpeed: 0.18,
  },

  "Port Scan": {
    model: "Isolation Forest",
    baseConfidence: 96.4,
    detectionSpeed: 0.25,
  },

  "SQL Injection": {
    model: "XGBoost",
    baseConfidence: 97.8,
    detectionSpeed: 0.21,
  },

  "Infiltration": {
    model: "LSTM Neural Network",
    baseConfidence: 95.9,
    detectionSpeed: 0.42,
  },

  "Brute Force": {
    model: "Extra Trees",
    baseConfidence: 97.2,
    detectionSpeed: 0.28,
  },

  "FTP Patator": {
    model: "Random Forest",
    baseConfidence: 98.1,
    detectionSpeed: 0.23,
  },

  "SSH Patator": {
    model: "Random Forest",
    baseConfidence: 97.6,
    detectionSpeed: 0.24,
  },

  Normal: {
    model: "Hybrid Detection",
    baseConfidence: 99.8,
    detectionSpeed: 0.12,
  }

};

export function generateAIEngine(traffic, attackState) {

  const profile =
    modelProfiles[attackState.type] ||
    modelProfiles.Normal;

  let confidence = profile.baseConfidence;

  switch (attackState.phase) {

    case "Starting":
      confidence -= 2;
      break;

    case "Growing":
      confidence -= 0.8;
      break;

    case "Peak":
      confidence += 0.4;
      break;

    case "Recovery":
      confidence += 1;
      break;

    default:
      break;

  }

  confidence += (Math.random() * 0.6 - 0.3);

  const packets =
    traffic.packetsPerSecond;

  return {

    model: profile.model,

    confidence:
      confidence.toFixed(2),

    detectionSpeed:
      profile.detectionSpeed.toFixed(2),

    packetsPerSecond: packets,

    status:
      attackState.phase === "Recovery"
        ? "Mitigating"
        : "Analyzing"

  };

}
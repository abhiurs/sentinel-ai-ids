const profiles = {
  "Benign Traffic": {
    basePackets: 2200,
    peakPackets: 2600,
    maliciousRatio: 0.01,
    throughput: 380,
  },

  "Port Scan": {
    basePackets: 2400,
    peakPackets: 3600,
    maliciousRatio: 0.18,
    throughput: 560,
  },

  "FTP Patator": {
    basePackets: 2800,
    peakPackets: 4300,
    maliciousRatio: 0.38,
    throughput: 720,
  },

  "SSH Patator": {
    basePackets: 2600,
    peakPackets: 4100,
    maliciousRatio: 0.34,
    throughput: 680,
  },

  "Web Attack Brute Force": {
    basePackets: 2500,
    peakPackets: 3800,
    maliciousRatio: 0.42,
    throughput: 620,
  },

  "Web Attack XSS": {
    basePackets: 2400,
    peakPackets: 3400,
    maliciousRatio: 0.48,
    throughput: 590,
  },

  "SQL Injection": {
    basePackets: 2300,
    peakPackets: 3300,
    maliciousRatio: 0.58,
    throughput: 610,
  },

  "DoS GoldenEye": {
    basePackets: 3500,
    peakPackets: 6200,
    maliciousRatio: 0.62,
    throughput: 850,
  },

  "DoS Hulk": {
    basePackets: 4200,
    peakPackets: 8500,
    maliciousRatio: 0.88,
    throughput: 940,
  },

  "DoS Slowloris": {
    basePackets: 2800,
    peakPackets: 5000,
    maliciousRatio: 0.58,
    throughput: 700,
  },

  "DoS SlowHTTPTest": {
    basePackets: 3000,
    peakPackets: 5400,
    maliciousRatio: 0.65,
    throughput: 750,
  },

  DDoS: {
    basePackets: 5000,
    peakPackets: 12000,
    maliciousRatio: 0.94,
    throughput: 980,
  },

  Bot: {
    basePackets: 2600,
    peakPackets: 3900,
    maliciousRatio: 0.28,
    throughput: 620,
  },

  Infiltration: {
    basePackets: 2500,
    peakPackets: 4200,
    maliciousRatio: 0.55,
    throughput: 680,
  },

  Heartbleed: {
    basePackets: 2200,
    peakPackets: 3400,
    maliciousRatio: 0.52,
    throughput: 600,
  },
};

export function generateTraffic(attackState) {
  const profile =
    profiles[attackState.type] ||
    profiles["Benign Traffic"];

  const progress = attackState.progress;

  let factor = 0;

  switch (attackState.phase) {
    case "Starting":
      factor = progress * 2;
      break;

    case "Growing":
      factor = 0.4 + progress;
      break;

    case "Peak":
      factor = 1;
      break;

    case "Recovery":
      factor = 1 - (progress - 0.8) * 5;
      break;

    default:
      factor = 0.2;
  }

  factor = Math.max(0.15, Math.min(1, factor));

  const packetsPerSecond = Math.max(
    100,
    Math.round(
      profile.basePackets +
        (profile.peakPackets - profile.basePackets) * factor +
        (Math.random() * 120 - 60)
    )
  );

  const maliciousPackets = Math.max(
    0,
    Math.min(
      packetsPerSecond,
      Math.round(
        packetsPerSecond *
          profile.maliciousRatio *
          factor
      )
    )
  );

  const benignPackets =
    packetsPerSecond - maliciousPackets;

  const throughput = Math.round(
    profile.throughput * factor +
      300 +
      Math.random() * 20
  );

  return {
    packetsPerSecond,

    benignPackets,

    maliciousPackets,

    throughput,

    phase: attackState.phase,

    attack: attackState.type,

    severity: attackState.severity,
  };
}
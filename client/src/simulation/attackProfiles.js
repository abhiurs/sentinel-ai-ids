// attackProfiles.js
// Demo attack profiles aligned with CICIDS2017 attack categories.

export const attackProfiles = [
  {
    id: "normal",
    name: "Benign Traffic",
    category: "Normal",
    severity: "Low",
    probability: 25,
    duration: 12,

    traffic: {
      basePackets: 2200,
      peakPackets: 2600,

      maliciousPercent: {
        min: 0,
        max: 2,
      },

      throughput: {
        min: 300,
        max: 450,
      },
    },

    ai: {
      confidence: {
        min: 98,
        max: 99.8,
      },
    },

    action: "Monitoring",
  },

  {
    id: "portscan",
    name: "Port Scan",
    category: "Reconnaissance",
    severity: "Medium",
    probability: 8,
    duration: 12,

    traffic: {
      basePackets: 2400,
      peakPackets: 3600,

      maliciousPercent: {
        min: 10,
        max: 25,
      },

      throughput: {
        min: 450,
        max: 650,
      },
    },

    ai: {
      confidence: {
        min: 92,
        max: 98,
      },
    },

    action: "Investigating",
  },

  {
    id: "ftp",
    name: "FTP Patator",
    category: "Brute Force",
    severity: "High",
    probability: 6,
    duration: 12,

    traffic: {
      basePackets: 2800,
      peakPackets: 4300,

      maliciousPercent: {
        min: 25,
        max: 50,
      },

      throughput: {
        min: 600,
        max: 850,
      },
    },

    ai: {
      confidence: {
        min: 94,
        max: 99,
      },
    },

    action: "Blocked",
  },

  {
    id: "ssh",
    name: "SSH Patator",
    category: "Brute Force",
    severity: "High",
    probability: 6,
    duration: 12,

    traffic: {
      basePackets: 2600,
      peakPackets: 4100,

      maliciousPercent: {
        min: 22,
        max: 45,
      },

      throughput: {
        min: 550,
        max: 820,
      },
    },

    ai: {
      confidence: {
        min: 94,
        max: 99,
      },
    },

    action: "Blocked",
  },

  {
    id: "web-bruteforce",
    name: "Web Attack Brute Force",
    category: "Web Attack",
    severity: "High",
    probability: 5,
    duration: 12,

    traffic: {
      basePackets: 2500,
      peakPackets: 3800,

      maliciousPercent: {
        min: 25,
        max: 55,
      },

      throughput: {
        min: 500,
        max: 750,
      },
    },

    ai: {
      confidence: {
        min: 93,
        max: 99,
      },
    },

    action: "Blocked",
  },

  {
    id: "xss",
    name: "Web Attack XSS",
    category: "Web Attack",
    severity: "High",
    probability: 4,
    duration: 12,

    traffic: {
      basePackets: 2400,
      peakPackets: 3400,

      maliciousPercent: {
        min: 30,
        max: 60,
      },

      throughput: {
        min: 450,
        max: 650,
      },
    },

    ai: {
      confidence: {
        min: 94,
        max: 99,
      },
    },

    action: "Mitigated",
  },

  {
    id: "sql",
    name: "SQL Injection",
    category: "Web Attack",
    severity: "Critical",
    probability: 4,
    duration: 12,

    traffic: {
      basePackets: 2300,
      peakPackets: 3300,

      maliciousPercent: {
        min: 40,
        max: 75,
      },

      throughput: {
        min: 450,
        max: 650,
      },
    },

    ai: {
      confidence: {
        min: 96,
        max: 99.8,
      },
    },

    action: "Mitigated",
  },

  {
    id: "goldeneye",
    name: "DoS GoldenEye",
    category: "DoS",
    severity: "High",
    probability: 5,
    duration: 14,

    traffic: {
      basePackets: 3500,
      peakPackets: 6200,

      maliciousPercent: {
        min: 40,
        max: 70,
      },

      throughput: {
        min: 700,
        max: 950,
      },
    },

    ai: {
      confidence: {
        min: 96,
        max: 99.6,
      },
    },

    action: "Blocked",
  },

  {
    id: "hulk",
    name: "DoS Hulk",
    category: "DoS",
    severity: "Critical",
    probability: 5,
    duration: 14,

    traffic: {
      basePackets: 4200,
      peakPackets: 8500,

      maliciousPercent: {
        min: 70,
        max: 95,
      },

      throughput: {
        min: 850,
        max: 980,
      },
    },

    ai: {
      confidence: {
        min: 98,
        max: 99.9,
      },
    },

    action: "Mitigated",
  },

  {
    id: "slowloris",
    name: "DoS Slowloris",
    category: "DoS",
    severity: "High",
    probability: 4,
    duration: 12,

    traffic: {
      basePackets: 2800,
      peakPackets: 5000,

      maliciousPercent: {
        min: 35,
        max: 65,
      },

      throughput: {
        min: 550,
        max: 780,
      },
    },

    ai: {
      confidence: {
        min: 94,
        max: 99,
      },
    },

    action: "Blocked",
  },

  {
    id: "slowhttptest",
    name: "DoS SlowHTTPTest",
    category: "DoS",
    severity: "High",
    probability: 4,
    duration: 12,

    traffic: {
      basePackets: 3000,
      peakPackets: 5400,

      maliciousPercent: {
        min: 40,
        max: 70,
      },

      throughput: {
        min: 600,
        max: 820,
      },
    },

    ai: {
      confidence: {
        min: 94,
        max: 99,
      },
    },

    action: "Blocked",
  },

  {
    id: "ddos",
    name: "DDoS",
    category: "Distributed Attack",
    severity: "Critical",
    probability: 5,
    duration: 16,

    traffic: {
      basePackets: 5000,
      peakPackets: 12000,

      maliciousPercent: {
        min: 82,
        max: 98,
      },

      throughput: {
        min: 900,
        max: 1000,
      },
    },

    ai: {
      confidence: {
        min: 98,
        max: 99.95,
      },
    },

    action: "Quarantined",
  },

  {
    id: "bot",
    name: "Bot",
    category: "Botnet",
    severity: "Medium",
    probability: 5,
    duration: 12,

    traffic: {
      basePackets: 2600,
      peakPackets: 3900,

      maliciousPercent: {
        min: 15,
        max: 35,
      },

      throughput: {
        min: 500,
        max: 700,
      },
    },

    ai: {
      confidence: {
        min: 90,
        max: 97,
      },
    },

    action: "Investigating",
  },

  {
    id: "infiltration",
    name: "Infiltration",
    category: "Infiltration",
    severity: "Critical",
    probability: 3,
    duration: 14,

    traffic: {
      basePackets: 2500,
      peakPackets: 4200,

      maliciousPercent: {
        min: 30,
        max: 65,
      },

      throughput: {
        min: 500,
        max: 760,
      },
    },

    ai: {
      confidence: {
        min: 95,
        max: 99.5,
      },
    },

    action: "Quarantined",
  },

  {
    id: "heartbleed",
    name: "Heartbleed",
    category: "Web / Exploitation",
    severity: "Critical",
    probability: 2,
    duration: 10,

    traffic: {
      basePackets: 2200,
      peakPackets: 3400,

      maliciousPercent: {
        min: 35,
        max: 70,
      },

      throughput: {
        min: 450,
        max: 650,
      },
    },

    ai: {
      confidence: {
        min: 96,
        max: 99.8,
      },
    },

    action: "Mitigated",
  },
];
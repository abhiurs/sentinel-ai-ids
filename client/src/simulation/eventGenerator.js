// eventGenerator.js


// ============================================================
// CURRENT TIME
// ============================================================

function currentTime() {
  return new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}


// ============================================================
// ATTACK-SPECIFIC SECURITY LOG MESSAGES
// ============================================================

const attackLogs = {

  // ----------------------------------------------------------
  // BENIGN TRAFFIC
  // ----------------------------------------------------------

  "Benign Traffic": {

    Starting: [
      "Normal network traffic detected",
      "Monitoring baseline network activity",
    ],

    Growing: [
      "Network traffic within expected range",
      "Analyzing normal packet flow",
    ],

    Peak: [
      "Benign traffic operating normally",
      "No malicious activity detected",
    ],

    Recovery: [
      "Traffic returning to baseline",
      "Normal network activity maintained",
    ],

  },


  // ----------------------------------------------------------
  // PORT SCAN
  // ----------------------------------------------------------

  "Port Scan": {

    Starting: [
      "Host enumeration detected",
      "Reconnaissance activity observed",
    ],

    Growing: [
      "Multiple ports being scanned",
      "Scanning frequency increasing",
    ],

    Peak: [
      "Port scan confirmed",
      "Reconnaissance activity blocked",
    ],

    Recovery: [
      "Scanning activity stopped",
      "Reconnaissance threat contained",
    ],

  },


  // ----------------------------------------------------------
  // FTP PATATOR
  // ----------------------------------------------------------

  "FTP Patator": {

    Starting: [
      "Multiple FTP authentication attempts detected",
      "Unusual FTP login activity observed",
    ],

    Growing: [
      "FTP login attempts increasing",
      "Repeated authentication failures detected",
    ],

    Peak: [
      "FTP brute-force attack confirmed",
      "Excessive FTP authentication attempts blocked",
    ],

    Recovery: [
      "FTP attack activity declining",
      "FTP authentication threat contained",
    ],

  },


  // ----------------------------------------------------------
  // SSH PATATOR
  // ----------------------------------------------------------

  "SSH Patator": {

    Starting: [
      "Suspicious SSH authentication activity detected",
      "Multiple SSH login attempts observed",
    ],

    Growing: [
      "SSH authentication attempts increasing",
      "Repeated SSH login failures detected",
    ],

    Peak: [
      "SSH brute-force attack confirmed",
      "Malicious SSH authentication attempts blocked",
    ],

    Recovery: [
      "SSH attack activity declining",
      "SSH authentication threat contained",
    ],

  },


  // ----------------------------------------------------------
  // WEB ATTACK - BRUTE FORCE
  // ----------------------------------------------------------

  "Web Attack Brute Force": {

    Starting: [
      "Suspicious web authentication activity detected",
      "Multiple web login attempts observed",
    ],

    Growing: [
      "Web authentication attempts increasing",
      "Repeated web login failures detected",
    ],

    Peak: [
      "Web brute-force attack confirmed",
      "Malicious authentication requests blocked",
    ],

    Recovery: [
      "Web attack activity declining",
      "Web authentication threat contained",
    ],

  },


  // ----------------------------------------------------------
  // WEB ATTACK - XSS
  // ----------------------------------------------------------

  "Web Attack XSS": {

    Starting: [
      "Suspicious web request detected",
      "Potential cross-site scripting activity observed",
    ],

    Growing: [
      "XSS payload pattern identified",
      "Suspicious script injection attempts increasing",
    ],

    Peak: [
      "Cross-site scripting attack confirmed",
      "Malicious XSS request blocked",
    ],

    Recovery: [
      "XSS activity declining",
      "Web application threat mitigated",
    ],

  },


  // ----------------------------------------------------------
  // SQL INJECTION
  // ----------------------------------------------------------

  "SQL Injection": {

    Starting: [
      "Suspicious HTTP request detected",
      "Potential SQL injection activity observed",
    ],

    Growing: [
      "SQL payload identified",
      "Database attack signatures matched",
    ],

    Peak: [
      "SQL Injection attack confirmed",
      "Malicious database request blocked",
    ],

    Recovery: [
      "Web application secured",
      "SQL injection threat mitigated",
    ],

  },


  // ----------------------------------------------------------
  // DOS GOLDENEYE
  // ----------------------------------------------------------

  "DoS GoldenEye": {

    Starting: [
      "Abnormal HTTP traffic increase detected",
      "Potential denial-of-service activity observed",
    ],

    Growing: [
      "HTTP request volume increasing rapidly",
      "GoldenEye attack pattern detected",
    ],

    Peak: [
      "DoS GoldenEye attack confirmed",
      "Malicious HTTP traffic blocked",
    ],

    Recovery: [
      "DoS traffic declining",
      "Network traffic returning to baseline",
    ],

  },


  // ----------------------------------------------------------
  // DOS HULK
  // ----------------------------------------------------------

  "DoS Hulk": {

    Starting: [
      "High-volume HTTP traffic detected",
      "Potential HTTP flood activity observed",
    ],

    Growing: [
      "HTTP request rate increasing rapidly",
      "DoS Hulk attack signature detected",
    ],

    Peak: [
      "DoS Hulk attack confirmed",
      "High-volume malicious traffic blocked",
    ],

    Recovery: [
      "HTTP flood activity declining",
      "Network traffic stabilizing",
    ],

  },


  // ----------------------------------------------------------
  // DOS SLOWLORIS
  // ----------------------------------------------------------

  "DoS Slowloris": {

    Starting: [
      "Abnormal persistent HTTP connections detected",
      "Potential Slowloris activity observed",
    ],

    Growing: [
      "Long-lived HTTP connections increasing",
      "Slowloris attack pattern identified",
    ],

    Peak: [
      "DoS Slowloris attack confirmed",
      "Suspicious persistent connections blocked",
    ],

    Recovery: [
      "Persistent connection activity declining",
      "Web service traffic stabilizing",
    ],

  },


  // ----------------------------------------------------------
  // DOS SLOWHTTPTEST
  // ----------------------------------------------------------

  "DoS SlowHTTPTest": {

    Starting: [
      "Slow HTTP request activity detected",
      "Potential application-layer DoS observed",
    ],

    Growing: [
      "Slow HTTP connections increasing",
      "SlowHTTPTest attack pattern identified",
    ],

    Peak: [
      "DoS SlowHTTPTest attack confirmed",
      "Malicious slow HTTP connections blocked",
    ],

    Recovery: [
      "Slow HTTP activity declining",
      "Application traffic returning to normal",
    ],

  },


  // ----------------------------------------------------------
  // DDOS
  // ----------------------------------------------------------

  "DDoS": {

    Starting: [
      "Unusual distributed traffic increase detected",
      "Monitoring abnormal packet growth",
      "Traffic baseline exceeded",
    ],

    Growing: [
      "DDoS signatures identified",
      "Incoming packets increasing rapidly",
      "Potential volumetric attack detected",
    ],

    Peak: [
      "Critical distributed traffic flood detected",
      "DDoS mitigation activated",
      "Malicious traffic blocked",
    ],

    Recovery: [
      "DDoS traffic returning to baseline",
      "Attack mitigation successful",
      "Network stabilized",
    ],

  },


  // ----------------------------------------------------------
  // BOT
  // ----------------------------------------------------------

  "Bot": {

    Starting: [
      "Suspicious automated traffic detected",
      "Potential bot activity observed",
    ],

    Growing: [
      "Automated communication pattern identified",
      "Bot-like network behavior increasing",
    ],

    Peak: [
      "Bot activity confirmed",
      "Suspicious automated traffic contained",
    ],

    Recovery: [
      "Bot activity declining",
      "Automated traffic threat contained",
    ],

  },


  // ----------------------------------------------------------
  // INFILTRATION
  // ----------------------------------------------------------

  "Infiltration": {

    Starting: [
      "Suspicious internal network activity detected",
      "Potential system infiltration observed",
    ],

    Growing: [
      "Abnormal internal communication increasing",
      "Infiltration behavior identified",
    ],

    Peak: [
      "Network infiltration confirmed",
      "Suspicious host activity isolated",
    ],

    Recovery: [
      "Infiltration activity declining",
      "Affected network activity contained",
    ],

  },


  // ----------------------------------------------------------
  // HEARTBLEED
  // ----------------------------------------------------------

  "Heartbleed": {

    Starting: [
      "Suspicious TLS activity detected",
      "Potential Heartbleed exploitation observed",
    ],

    Growing: [
      "Abnormal TLS memory request pattern identified",
      "Heartbleed attack signature detected",
    ],

    Peak: [
      "Heartbleed exploitation confirmed",
      "Malicious TLS activity blocked",
    ],

    Recovery: [
      "Heartbleed activity declining",
      "TLS exploitation threat mitigated",
    ],

  },

};


// ============================================================
// FALLBACK LOG
// ============================================================

const Default = {

  Starting: [
    "Monitoring network traffic",
  ],

  Growing: [
    "Analyzing network packets",
  ],

  Peak: [
    "Suspicious network activity detected",
  ],

  Recovery: [
    "Network activity stabilizing",
  ],

};


// ============================================================
// RANDOM MESSAGE
// ============================================================

function random(list) {

  if (!list || list.length === 0) {
    return "Network activity detected";
  }

  return list[
    Math.floor(
      Math.random() * list.length
    )
  ];
}


// ============================================================
// GENERATE SECURITY LOG
// ============================================================

export function generateLog(
  traffic,
  attackState
) {

  const attack =
    attackLogs[
      attackState.type
    ] || Default;


  const messages =
    attack[
      attackState.phase
    ] || attack.Starting;


  return {

    id:
      crypto.randomUUID(),

    time:
      currentTime(),

    attack:
      attackState.type,

    severity:
      attackState.severity,

    phase:
      attackState.phase,

    message:
      random(messages),

    status:
      attackState.phase === "Recovery"
        ? "Resolved"
        : attackState.type === "Benign Traffic"
          ? "Monitoring"
          : "Active",

  };

}


// ============================================================
// GENERATE ALERT
// ============================================================

export function generateAlert(
  traffic,
  attackState
) {

  return {

    id:
      crypto.randomUUID(),

    time:
      currentTime(),

    attack:
      attackState.type,

    severity:
      attackState.severity,

    phase:
      attackState.phase,

    status:
      attackState.type === "Benign Traffic"
        ? "Monitoring"
        : attackState.phase === "Recovery"
          ? "Resolved"
          : "Investigating",

  };

}
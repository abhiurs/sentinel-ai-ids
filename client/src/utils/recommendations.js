export function getRecommendations(result) {
  if (!result) return [];

  if (result.prediction === "Benign") {
    return [
      "No malicious traffic detected.",
      "Continue real-time network monitoring.",
      "Keep IDS signatures and detection models updated.",
      "Schedule periodic vulnerability assessments.",
      "Maintain regular security log reviews.",
    ];
  }

  if (result.severity === "Low") {
    return [
      "Monitor suspicious network activity.",
      "Review recent firewall and IDS logs.",
      "Verify source and destination IP addresses.",
      "Increase monitoring for repeated events.",
      "Document the incident for future analysis.",
    ];
  }

  if (result.severity === "Medium") {
    return [
      "Investigate suspicious traffic immediately.",
      "Inspect affected endpoints for compromise.",
      "Review firewall and IDS alerts.",
      "Monitor lateral movement within the network.",
      "Notify the SOC team if activity increases.",
    ];
  }

  if (result.severity === "High") {
    return [
      "Immediately isolate affected systems.",
      "Block malicious IP addresses.",
      "Enable IPS mitigation rules.",
      "Perform forensic investigation.",
      "Notify the Security Operations Center.",
    ];
  }

  if (result.severity === "Critical") {
    return [
      "Initiate incident response immediately.",
      "Disconnect compromised hosts from the network.",
      "Contain the attack to prevent lateral movement.",
      "Begin forensic evidence collection.",
      "Escalate to senior security personnel.",
    ];
  }

  return [
    "Continue monitoring network activity.",
    "Review overall security posture.",
  ];
}
// incidentResponse.js

const playbooks = {

  "DDoS": {
    mitreId: "T1498",
    tactic: "Impact",

    steps: [
      "Detect abnormal traffic",
      "Identify attack source",
      "Enable rate limiting",
      "Deploy firewall mitigation",
      "Restore normal traffic",
    ],
  },

  "Port Scan": {
    mitreId: "T1046",
    tactic: "Discovery",

    steps: [
      "Detect scanning activity",
      "Identify source host",
      "Block suspicious IP",
      "Increase firewall logging",
      "Resume monitoring",
    ],
  },

  "SQL Injection": {
    mitreId: "T1190",
    tactic: "Initial Access",

    steps: [
      "Detect SQL payload",
      "Block malicious request",
      "Enable WAF protection",
      "Review database logs",
      "Verify application integrity",
    ],
  },

  "FTP Patator": {
    mitreId: "T1110",
    tactic: "Credential Access",

    steps: [
      "Detect brute-force attack",
      "Lock compromised account",
      "Block attacker IP",
      "Notify administrator",
      "Restore authentication",
    ],
  },

  Normal: {

    mitreId: "--",

    tactic: "Monitoring",

    steps: [
      "Monitor traffic",
      "Verify baseline",
      "Review logs",
      "Check system health",
      "Continue monitoring",
    ],

  }

};

export function generateIncidentResponse(attackState) {

  const playbook =
    playbooks[attackState.type] ||
    playbooks.Normal;

  const progress =
    Math.round(
      attackState.progress * 100
    );

  // Determine how many steps are complete
  const completed =
    Math.floor(
      (progress / 100) *
      playbook.steps.length
    );

  const steps =
    playbook.steps.map((step,index)=>({

      title: step,

      completed:
        index < completed,

      active:
        index === completed,

    }));

  let status="Monitoring";

  switch(attackState.phase){

    case "Starting":
      status="Detecting";
      break;

    case "Growing":
      status="Investigating";
      break;

    case "Peak":
      status="Responding";
      break;

    case "Recovery":
      status="Recovering";
      break;

    default:
      status="Monitoring";

  }

  return{

    attack:attackState.type,

    severity:attackState.severity,

    phase:attackState.phase,

    status,

    mitreId:playbook.mitreId,

    tactic:playbook.tactic,

    progress,

    remainingTime:
      attackState.duration-
      attackState.elapsed,

    steps,

  };

}
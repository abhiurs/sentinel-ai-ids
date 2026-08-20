// healthGenerator.js

const random = (min, max) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

// Convert uptime seconds into HH:MM:SS
function formatUptime(seconds) {
  const hrs = String(Math.floor(seconds / 3600)).padStart(2, "0");
  const mins = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
  const secs = String(seconds % 60).padStart(2, "0");

  return `${hrs}:${mins}:${secs}`;
}

// Generates the system health object
export function generateHealth(uptimeSeconds) {
  return {
    packetCapture: {
      status: "Running",
      uptime: formatUptime(uptimeSeconds),
    },

    aiEngine: {
      status: "Loaded",
      memory: random(380, 420), // MB
    },

    firewall: {
      status: "Protected",
      rules: random(150, 160),
    },

    database: {
      status: "Connected",
      latency: random(2, 8), // ms
    },

    apiServer: {
      status: "Online",
      latency: random(5, 15), // ms
    },
  };
}
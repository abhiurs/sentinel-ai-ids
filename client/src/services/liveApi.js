import api from "../api/api";

// ============================================================
// LOCAL SENSOR AGENT
// ============================================================

const LOCAL_AGENT_URL = "http://127.0.0.1:8765";

export const startCapture = async () => {
  const res = await fetch(`${LOCAL_AGENT_URL}/start`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    throw new Error(`Local sensor start failed: HTTP ${res.status}`);
  }

  return res.json();
};

export const stopCapture = async () => {
  const res = await fetch(`${LOCAL_AGENT_URL}/stop`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    throw new Error(`Local sensor stop failed: HTTP ${res.status}`);
  }

  return res.json();
};

export const getLocalAgentStatus = async () => {
  const res = await fetch(`${LOCAL_AGENT_URL}/status`);

  if (!res.ok) {
    throw new Error(`Local sensor status failed: HTTP ${res.status}`);
  }

  return res.json();
};

// ============================================================
// RENDER BACKEND - LIVE DATA
// ============================================================

export const getStatus = async () => {
  const res = await api.get("/live/status");
  return res.data;
};

export const getPackets = async () => {
  const res = await api.get("/live/packets");
  return res.data;
};

export const getDetections = async () => {
  const res = await api.get("/live/detections");
  return res.data;
};

// ============================================================
// RENDER BACKEND - MODEL CONTROL
// ============================================================

export const getModel = async () => {
  const res = await api.get("/live/model");
  return res.data;
};

export const setModel = async (model) => {
  const res = await api.post("/live/model", {
    model,
  });

  return res.data;
};

// ============================================================
// RENDER BACKEND - CLEAR LIVE DATA
// ============================================================

export const clearPackets = async () => {
  const res = await api.post("/live/clear");
  return res.data;
};
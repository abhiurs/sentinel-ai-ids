import api from "../api/api";

export const startCapture = async () => {
  const res = await api.post("/live/start");
  return res.data;
};

export const stopCapture = async () => {
  const res = await api.post("/live/stop");
  return res.data;
};

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

export const getModel = async () => {
  const res = await api.get("/live/model");
  return res.data;
};

export const setModel = async (model) => {
  const res = await api.post("/live/model", { model });
  return res.data;
};

export const clearPackets = async () => {
  const res = await api.post("/live/clear");
  return res.data;
};
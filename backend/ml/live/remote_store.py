from collections import deque
from threading import Lock
import time


class RemoteLiveStore:

    def __init__(self, max_packets=100, max_detections=100):

        self._packets = deque(maxlen=max_packets)
        self._detections = deque(maxlen=max_detections)

        self._lock = Lock()

        self.last_sensor_update = 0.0

        self.selected_model = "Auto"
        self.model_used = "XGBoost"

    # ==========================================================
    # UPDATE DATA FROM LOCAL SENSOR
    # ==========================================================

    def update(
        self,
        packets=None,
        detections=None,
        selected_model="Auto",
        model_used="XGBoost",
    ):

        with self._lock:

            self._packets.clear()
            self._packets.extend(packets or [])

            self._detections.clear()
            self._detections.extend(detections or [])

            self.selected_model = selected_model
            self.model_used = model_used

            self.last_sensor_update = time.time()

    # ==========================================================
    # PACKETS
    # ==========================================================

    def get_packets(self):

        with self._lock:
            return list(self._packets)

    # ==========================================================
    # DETECTIONS
    # ==========================================================

    def get_detections(self):

        with self._lock:
            return list(self._detections)

    # ==========================================================
    # STATUS
    # ==========================================================

    def status(self):

        with self._lock:

            last_update = self.last_sensor_update

            packet_count = len(self._packets)
            detection_count = len(self._detections)

            selected_model = self.selected_model
            model_used = self.model_used

        sensor_running = last_update > 0 and (time.time() - last_update) < 5

        return {
            "running": sensor_running,
            "captured_packets": packet_count,
            "active_flows": 0,
            "detections": detection_count,
            "dataset": "CICIDS2017",
            "features": 77,
            "selected_model": selected_model,
            "model_used": model_used,
        }

    # ==========================================================
    # MODEL
    # ==========================================================

    def get_model(self):

        with self._lock:

            return {
                "selected_model": self.selected_model,
                "model_used": self.model_used,
            }

    # ==========================================================
    # CLEAR
    # ==========================================================

    def clear(self):

        with self._lock:

            self._packets.clear()
            self._detections.clear()

            self.last_sensor_update = 0.0


remote_live_store = RemoteLiveStore()

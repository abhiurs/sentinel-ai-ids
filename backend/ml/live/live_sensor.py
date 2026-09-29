import os
import sys
import time
import requests
from dotenv import load_dotenv

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.abspath(os.path.join(CURRENT_DIR, "..", ".."))
PROJECT_DIR = os.path.abspath(os.path.join(BACKEND_DIR, ".."))

if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

load_dotenv(os.path.join(BACKEND_DIR, ".env"))

from ml.live.packet_capture import live_capture
from ml.live.packet_store import packet_store

RENDER_API_URL = os.getenv(
    "LIVE_SENSOR_API_URL",
    "https://sentinel-ai-ids-backend.onrender.com",
).rstrip("/")
LIVE_SENSOR_KEY = os.getenv("LIVE_SENSOR_KEY")


def sensor_headers():
    return {
        "X-Live-Sensor-Key": LIVE_SENSOR_KEY,
        "Content-Type": "application/json",
    }


def reset_remote_model():
    try:
        response = requests.post(
            f"{RENDER_API_URL}/api/live/sensor/start",
            headers=sensor_headers(),
            timeout=10,
        )
        if response.status_code == 200:
            result = response.json()
            live_capture.set_model(result.get("selected_model", "Auto"))
            print(
                "[SENSOR] Model initialized:",
                result.get("selected_model", "Auto"),
                "->",
                result.get("model_used", "XGBoost"),
            )
            return True
        print(
            "[SENSOR] Model initialization failed:", response.status_code, response.text
        )
    except requests.RequestException as error:
        print("[SENSOR] Model initialization connection error:", error)
    return False


def sync_remote_model():
    try:
        response = requests.get(
            f"{RENDER_API_URL}/api/live/sensor/model",
            headers=sensor_headers(),
            timeout=10,
        )
        if response.status_code != 200:
            print("[SENSOR] Model sync failed:", response.status_code, response.text)
            return False

        result = response.json()
        selected_model = result.get("selected_model", "Auto")
        model_used = result.get("model_used", "XGBoost")
        current = live_capture.get_selected_model()

        if current.get("selected_model") != selected_model:
            changed = live_capture.set_model(selected_model)
            if changed.get("success"):
                print("[SENSOR] Model changed:", selected_model, "->", model_used)
            else:
                print(
                    "[SENSOR] Could not apply model:",
                    changed.get("message", "Unknown error"),
                )
        return True
    except requests.RequestException as error:
        print("[SENSOR] Model sync connection error:", error)
    return False


def send_live_data():
    packets = packet_store.get_all()
    detections = live_capture.get_detections()
    model_info = live_capture.get_selected_model()

    payload = {
        "packets": packets,
        "detections": detections,
        # Informational only. Backend does not use these fields to
        # overwrite the model selected from the dashboard.
        "selected_model": model_info.get("selected_model", "Auto"),
        "model_used": model_info.get("model_used", "XGBoost"),
    }

    try:
        response = requests.post(
            f"{RENDER_API_URL}/api/live/ingest",
            json=payload,
            headers=sensor_headers(),
            timeout=10,
        )
        if response.status_code == 200:
            result = response.json()
            print(
                "[SENSOR] Sent:",
                result.get("packets", 0),
                "packets |",
                result.get("detections", 0),
                "detections | Model:",
                result.get("model_used", model_info.get("model_used", "XGBoost")),
            )
            return True
        print("[SENSOR] Server returned:", response.status_code, response.text)
    except requests.RequestException as error:
        print("[SENSOR] Connection error:", error)
    return False


def main():
    print()
    print("=" * 60)
    print("SENTINEL AI IDS - LOCAL LIVE SENSOR")
    print("=" * 60)
    print("Backend:", RENDER_API_URL)
    print("Dataset: CICIDS2017")
    print("Features: 77")
    print("Model: Auto -> XGBoost")
    print("=" * 60)
    print()

    if not LIVE_SENSOR_KEY:
        print("[SENSOR] ERROR: LIVE_SENSOR_KEY is not configured.")
        return

    # Every fresh sensor session starts with Auto -> XGBoost.
    if not reset_remote_model():
        print("[SENSOR] Could not initialize the remote live model.")
        return

    started = live_capture.start()
    if not started:
        print("[SENSOR] Could not start live capture.")
        return

    print("[SENSOR] Local packet capture started.")
    print("[SENSOR] Monitoring Windows network traffic...")
    print("[SENSOR] Model selection is controlled from the dashboard.")
    print()

    try:
        while True:
            sync_remote_model()
            send_live_data()
            time.sleep(1)
    except KeyboardInterrupt:
        print()
        print("[SENSOR] Stopping...")
    finally:
        live_capture.stop()
        print("[SENSOR] Sensor stopped.")


if __name__ == "__main__":
    main()

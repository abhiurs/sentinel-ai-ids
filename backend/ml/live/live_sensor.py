import os
import sys
import time

import requests
from dotenv import load_dotenv

# ==========================================================
# PATH SETUP
# ==========================================================

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))

BACKEND_DIR = os.path.abspath(
    os.path.join(
        CURRENT_DIR,
        "..",
        "..",
    )
)

PROJECT_DIR = os.path.abspath(
    os.path.join(
        BACKEND_DIR,
        "..",
    )
)

if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)


# ==========================================================
# ENVIRONMENT
# ==========================================================

load_dotenv(
    os.path.join(
        BACKEND_DIR,
        ".env",
    )
)


def sync_model(reset_to_auto=False):
    """
    Synchronize the local sensor's ML model with the
    model selected on the Render backend.

    If reset_to_auto=True, the remote live session
    starts with Auto -> XGBoost.
    """

    try:
        payload = {
            "packets": [],
            "detections": [],
            "reset_model": reset_to_auto,
        }

        response = requests.post(
            f"{RENDER_API_URL}/api/live/ingest",
            json=payload,
            headers={
                "X-Live-Sensor-Key": LIVE_SENSOR_KEY,
                "Content-Type": "application/json",
            },
            timeout=10,
        )

        if response.status_code != 200:
            print("[SENSOR] Model sync failed:", response.status_code, response.text)
            return False

        result = response.json()

        selected_model = result.get("selected_model", "Auto")

        model_used = result.get("model_used", "XGBoost")

        model_result = live_capture.set_model(selected_model)

        if not model_result.get("success"):
            print("[SENSOR] Could not apply model:", model_result.get("message"))
            return False

        print("[SENSOR] Model:", selected_model, "->", model_used)

        return True

    except requests.RequestException as error:
        print("[SENSOR] Model sync connection error:", error)
        return False


# ==========================================================
# EXISTING IDS COMPONENTS
# ==========================================================

from ml.live.packet_capture import live_capture
from ml.live.packet_store import packet_store

# ==========================================================
# CONFIGURATION
# ==========================================================

RENDER_API_URL = os.getenv(
    "LIVE_SENSOR_API_URL",
    "https://sentinel-ai-ids-backend.onrender.com",
).rstrip("/")

LIVE_SENSOR_KEY = os.getenv("LIVE_SENSOR_KEY")


# ==========================================================
# SEND DATA TO RENDER
# ==========================================================


def send_live_data():

    packets = packet_store.get_all()

    detections = live_capture.get_detections()

    payload = {
        "packets": packets,
        "detections": detections,
    }

    try:

        response = requests.post(
            f"{RENDER_API_URL}/api/live/ingest",
            json=payload,
            headers={
                "X-Live-Sensor-Key": LIVE_SENSOR_KEY,
                "Content-Type": "application/json",
            },
            timeout=10,
        )

        if response.status_code == 200:
            result = response.json()

            selected_model = result.get("selected_model", "Auto")

            current_model = live_capture.get_selected_model().get(
                "selected_model", "Auto"
            )

            # Dashboard changed the model.
            if selected_model != current_model:

                model_result = live_capture.set_model(selected_model)

                if model_result.get("success"):
                    print(
                        "[SENSOR] Model changed:",
                        model_result["selected_model"],
                        "->",
                        model_result["model_used"],
                    )
                else:
                    print("[SENSOR] Model change failed:", model_result.get("message"))

            print(
                "[SENSOR] Sent:",
                result.get("packets", 0),
                "packets |",
                result.get("detections", 0),
                "detections | Model:",
                result.get("model_used", "XGBoost"),
            )

            return True

        print(
            "[SENSOR] Server returned:",
            response.status_code,
            response.text,
        )

    except requests.RequestException as error:

        print(
            "[SENSOR] Connection error:",
            error,
        )

    return False


# ==========================================================
# MAIN
# ==========================================================


def main():

    print()
    print("=" * 60)
    print("SENTINEL AI IDS - LOCAL LIVE SENSOR")
    print("=" * 60)
    print(
        "Backend:",
        RENDER_API_URL,
    )
    print("Dataset: CICIDS2017")
    print("Features: 77")
    print("Model: Auto -> XGBoost")
    print("=" * 60)
    print()

    if not LIVE_SENSOR_KEY:
        print("[SENSOR] ERROR: LIVE_SENSOR_KEY is not configured.")
        return

    # Start every new live session in Auto mode.
    # Auto currently maps to XGBoost.
    if not sync_model(reset_to_auto=True):
        print("[SENSOR] Could not initialize the remote live session.")
        return

    # ------------------------------------------------------
    # Start the EXISTING Scapy + ML pipeline locally
    # ------------------------------------------------------

    started = live_capture.start()

    if not started:

        print("[SENSOR] Could not start live capture.")

        return

    print("[SENSOR] Local packet capture started.")

    print("[SENSOR] Monitoring Windows network traffic...")

    print("[SENSOR] Dashboard controls model selection.")

    print()

    try:

        while True:

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

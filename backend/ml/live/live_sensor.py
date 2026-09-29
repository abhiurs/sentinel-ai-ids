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

    model_info = live_capture.get_selected_model()

    payload = {
        "packets": packets,
        "detections": detections,
        "selected_model": model_info.get(
            "selected_model",
            "Auto",
        ),
        "model_used": model_info.get(
            "model_used",
            "XGBoost",
        ),
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

            print(
                "[SENSOR] Sent:",
                result.get("packets", 0),
                "packets |",
                result.get("detections", 0),
                "detections",
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
    print(
        "Model:",
        live_capture.get_selected_model()["model_used"],
    )
    print("=" * 60)
    print()

    if not LIVE_SENSOR_KEY:

        print("[SENSOR] ERROR:" " LIVE_SENSOR_KEY is not configured.")

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

import os
import sys
import threading
import time

from flask import Flask, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

# ==========================================================
# PATH CONFIGURATION
# ==========================================================

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.abspath(os.path.join(CURRENT_DIR, "..", ".."))

if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)


# ==========================================================
# ENVIRONMENT
# ==========================================================

load_dotenv(os.path.join(BACKEND_DIR, ".env"))


# ==========================================================
# EXISTING SENTINEL COMPONENTS
# ==========================================================

from ml.live.live_sensor import sync_model, send_live_data
from ml.live.packet_capture import live_capture

# ==========================================================
# FLASK LOCAL AGENT
# ==========================================================

app = Flask(__name__)

CORS(
    app,
    resources={
        r"/*": {
            "origins": [
                "http://localhost:5173",
                "http://127.0.0.1:5173",
                "https://sentinel-ai-ids-frontend.onrender.com",
            ]
        }
    },
)


# ==========================================================
# SENSOR STATE
# ==========================================================

sensor_lock = threading.Lock()

sensor_running = False
sensor_thread = None


# ==========================================================
# SENSOR WORKER
# ==========================================================


def sensor_worker():
    global sensor_running

    print("[AGENT] Sensor worker started.")

    while True:
        with sensor_lock:
            if not sensor_running:
                break

        try:
            send_live_data()
        except Exception as error:
            print("[AGENT] Sensor data error:", error)

        time.sleep(1)

    print("[AGENT] Sensor worker stopped.")


# ==========================================================
# START SENSOR
# ==========================================================


def start_sensor():
    global sensor_running
    global sensor_thread

    with sensor_lock:

        if sensor_running:
            return {
                "success": True,
                "running": True,
                "message": "Local live sensor is already running.",
            }

        print("[AGENT] Starting local live sensor...")

        # Every new live session starts with Auto.
        # Auto currently maps to XGBoost.
        if not sync_model(reset_to_auto=True):
            return {
                "success": False,
                "running": False,
                "message": "Could not synchronize the ML model with the backend.",
            }

        started = live_capture.start()

        if not started:
            return {
                "success": False,
                "running": False,
                "message": "Live packet capture could not be started.",
            }

        sensor_running = True

        sensor_thread = threading.Thread(
            target=sensor_worker,
            daemon=True,
            name="SentinelLiveSensor",
        )

        sensor_thread.start()

        model_info = live_capture.get_selected_model()

        print("[AGENT] Local live sensor started.")
        print(
            "[AGENT] Model:",
            model_info.get("selected_model", "Auto"),
            "->",
            model_info.get("model_used", "XGBoost"),
        )

        return {
            "success": True,
            "running": True,
            "message": "Local live sensor started.",
            "selected_model": model_info.get("selected_model", "Auto"),
            "model_used": model_info.get("model_used", "XGBoost"),
        }


# ==========================================================
# STOP SENSOR
# ==========================================================


def stop_sensor():
    global sensor_running

    with sensor_lock:

        if not sensor_running:
            return {
                "success": True,
                "running": False,
                "message": "Local live sensor is already stopped.",
            }

        print("[AGENT] Stopping local live sensor...")

        sensor_running = False

        live_capture.stop()

        print("[AGENT] Local live sensor stopped.")

        return {
            "success": True,
            "running": False,
            "message": "Local live sensor stopped.",
        }


# ==========================================================
# STATUS
# ==========================================================


@app.route("/status", methods=["GET"])
def status():
    with sensor_lock:
        running = sensor_running

    model_info = live_capture.get_selected_model()

    return jsonify(
        {
            "success": True,
            "running": running,
            "selected_model": model_info.get("selected_model", "Auto"),
            "model_used": model_info.get("model_used", "XGBoost"),
        }
    )


# ==========================================================
# START ENDPOINT
# ==========================================================


@app.route("/start", methods=["POST"])
def start():
    return jsonify(start_sensor())


# ==========================================================
# STOP ENDPOINT
# ==========================================================


@app.route("/stop", methods=["POST"])
def stop():
    return jsonify(stop_sensor())


# ==========================================================
# HEALTH CHECK
# ==========================================================


@app.route("/", methods=["GET"])
def home():
    return jsonify(
        {
            "project": "Sentinel AI IDS",
            "service": "Local Live Sensor Agent",
            "status": "Running",
        }
    )


# ==========================================================
# MAIN
# ==========================================================

if __name__ == "__main__":

    print("=" * 60)
    print("SENTINEL AI IDS - LOCAL SENSOR AGENT")
    print("=" * 60)
    print("Local Agent: http://127.0.0.1:8765")
    print("Status: READY")
    print("Packet Capture: OFF")
    print("Waiting for Live Mode...")
    print("=" * 60)

    app.run(
        host="127.0.0.1",
        port=8765,
        debug=False,
        use_reloader=False,
    )

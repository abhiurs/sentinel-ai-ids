import os

from flask import Blueprint, jsonify, request

from ml.live.packet_capture import live_capture
from ml.live.packet_store import packet_store
from ml.live.remote_store import remote_live_store
from utils.auth_middleware import token_required

live_bp = Blueprint(
    "live",
    __name__,
    url_prefix="/api/live",
)

# ==========================================================
# LOCAL SENSOR INGESTION
# ==========================================================


@live_bp.route(
    "/ingest",
    methods=["POST"],
)
def ingest_live_data():

    sensor_key = os.getenv("LIVE_SENSOR_KEY")

    received_key = request.headers.get("X-Live-Sensor-Key")

    if not sensor_key:
        return (
            jsonify(
                {
                    "success": False,
                    "message": "Live sensor is not configured",
                }
            ),
            503,
        )

    if received_key != sensor_key:
        return (
            jsonify(
                {
                    "success": False,
                    "message": "Unauthorized live sensor",
                }
            ),
            401,
        )

    data = request.get_json(silent=True)

    if not isinstance(data, dict):

        return (
            jsonify(
                {
                    "success": False,
                    "message": "Invalid JSON payload",
                }
            ),
            400,
        )

    packets = data.get("packets", [])
    detections = data.get("detections", [])

    selected_model = data.get(
        "selected_model",
        "Auto",
    )

    model_used = data.get(
        "model_used",
        "XGBoost",
    )

    if not isinstance(packets, list):
        packets = []

    if not isinstance(detections, list):
        detections = []

    remote_live_store.update(
        packets=packets,
        detections=detections,
        selected_model=selected_model,
        model_used=model_used,
    )

    return jsonify(
        {
            "success": True,
            "packets": len(packets),
            "detections": len(detections),
        }
    )


# ==========================================================
# START LIVE CAPTURE
# ==========================================================


@live_bp.route(
    "/start",
    methods=["POST"],
)
@token_required
def start_capture(payload):

    started = live_capture.start()

    return jsonify(
        {
            "success": started,
            "message": (
                "Live packet capture started"
                if started
                else "Live packet capture is already running"
            ),
            "model": live_capture.get_selected_model(),
        }
    )


# ==========================================================
# STOP LIVE CAPTURE
# ==========================================================


@live_bp.route(
    "/stop",
    methods=["POST"],
)
@token_required
def stop_capture(payload):

    stopped = live_capture.stop()

    return jsonify(
        {
            "success": stopped,
            "message": "Live packet capture stopped",
        }
    )


# ==========================================================
# LIVE CAPTURE STATUS
# ==========================================================


@live_bp.route(
    "/status",
    methods=["GET"],
)
@token_required
def capture_status(payload):

    return jsonify(remote_live_store.status())


# ==========================================================
# GET PACKETS
# ==========================================================


@live_bp.route(
    "/packets",
    methods=["GET"],
)
@token_required
def get_packets(payload):

    packets = remote_live_store.get_packets()

    return jsonify(
        {
            "count": len(packets),
            "packets": packets,
        }
    )


# ==========================================================
# GET ML DETECTIONS
# ==========================================================


@live_bp.route(
    "/detections",
    methods=["GET"],
)
@token_required
def get_detections(payload):

    detections = remote_live_store.get_detections()

    return jsonify(
        {
            "count": len(detections),
            "detections": detections,
        }
    )


# ==========================================================
# GET CURRENT MODEL
# ==========================================================


@live_bp.route(
    "/model",
    methods=["GET"],
)
@token_required
def get_model(payload):

    return jsonify(remote_live_store.get_model())


# ==========================================================
# SET MODEL
# ==========================================================


@live_bp.route(
    "/model",
    methods=["POST"],
)
@token_required
def set_model(payload):

    data = request.get_json(silent=True) or {}

    model_name = data.get("model")

    if not model_name:

        return (
            jsonify(
                {
                    "success": False,
                    "message": "Model is required",
                }
            ),
            400,
        )

    if model_name == "Auto":

        remote_live_store.selected_model = "Auto"
        remote_live_store.model_used = "XGBoost"

        return jsonify(
            {
                "success": True,
                "selected_model": "Auto",
                "model_used": "XGBoost",
            }
        )

    supported_models = [
        "Random Forest",
        "Extra Trees",
        "XGBoost",
        "Decision Tree",
        "KNN",
    ]

    if model_name not in supported_models:

        return (
            jsonify(
                {
                    "success": False,
                    "message": "Unsupported model",
                }
            ),
            400,
        )

    remote_live_store.selected_model = model_name
    remote_live_store.model_used = model_name

    return jsonify(
        {
            "success": True,
            "selected_model": model_name,
            "model_used": model_name,
        }
    )


# ==========================================================
# GET SUPPORTED MODELS
# ==========================================================


@live_bp.route(
    "/models",
    methods=["GET"],
)
@token_required
def get_models(payload):

    return jsonify(
        {
            "dataset": "CICIDS2017",
            "features": 77,
            "models": [
                "Auto",
                "Random Forest",
                "Extra Trees",
                "XGBoost",
                "Decision Tree",
                "KNN",
            ],
            "current": (live_capture.get_selected_model()),
        }
    )


# ==========================================================
# CLEAR PACKET HISTORY
# ==========================================================


@live_bp.route(
    "/clear",
    methods=["POST"],
)
@token_required
def clear_packets(payload):

    remote_live_store.clear()

    return jsonify(
        {
            "success": True,
            "message": "Packet history cleared",
        }
    )

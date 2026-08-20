from flask import Blueprint, jsonify, request

from ml.live.packet_capture import live_capture
from ml.live.packet_store import packet_store
from utils.auth_middleware import token_required

live_bp = Blueprint(
    "live",
    __name__,
    url_prefix="/api/live",
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

    return jsonify(live_capture.status())


# ==========================================================
# GET PACKETS
# ==========================================================


@live_bp.route(
    "/packets",
    methods=["GET"],
)
@token_required
def get_packets(payload):

    return jsonify(
        {
            "count": packet_store.count(),
            "packets": packet_store.get_all(),
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

    detections = live_capture.get_detections()

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

    return jsonify(live_capture.get_selected_model())


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

    result = live_capture.set_model(model_name)

    if not result["success"]:

        return jsonify(result), 400

    return jsonify(result)


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

    packet_store.clear()

    return jsonify(
        {
            "success": True,
            "message": "Packet history cleared",
        }
    )

from flask import Blueprint, jsonify
from bson import ObjectId
from bson.errors import InvalidId

from database.mongodb import db
from utils.auth_middleware import token_required

history_bp = Blueprint("history", __name__, url_prefix="/api/history")

history_collection = db["analysis_history"]


@history_bp.route("/", methods=["GET"], strict_slashes=False)
@token_required
def get_history(payload):
    """
    Return only analysis history belonging to the authenticated user.
    """
    try:
        user_id = payload["user_id"]

        reports = list(
            history_collection.find({"user_id": user_id}).sort("createdAt", -1)
        )

        for report in reports:
            report["_id"] = str(report["_id"])

        return (
            jsonify(
                {
                    "success": True,
                    "history": reports,
                }
            ),
            200,
        )

    except KeyError:
        return (
            jsonify(
                {
                    "success": False,
                    "message": "Invalid authentication payload.",
                }
            ),
            401,
        )

    except Exception:
        return (
            jsonify(
                {
                    "success": False,
                    "message": "Unable to retrieve analysis history.",
                }
            ),
            500,
        )


@history_bp.route("/<id>", methods=["GET"])
@token_required
def get_report(payload, id):
    """
    Return a single report only when it belongs to the authenticated user.
    """
    try:
        object_id = ObjectId(id)
    except (InvalidId, TypeError):
        return (
            jsonify(
                {
                    "success": False,
                    "message": "Invalid report ID.",
                }
            ),
            400,
        )

    try:
        user_id = payload["user_id"]

        report = history_collection.find_one(
            {
                "_id": object_id,
                "user_id": user_id,
            }
        )

        if not report:
            return (
                jsonify(
                    {
                        "success": False,
                        "message": "Report not found.",
                    }
                ),
                404,
            )

        report["_id"] = str(report["_id"])

        return (
            jsonify(
                {
                    "success": True,
                    "report": report,
                }
            ),
            200,
        )

    except KeyError:
        return (
            jsonify(
                {
                    "success": False,
                    "message": "Invalid authentication payload.",
                }
            ),
            401,
        )

    except Exception:
        return (
            jsonify(
                {
                    "success": False,
                    "message": "Unable to retrieve the report.",
                }
            ),
            500,
        )


@history_bp.route("/<id>", methods=["DELETE"])
@token_required
def delete_report(payload, id):
    """
    Delete a report only when it belongs to the authenticated user.
    """
    try:
        object_id = ObjectId(id)
    except (InvalidId, TypeError):
        return (
            jsonify(
                {
                    "success": False,
                    "message": "Invalid report ID.",
                }
            ),
            400,
        )

    try:
        user_id = payload["user_id"]

        result = history_collection.delete_one(
            {
                "_id": object_id,
                "user_id": user_id,
            }
        )

        if result.deleted_count == 0:
            return (
                jsonify(
                    {
                        "success": False,
                        "message": "Report not found.",
                    }
                ),
                404,
            )

        return (
            jsonify(
                {
                    "success": True,
                    "message": "Report deleted successfully.",
                }
            ),
            200,
        )

    except KeyError:
        return (
            jsonify(
                {
                    "success": False,
                    "message": "Invalid authentication payload.",
                }
            ),
            401,
        )

    except Exception:
        return (
            jsonify(
                {
                    "success": False,
                    "message": "Unable to delete the report.",
                }
            ),
            500,
        )

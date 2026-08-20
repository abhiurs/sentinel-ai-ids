from datetime import datetime
from database.mongodb import db


class AnalysisHistory:
    collection = db.analysis_history

    @staticmethod
    def create(data):
        data["createdAt"] = datetime.utcnow()
        return AnalysisHistory.collection.insert_one(data)

    @staticmethod
    def get_all():
        return list(
            AnalysisHistory.collection.find({}, {"_id": 0}).sort("createdAt", -1)
        )

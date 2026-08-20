const mongoose = require("mongoose");

const AnalysisHistorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    datasetName: {
      type: String,
      required: true,
    },

    prediction: {
      type: String,
      required: true,
    },

    confidence: {
      type: Number,
      required: true,
    },

    severity: {
      type: String,
      required: true,
    },

    packetsAnalyzed: {
      type: Number,
      required: true,
    },

    safeTraffic: {
      type: Number,
      required: true,
    },

    maliciousTraffic: {
      type: Number,
      required: true,
    },

    attackSummary: {
      type: Object,
      default: {},
    },

    severityBreakdown: {
      type: Object,
      default: {},
    },

    model: {
      type: String,
      default: "XGBoost",
    },

    analysisTime: {
      type: String,
      default: "0 sec",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "AnalysisHistory",
  AnalysisHistorySchema
);
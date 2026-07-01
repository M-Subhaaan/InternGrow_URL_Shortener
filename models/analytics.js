const mongoose = require("mongoose");

const analyticsSchema = new mongoose.Schema(
  {
    urlId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Url",
      required: true,
    },

    ipAddress: {
      type: String,
    },

    country: {
      type: String,
    },

    city: {
      type: String,
    },

    device: {
      type: String,
    },

    browser: {
      type: String,
    },
    operatingSystem: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

const Analytics = mongoose.model("Analytics", analyticsSchema);
module.exports = Analytics;

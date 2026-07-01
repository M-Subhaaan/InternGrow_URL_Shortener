const Analytics = require("../models/analytics");
const Url = require("../models/url");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

exports.getAnalytics = catchAsync(async (req, res, next) => {
  const shortCode = req.params.shortCode;

  const url = await Url.findOne({ shortCode });

  if (!url) {
    return next(AppError("Short URL not found", 404));
  }

  const [
    totalClicks,
    countryStats,
    browserStats,
    deviceStats,
    osStats,
    lastClick,
  ] = await Promise.all([
    Analytics.countDocuments({ urlId: url._id }),
    Analytics.aggregate([
      { $match: { urlId: url._id } },
      { $group: { _id: "$country", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]),
    Analytics.aggregate([
      { $match: { urlId: url._id } },
      { $group: { _id: "$browser", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]),
    Analytics.aggregate([
      { $match: { urlId: url._id } },
      { $group: { _id: "$device", count: { $sum: 1 } } },
      {
        $sort: { count: -1 },
      },
    ]),
    Analytics.aggregate([
      { $match: { urlId: url._id } },
      { $group: { _id: "$operatingSystem", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]),
    Analytics.findOne({ urlId: url._id })
      .sort({ createdAt: -1 })
      .select("createdAt"),
  ]);

  return res.status(200).json({
    success: true,
    data: {
      originalUrl: url.originalUrl,

      shortCode: url.shortCode,

      shortUrl: `${req.protocol}://${req.get("host")}/${url.shortCode}`,

      totalClicks,

      lastClicked: lastClick?.createdAt || null,

      countries: countryStats,

      browsers: browserStats,

      devices: deviceStats,

      operatingSystems: osStats,
    },
  });
});

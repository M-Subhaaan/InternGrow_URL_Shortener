const Url = require("../models/url");
const Analytics = require("../models/analytics");

const generateShortCode = require("../utils/generateShortCode");
const collectAnalytics = require("../utils/collectAnalytics");
const resolvesToPrivateIP = require("../utils/isPrivateIP");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

exports.shortenUrl = catchAsync(async (req, res, next) => {
  const url = req.body.url;

  if (!url) {
    return next(AppError("Please provide a valid URL", 400));
  }
  // Validate the URL format
  let parsedUrl;
  try {
    parsedUrl = new URL(url);

    if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
      return next(
        AppError("Invalid URL protocol. Please use http or https", 400),
      );
    }
  } catch (err) {
    return next(AppError("Please provide a valid URL", 400));
  }

  // Check if the URL resolves to a private IP address
  if (await resolvesToPrivateIP(parsedUrl.hostname)) {
    return next(
      AppError(
        "URLs pointing to internal/private addresses are not allowed",
        400,
      ),
    );
  }

  // Check if the URL already exists in the database
  const existingUrl = await Url.findOne({
    originalUrl: url,
  });

  if (existingUrl) {
    return res.status(200).json({
      status: "success",
      message: "Short URL Already Exists",
      data: {
        originalUrl: existingUrl.originalUrl,
        shortCode: existingUrl.shortCode,
        shortUrl: `${req.protocol}://${req.get("host")}/${existingUrl.shortCode}`,
      },
    });
  }

  //Generate a unique short code for the URL
  let shortCode;
  let codeExists = true;

  while (codeExists) {
    shortCode = generateShortCode();

    const existingShortCode = await Url.findOne({ shortCode });

    if (!existingShortCode) {
      codeExists = false;
    }
  }

  const shortUrl = `${req.protocol}://${req.get("host")}/${shortCode}`;

  // Create a new URL document in the database
  const newUrl = await Url.create({
    originalUrl: url,
    shortCode,
    shortUrl,
  });

  res.status(201).json({
    status: "success",
    message: "Short URL Created Successfully",
    data: {
      originalUrl: newUrl.originalUrl,
      shortCode: newUrl.shortCode,
      shortUrl: newUrl.shortUrl,
    },
  });
});

exports.redirectToOriginalUrl = catchAsync(async (req, res, next) => {
  const shortCode = req.params.shortCode;

  const url = await Url.findOne({ shortCode });

  if (!url) {
    return next(AppError("Short URL not found", 404));
  }

  // Collect analytics data
  const analyticsData = await collectAnalytics(req);
  try {
    await Analytics.create({
      urlId: url._id,
      ...analyticsData,
    });
  } catch (err) {
    console.error("Error saving analytics data:", err);
  }

  // Redirect the user to the original URL
  return res.redirect(url.originalUrl);
});

const express = require("express");

const urlRouter = require("./routes/urlRouter");
const redirectRouter = require("./routes/redirectRouter");
const analyticsRouter = require("./routes/analyticsRouter");

const helmet = require("helmet");
const sanitizeMiddleware = require("./middleware/sanitize");
const rateLimit = require("express-rate-limit");

const AppError = require("./utils/appError");
const globalErrorHandler = require("./controllers/errorController");

const app = express();
app.set("trust proxy", 1);

app.use(helmet());
app.use(sanitizeMiddleware);
app.use(express.json({ limit: "10kb" }));

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // limit each IP to 50 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: "Too many requests from this IP, please try again later.",
});

app.use("/api", limiter);

// Routes
app.use("/api/v1/url", urlRouter);
app.use("/api/v1/analytics", analyticsRouter);
app.use("/", redirectRouter);

app.use((req, res, next) => {
  return next(
    AppError(`Unable to find ${req.originalUrl} on this Server`, 404),
  );
});

app.use(globalErrorHandler);
module.exports = app;

const express = require("express");

const urlRouter = require("./routes/urlRouter");
const redirectRouter = require("./routes/redirectRouter");
const analyticsRouter = require("./routes/analyticsRouter");

const helmet = require("helmet");
const AppError = require("./utils/appError");
const globalErrorHandler = require("./controllers/errorController");

const app = express();

app.use(helmet());
app.use(express.json());

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

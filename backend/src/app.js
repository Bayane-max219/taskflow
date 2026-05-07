const express = require("express");
const cors = require("cors");
const Sentry = require("@sentry/node");

Sentry.init({
  dsn: process.env.SENTRY_DSN || "",
  tracesSampleRate: 1.0,
});

const taskRoutes = require("./routes/tasks");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => res.json({ status: "ok" }));
app.use("/api/tasks", taskRoutes);

Sentry.setupExpressErrorHandler(app);

module.exports = app;

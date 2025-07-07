const express = require("express");
const { registerRoutes } = require("./routes.cjs");
const { setupVite, serveStatic, log } = require("./vite.cjs");
const core =  require("./services/utils.cjs")
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const originalSend = res.send;
  res.send = function (bodyJson, ...args) {
    const duration = Date.now() - start;
    const responseBody = typeof bodyJson === "string" ? bodyJson : JSON.stringify(bodyJson);
    const truncatedBody = responseBody.length > 200 ? responseBody.substring(0, 200) + "…" : responseBody;
    log(`${req.method} ${req.path} ${res.statusCode} in ${duration}ms :: ${truncatedBody}`, "express");
    return originalSend.call(this, bodyJson, ...args);
  };
  next();
});



const PORT = 5000;

(async () => {
  const server = await registerRoutes(app);

  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    log(`Unhandled application error: ${err.message}`, "express");
  });

  // Setup Vite in development mode after setting up all routes
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  server.listen(PORT, "0.0.0.0", () => {
    log(`serving on port ${PORT}`, "express");
  });
})();
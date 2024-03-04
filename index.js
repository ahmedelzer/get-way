const express = require("express");
const morgan = require("morgan");
const { createProxyMiddleware } = require("http-proxy-middleware");
// Create Express Server
const Routes = require("./Routes.json");
const app = express();

// Configuration
const PORT = 3000;
const HOST = "localhost";
// Logging
app.use(morgan("dev"));
// Info GET endpoint
app.get("/info", (req, res, next) => {
  res.send(
    "This is a proxy service which proxies to Billing and Account APIs."
  );
});
// Authorization
app.use("", (req, res, next) => {
  if (req.headers.authorization) {
    next();
  } else {
    next();
    console.log("req, res, next", res);

    // res.sendStatus(403);
  }
});
// Proxy endpoints
Routes.map((route) => {
  app.use(
    route.route,
    createProxyMiddleware({
      target: route.target,
      changeOrigin: route.changeOrigin,
      pathRewrite: {
        [`^${route.route}`]: "",
      },
    })
  );
});
// Start the Proxy
app.listen(PORT, HOST, () => {
  console.log(`Starting Proxy at ${HOST}:${PORT}`);
});

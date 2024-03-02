const { createProxyMiddleware } = require("http-proxy-middleware");
const express = require("express");
const http = require("http");
const ws = require("ws");

const app = express();

// Define routes and their corresponding target URLs in JSON format
const proxyConfig = {
  "/car": { target: "https://dummyjson.com/products/1", changeOrigin: true },
  "/images": { target: "http://images.example.com", changeOrigin: true },
  "/ws": { target: "ws://websocket.example.com", ws: true }, // WebSocket route
  // Add more routes as needed
};

// Create regular HTTP proxy middleware based on the configuration
Object.entries(proxyConfig).forEach(([route, options]) => {
  if (!options.ws) {
    console.log("upgrade", route);
    app.use(route, createProxyMiddleware(options));
  }
});
app.use((req, res, next) => {
  const route = req.url.split("?")[0]; // Extract the route from the request URL

  // Check if the route should not be proxied
  if (!proxyConfig[route]) {
    // Handle the request here instead of proxying it
    // For example, send a 404 response
    res.status(404).send("Route not found");
  } else {
    // If the route should be proxied, continue to the next middleware
    next();
  }
});

// Create WebSocket proxy server for WebSocket route
const server = http.createServer(app);
const wss = new ws.Server({ noServer: true });

server.on("upgrade", (req, socket, head) => {
  const route = Object.keys(proxyConfig).find((r) => req.url.startsWith(r));

  const options = proxyConfig[route];
  if (options && options.ws) {
    wss.handleUpgrade(req, socket, head, (ws) => {
      wss.emit("connection", ws, req);
    });
  } else {
    socket.destroy();
  }
});

wss.on("connection", (ws, req) => {
  // You can handle WebSocket connections here
  ws.on("message", (message) => {
    console.log("Received message:", message);
  });
});

// Start the HTTP server on port 3000
server.listen(3002, "localhost", () => {
  console.log("Proxy server listening on port 3002");
});

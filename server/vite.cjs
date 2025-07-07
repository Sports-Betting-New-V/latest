const express = require("express");
const fs = require("fs");
const path = require("path");
const { createServer, createLogger } = require("vite");

// Import React plugin for Vite
let reactPlugin;
(async () => {
  const react = await import("@vitejs/plugin-react");
  reactPlugin = react.default;
})();

const viteLogger = createLogger();

// Basic vite config for CommonJS
const viteConfig = {
  root: "client",
  publicDir: "public",
  build: {
    outDir: "../dist",
    emptyOutDir: true
  },
  resolve: {
    alias: {
      "@": path.resolve("client/src"),
      "@shared": path.resolve("shared"),
      "@assets": path.resolve("attached_assets")
    }
  },
  esbuild: {
    jsx: 'automatic'
  },
  plugins: [
    {
      name: 'react-jsx',
      config(config) {
        if (!config.define) {
          config.define = {};
        }
        config.define.__DEV__ = 'true';
      }
    }
  ]
};

function log(message, source = "express") {
  const timestamp = new Date().toLocaleTimeString();
  console.log(`${timestamp} [${source}] ${message}`);
}

async function setupVite(app, server) {
  // Ensure React plugin is loaded
  if (!reactPlugin) {
    const react = await import("@vitejs/plugin-react");
    reactPlugin = react.default;
  }

  const vite = await createServer({
    ...viteConfig,
    plugins: [reactPlugin()],
    server: { 
      middlewareMode: true,
      hmr: { server }
    },
    appType: "custom",
    customLogger: viteLogger,
  });

  app.use(vite.middlewares);
  
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    
    try {
      const clientTemplate = path.resolve("client", "index.html");
      
      // Always reload the index.html file from disk in case it changes
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
  
  return vite;
}

function serveStatic(app) {
  const distPath = path.resolve("dist");
  
  if (!fs.existsSync(distPath)) {
    throw new Error("dist directory not found. Please run 'npm run build' first.");
  }

  app.use(express.static(distPath));
  
  app.get("*", (req, res) => {
    const indexPath = path.resolve(distPath, "index.html");
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      res.status(404).send("File not found");
    }
  });
}

module.exports = { setupVite, serveStatic, log };
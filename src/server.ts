import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';
import { config } from './config.js';
import { YouTubeService } from './services/youtubeService.js';
import { createAuthRouter } from './routes/authRoutes.js';
import { createApiRouter } from './routes/apiRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const youtubeService = new YouTubeService(config.google);

// Middleware
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(config.sessionSecret));

// Public static files
const publicDir = path.resolve(__dirname, '../public');
app.use(express.static(publicDir));
app.use('/vendor/qrcode', express.static(path.resolve(__dirname, '../node_modules/qrcode/build')));

// Routes
app.use('/auth', createAuthRouter(youtubeService));
app.use('/api', createApiRouter(youtubeService));

// Fallback to index.html for SPA client navigation
app.use((req, res, next) => {
  if (req.method === 'GET' && !req.path.startsWith('/api') && !req.path.startsWith('/auth')) {
    const indexPath = path.join(publicDir, 'index.html');
    if (fs.existsSync(indexPath)) {
      return res.sendFile(indexPath);
    }
  }
  next();
});

// Start Server on 0.0.0.0 (Allowing Tailscale & LAN connections)
if (process.env.NODE_ENV !== 'test') {
  const HOST = '0.0.0.0';
  app.listen(config.port, HOST, () => {
    console.log(`\n🚀 YouTube Taste Blend Server running:`);
    console.log(`   - Local:      http://localhost:${config.port}`);
    console.log(`   - Tailscale:  http://100.127.138.61:${config.port}`);
    console.log(`   - LAN:        http://192.168.31.186:${config.port}`);
    console.log(`📡 Google OAuth: ${youtubeService.getIsConfigured() ? '✅ Configured' : '⚠️ Unconfigured (Mock Mode Available)'}\n`);
  });
}

export { app, youtubeService };

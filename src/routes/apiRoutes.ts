import { Router, Request, Response } from 'express';
import crypto from 'node:crypto';
import { packChannelIds, unpackChannelIds, getCompressionStats } from '../codec/channelCodec.js';
import { YouTubeService } from '../services/youtubeService.js';
import { calculateTasteBlend, ChannelItem } from '../services/tasteService.js';

// In-memory 24h shortcode store
interface EphemeralRecord {
  payload: string;
  name: string;
  count: number;
  createdAt: number;
  expiresAt: number;
}
const MAX_EPHEMERAL_ITEMS = 10000;
const ephemeralShortcodes = new Map<string, EphemeralRecord>();

// Clean expired records every hour
setInterval(() => {
  const now = Date.now();
  for (const [key, val] of ephemeralShortcodes.entries()) {
    if (val.expiresAt < now) {
      ephemeralShortcodes.delete(key);
    }
  }
}, 3600 * 1000);

export function createApiRouter(youtubeService: YouTubeService): Router {
  const router = Router();

  /**
   * GET /api/health - Diagnostic endpoint
   */
  router.get('/health', (req: Request, res: Response) => {
    res.json({
      status: 'ok',
      service: 'YouTube Taste Blend Backend',
      oauthConfigured: youtubeService.getIsConfigured(),
      uptimeSeconds: process.uptime()
    });
  });

  /**
   * GET /api/subscriptions - Fetches current user's YouTube subscriptions
   */
  router.get('/subscriptions', async (req: Request, res: Response) => {
    const token = req.cookies?.yt_access_token;
    const forceMock = req.query.mock === 'true';

    if (forceMock || !token) {
      if (!token && !forceMock) {
        return res.status(401).json({
          error: 'UNAUTHORIZED',
          message: 'Not logged in. You can pass ?mock=true to use sample subscription data.'
        });
      }

      const profile = (req.query.profile as 'A' | 'B') || 'general';
      const mockChannels = YouTubeService.getMockSubscriptions(profile);
      return res.json({
        source: 'mock',
        count: mockChannels.length,
        channels: mockChannels
      });
    }

    try {
      const channels = await youtubeService.fetchAllSubscriptions(token);
      res.json({
        source: 'youtube_api',
        count: channels.length,
        channels
      });
    } catch (err: any) {
      res.status(500).json({
        error: 'YOUTUBE_API_ERROR',
        message: err.message
      });
    }
  });

  /**
   * GET /api/mock/subscriptions - Explicit mock data endpoint for testing
   */
  router.get('/mock/subscriptions', (req: Request, res: Response) => {
    const profile = (req.query.profile as 'A' | 'B') || 'general';
    const channels = YouTubeService.getMockSubscriptions(profile);
    res.json({
      source: 'mock',
      profile,
      count: channels.length,
      channels
    });
  });

  /**
   * POST /api/pack - Compresses a list of channel IDs into Base64URL Brotli payload
   */
  router.post('/pack', (req: Request, res: Response) => {
    const { channelIds } = req.body;

    if (!Array.isArray(channelIds)) {
      return res.status(400).json({ error: 'channelIds must be an array of string IDs' });
    }

    try {
      const stats = getCompressionStats(channelIds);
      res.json({
        success: true,
        ...stats
      });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  /**
   * POST /api/unpack - Decompresses a Base64URL Brotli payload back into channel IDs
   */
  router.post('/unpack', (req: Request, res: Response) => {
    const { payload } = req.body;

    if (typeof payload !== 'string') {
      return res.status(400).json({ error: 'payload must be a string' });
    }

    try {
      const channelIds = unpackChannelIds(payload);
      res.json({
        success: true,
        count: channelIds.length,
        channelIds
      });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  /**
   * POST /api/blend - Compares two sets of channels and returns full taste blend metrics
   */
  router.post('/blend', async (req: Request, res: Response) => {
    const { userA, userB } = req.body;
    const token = req.cookies?.yt_access_token;

    if (!userA || !userB) {
      return res.status(400).json({ error: 'Both userA and userB data must be provided' });
    }

    try {
      let channelsA: ChannelItem[] = [];
      let channelsB: ChannelItem[] = [];

      // Resolve user A channels
      if (Array.isArray(userA.channels) && userA.channels.length > 0) {
        channelsA = userA.channels;
      } else if (typeof userA.payload === 'string') {
        const idsA = unpackChannelIds(userA.payload);
        channelsA = await youtubeService.resolveChannelsByIds(idsA, token);
      }

      // Resolve user B channels
      if (Array.isArray(userB.channels) && userB.channels.length > 0) {
        channelsB = userB.channels;
      } else if (typeof userB.payload === 'string') {
        const idsB = unpackChannelIds(userB.payload);
        channelsB = await youtubeService.resolveChannelsByIds(idsB, token);
      }

      const blendResult = calculateTasteBlend(
        channelsA,
        channelsB,
        userA.name || 'User A',
        userB.name || 'User B'
      );

      res.json({
        success: true,
        result: blendResult
      });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  /**
   * GET /api/qrcode - Generates high-resolution PNG data URI of a QR code
   */
  router.get('/qrcode', async (req: Request, res: Response) => {
    const text = req.query.text as string;
    const width = Number(req.query.width) || 240;

    if (!text) {
      return res.status(400).json({ error: 'text query parameter is required' });
    }

    try {
      const QRCode = await import('qrcode');
      const dataUrl = await QRCode.default.toDataURL(text, {
        width,
        margin: 1,
        color: {
          dark: '#090d16',
          light: '#ffffff'
        }
      });

      res.setHeader('Cache-Control', 'public, max-age=86400');
      res.json({
        success: true,
        dataUrl
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  /**
   * POST /api/shortcode - Generates an ephemeral shortcode or GitHub Gist for high-capacity payloads
   */
  router.post('/shortcode', async (req: Request, res: Response) => {
    const { payload, name, channelsCount } = req.body;

    if (!payload || typeof payload !== 'string') {
      return res.status(400).json({ error: 'payload string is required' });
    }

    const githubToken = process.env.GITHUB_TOKEN;
    const userName = name || 'Anonymous';
    const count = Number(channelsCount) || 0;

    // 1. If GITHUB_TOKEN is available, create a public Gist
    if (githubToken) {
      try {
        const gistResponse = await fetch('https://api.github.com/gists', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${githubToken}`,
            'Accept': 'application/vnd.github+json',
            'Content-Type': 'application/json',
            'User-Agent': 'YouTube-Taste-Blend'
          },
          body: JSON.stringify({
            description: `YouTube Taste Blend Taste Pack - ${userName} (${count} channels)`,
            public: true,
            files: {
              'youtube-taste.json': {
                content: JSON.stringify({
                  app: 'youtube-taste-blend',
                  version: '1.0.0',
                  name: userName,
                  count,
                  payload,
                  createdAt: new Date().toISOString()
                })
              }
            }
          })
        });

        if (gistResponse.ok) {
          const gistData = (await gistResponse.json()) as { id: string; html_url: string };
          return res.json({
            success: true,
            type: 'gist',
            shortcode: gistData.id,
            url: gistData.html_url
          });
        }
      } catch (gistErr) {
        console.warn('Failed to create GitHub Gist, falling back to local ephemeral cache:', gistErr);
      }
    }

    // 2. Fallback to Local Ephemeral Cache (24-hour TTL)
    const shortcode = crypto.randomBytes(4).toString('hex'); // 8 characters
    const now = Date.now();
    const ttlMs = 24 * 60 * 60 * 1000; // 24 hours

    // Prevent memory overflow (FIFO eviction)
    if (ephemeralShortcodes.size >= MAX_EPHEMERAL_ITEMS) {
      const firstKey = ephemeralShortcodes.keys().next().value;
      if (firstKey) ephemeralShortcodes.delete(firstKey);
    }

    ephemeralShortcodes.set(shortcode, {
      payload,
      name: userName,
      count,
      createdAt: now,
      expiresAt: now + ttlMs
    });

    res.json({
      success: true,
      type: 'local',
      shortcode,
      expiresAt: new Date(now + ttlMs).toISOString()
    });
  });

  /**
   * GET /api/shortcode/:id - Retrieves payload from local ephemeral store
   */
  router.get('/shortcode/:id', (req: Request, res: Response) => {
    const id = String(req.params.id);
    const record = ephemeralShortcodes.get(id);

    if (!record) {
      return res.status(404).json({
        error: 'NOT_FOUND',
        message: 'Shortcode not found or has expired (24h TTL).'
      });
    }

    if (Date.now() > record.expiresAt) {
      ephemeralShortcodes.delete(id);
      return res.status(410).json({
        error: 'EXPIRED',
        message: 'This taste invite link has expired after 24 hours.'
      });
    }

    res.json({
      success: true,
      payload: record.payload,
      name: record.name,
      count: record.count,
      createdAt: new Date(record.createdAt).toISOString()
    });
  });

  return router;
}

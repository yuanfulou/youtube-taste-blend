import { Router, Request, Response } from 'express';
import { packChannelIds, unpackChannelIds, getCompressionStats } from '../codec/channelCodec.js';
import { YouTubeService } from '../services/youtubeService.js';
import { calculateTasteBlend, ChannelItem } from '../services/tasteService.js';

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

  return router;
}

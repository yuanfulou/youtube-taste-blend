import { Router, Request, Response } from 'express';
import { YouTubeService } from '../services/youtubeService.js';

export function createAuthRouter(youtubeService: YouTubeService): Router {
  const router = Router();

  /**
   * GET /auth/status - Returns configuration status and session state
   */
  router.get('/status', (req: Request, res: Response) => {
    const isConfigured = youtubeService.getIsConfigured();
    const token = req.cookies?.yt_access_token;

    res.json({
      configured: isConfigured,
      authenticated: Boolean(token),
      hasMockMode: true
    });
  });

  /**
   * GET /auth/google - Initiates Google OAuth redirect
   */
  router.get('/google', (req: Request, res: Response) => {
    const returnTo = (req.query.returnTo as string) || '/';
    
    if (!youtubeService.getIsConfigured()) {
      return res.redirect('/?oauth_help=1');
    }

    try {
      const authUrl = youtubeService.generateAuthUrl(returnTo);
      res.redirect(authUrl);
    } catch (err: any) {
      res.redirect(`/?auth_error=${encodeURIComponent(err.message)}`);
    }
  });

  /**
   * GET /auth/callback - Handles Google OAuth redirect callback
   */
  router.get('/callback', async (req: Request, res: Response) => {
    const { code, state, error } = req.query;

    if (error) {
      return res.redirect(`/?auth_error=${encodeURIComponent(String(error))}`);
    }

    if (!code || typeof code !== 'string') {
      return res.redirect('/?auth_error=missing_code');
    }

    try {
      const tokens = await youtubeService.getTokens(code);
      
      if (tokens.access_token) {
        // Set secure HTTP-only cookie
        res.cookie('yt_access_token', tokens.access_token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          maxAge: 3600 * 1000, // 1 hour
          sameSite: 'lax'
        });
      }

      const returnUrl = (typeof state === 'string' && state.startsWith('/')) ? state : '/?logged_in=1';
      res.redirect(returnUrl);
    } catch (err: any) {
      res.redirect(`/?auth_error=${encodeURIComponent(err.message)}`);
    }
  });

  /**
   * POST /auth/logout - Clears the authentication cookie
   */
  router.post('/logout', (req: Request, res: Response) => {
    res.clearCookie('yt_access_token');
    res.json({ success: true, message: 'Logged out successfully' });
  });

  return router;
}

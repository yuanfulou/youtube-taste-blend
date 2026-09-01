import { google } from 'googleapis';
import { ChannelItem } from './tasteService.js';

export interface OAuthConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}

export class YouTubeService {
  private oauth2Client: any;
  private isConfigured: boolean;

  constructor(config?: Partial<OAuthConfig>) {
    const clientId = config?.clientId || process.env.GOOGLE_CLIENT_ID || '';
    const clientSecret = config?.clientSecret || process.env.GOOGLE_CLIENT_SECRET || '';
    const redirectUri = config?.redirectUri || process.env.OAUTH_REDIRECT_URI || 'http://localhost:3000/auth/callback';

    this.isConfigured = Boolean(clientId && clientSecret);

    if (this.isConfigured) {
      this.oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);
    }
  }

  public getIsConfigured(): boolean {
    return this.isConfigured;
  }

  /**
   * Generates Google OAuth 2.0 Authorization URL
   */
  public generateAuthUrl(state?: string): string {
    if (!this.oauth2Client) {
      throw new Error('Google OAuth is not configured. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env');
    }

    const scopes = [
      'https://www.googleapis.com/auth/youtube.readonly',
      'https://www.googleapis.com/auth/userinfo.profile'
    ];

    return this.oauth2Client.generateAuthUrl({
      access_type: 'online',
      scope: scopes,
      include_granted_scopes: true,
      state: state || ''
    });
  }

  /**
   * Exchanges authorization code for tokens
   */
  public async getTokens(code: string) {
    if (!this.oauth2Client) {
      throw new Error('Google OAuth is not configured');
    }
    const { tokens } = await this.oauth2Client.getToken(code);
    return tokens;
  }

  /**
   * Fetches all user subscriptions with pagination
   */
  public async fetchAllSubscriptions(accessToken: string): Promise<ChannelItem[]> {
    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: accessToken });

    const youtube = google.youtube({ version: 'v3', auth });
    const channels: ChannelItem[] = [];
    let nextPageToken: string | undefined = undefined;

    do {
      const response: any = await youtube.subscriptions.list({
        part: ['snippet'],
        mine: true,
        maxResults: 50,
        pageToken: nextPageToken,
        order: 'alphabetical'
      });

      const items = response.data.items || [];
      for (const item of items) {
        const snippet = item.snippet;
        const channelId = snippet?.resourceId?.channelId;
        if (channelId) {
          channels.push({
            id: channelId,
            title: snippet?.title || 'Unknown Channel',
            description: snippet?.description || '',
            thumbnailUrl: snippet?.thumbnails?.default?.url || snippet?.thumbnails?.medium?.url || '',
            category: 'YouTube'
          });
        }
      }

      nextPageToken = response.data.nextPageToken;
    } while (nextPageToken);

    return channels;
  }

  /**
   * Generates rich mock subscription data for testing without live API keys
   */
  public static getMockSubscriptions(profile: 'A' | 'B' | 'general' = 'general'): ChannelItem[] {
    const techPool: ChannelItem[] = [
      { id: 'UCBJycsmduvYEL83R_U4JriQ', title: 'MKBHD', category: 'Tech', subscriberCount: 19500000 },
      { id: 'UC_x5XG1OV2P6uZZ5FSM9Ttw', title: 'Google Developers', category: 'Dev', subscriberCount: 2350000 },
      { id: 'UCsTcErHg8oDvUnTzoqsYeNw', title: 'Veritasium', category: 'Science', subscriberCount: 16200000 },
      { id: 'UC7_YxT-KID8kRbqZo7MyscQ', title: 'Mark Rober', category: 'Science', subscriberCount: 57000000 },
      { id: 'UCV6KDgJskWaEckne5aPA0aQ', title: 'Fireship', category: 'Dev', subscriberCount: 3200000 },
      { id: 'UCv613K_uhqJt8Gg2Z1lG-mA', title: 'Two Minute Papers', category: 'AI/Tech', subscriberCount: 1600000 },
      { id: 'UCsooa4yRKGN_zEE8iknghZA', title: 'TED-Ed', category: 'Knowledge', subscriberCount: 20000000 },
      { id: 'UCtinbFUXtCuCYZ3Uet1uFBA', title: 'Joeman', category: 'Tech/Lifestyle', subscriberCount: 2600000 },
      { id: 'UC2C_jShtL725hvbm1arSV9w', title: '臺灣吧 Taiwan Bar', category: 'Knowledge', subscriberCount: 1100000 },
      { id: 'UCr3cBLTYmIK9kY0F_OdFWFQ', title: '柴鼠兄弟 ZRBros', category: 'Finance', subscriberCount: 1050000 }
    ];

    const nicheAndIndiePool: ChannelItem[] = [
      { id: 'UC0123456789abcdefghij01', title: '微縮模型工作室 (MicroCraft)', category: 'Indie Art', subscriberCount: 42000, isIndie: true },
      { id: 'UC0123456789abcdefghij02', title: '深夜街頭攝影誌 (Midnight Street)', category: 'Photography', subscriberCount: 78000, isIndie: true },
      { id: 'UC0123456789abcdefghij03', title: '黑膠復古音樂盒 (Vinyl Nostalgia)', category: 'Music', subscriberCount: 29000, isIndie: true },
      { id: 'UC0123456789abcdefghij04', title: 'Rust 系統底層探險 (DeepRust)', category: 'Dev', subscriberCount: 15000, isIndie: true },
      { id: 'UC0123456789abcdefghij05', title: '山林野營野炊手記 (Wild Camp Log)', category: 'Outdoor', subscriberCount: 88000, isIndie: true }
    ];

    const gamingAndEntertainmentPool: ChannelItem[] = [
      { id: 'UC-lHJZR3Gqxm24_Vd_AJ5Yw', title: 'PewDiePie', category: 'Gaming', subscriberCount: 111000000 },
      { id: 'UCX6OQ3DkcsbYNE6H8uQQuVA', title: 'MrBeast', category: 'Entertainment', subscriberCount: 350000000 },
      { id: 'UCv1Kz4rB0vKq496v9wG5V-g', title: '木曜4超玩', category: 'Entertainment', subscriberCount: 2300000 },
      { id: 'UCp2mB4b4sF7m6D1K1l2G9yA', title: '志祺七七 X 圖文不符', category: 'News/Society', subscriberCount: 1450000 },
      { id: 'UCq1T2G3f4E5b6a7c8d9E0FA', title: '老高與小茉 Mr & Mrs Gao', category: 'Mystery', subscriberCount: 6100000 }
    ];

    if (profile === 'A') {
      // User A likes Tech + Science + 2 Indies + 2 Entertainment
      return [
        ...techPool.slice(0, 8),
        nicheAndIndiePool[0],
        nicheAndIndiePool[1],
        nicheAndIndiePool[3],
        ...gamingAndEntertainmentPool.slice(0, 3)
      ];
    } else if (profile === 'B') {
      // User B likes Tech (shares 4), Indies (shares 1, has 2 unique), Entertainment (shares 2, has 2 unique)
      return [
        techPool[0], // MKBHD (Common)
        techPool[2], // Veritasium (Common)
        techPool[4], // Fireship (Common)
        techPool[7], // Joeman (Common)
        techPool[8], // Taiwan Bar (B only)
        techPool[9], // ZRBros (B only)
        nicheAndIndiePool[0], // MicroCraft (Common Indie!)
        nicheAndIndiePool[2], // Vinyl Nostalgia (B only)
        nicheAndIndiePool[4], // Wild Camp Log (B only)
        gamingAndEntertainmentPool[0], // PewDiePie (Common)
        gamingAndEntertainmentPool[1], // MrBeast (Common)
        gamingAndEntertainmentPool[3], // 志祺七七 (B only)
        gamingAndEntertainmentPool[4]  // 老高與小茉 (B only)
      ];
    }

    return [...techPool, ...nicheAndIndiePool, ...gamingAndEntertainmentPool];
  }
}

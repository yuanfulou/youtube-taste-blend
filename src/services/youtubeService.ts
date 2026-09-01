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
    const redirectUri = config?.redirectUri || process.env.OAUTH_REDIRECT_URI || 'http://localhost:3030/auth/callback';

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
        part: ['snippet', 'contentDetails'],
        mine: true,
        maxResults: 50,
        pageToken: nextPageToken,
        order: 'unread' // Prioritize channels with recent new activity / unread items
      });

      const items = response.data.items || [];
      for (const item of items) {
        const snippet = item.snippet;
        const channelId = snippet?.resourceId?.channelId;
        const totalNewItems = item.contentDetails?.newItemCount || 0;
        
        if (channelId) {
          channels.push({
            id: channelId,
            title: snippet?.title || 'Unknown Channel',
            description: snippet?.description || '',
            thumbnailUrl: snippet?.thumbnails?.default?.url || snippet?.thumbnails?.medium?.url || '',
            category: 'YouTube',
            lastActive: totalNewItems > 0 ? `🔥 近期有 ${totalNewItems} 部新片` : '持續活躍',
            lastActiveDaysAgo: totalNewItems > 0 ? 1 : 14
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
      { id: 'UCBJycsmduvYEL83R_U4JriQ', title: 'MKBHD', category: 'Tech', subscriberCount: 19500000, lastActive: '🔥 昨天更新', lastActiveDaysAgo: 1 },
      { id: 'UC_x5XG1OV2P6uZZ5FSM9Ttw', title: 'Google Developers', category: 'Dev', subscriberCount: 2350000, lastActive: '🔥 3天前更新', lastActiveDaysAgo: 3 },
      { id: 'UCsTcErHg8oDvUnTzoqsYeNw', title: 'Veritasium', category: 'Science', subscriberCount: 16200000, lastActive: '🔥 2天前更新', lastActiveDaysAgo: 2 },
      { id: 'UC7_YxT-KID8kRbqZo7MyscQ', title: 'Mark Rober', category: 'Science', subscriberCount: 57000000, lastActive: '本週更新', lastActiveDaysAgo: 5 },
      { id: 'UCV6KDgJskWaEckne5aPA0aQ', title: 'Fireship', category: 'Dev', subscriberCount: 3200000, lastActive: '🔥 今天更新', lastActiveDaysAgo: 0 },
      { id: 'UCv613K_uhqJt8Gg2Z1lG-mA', title: 'Two Minute Papers', category: 'AI/Tech', subscriberCount: 1600000, lastActive: '🔥 2天前更新', lastActiveDaysAgo: 2 },
      { id: 'UCsooa4yRKGN_zEE8iknghZA', title: 'TED-Ed', category: 'Knowledge', subscriberCount: 20000000, lastActive: '本週更新', lastActiveDaysAgo: 4 },
      { id: 'UCtinbFUXtCuCYZ3Uet1uFBA', title: 'Joeman', category: 'Tech/Lifestyle', subscriberCount: 2600000, lastActive: '🔥 昨天更新', lastActiveDaysAgo: 1 },
      { id: 'UC2C_jShtL725hvbm1arSV9w', title: '臺灣吧 Taiwan Bar', category: 'Knowledge', subscriberCount: 1100000, lastActive: '上週更新', lastActiveDaysAgo: 10 },
      { id: 'UCr3cBLTYmIK9kY0F_OdFWFQ', title: '柴鼠兄弟 ZRBros', category: 'Finance', subscriberCount: 1050000, lastActive: '4天前更新', lastActiveDaysAgo: 4 }
    ];

    const nicheAndIndiePool: ChannelItem[] = [
      { id: 'UC0123456789abcdefghij01', title: '微縮模型工作室 (MicroCraft)', category: 'Indie Art', subscriberCount: 42000, isIndie: true, lastActive: '🔥 3天前更新', lastActiveDaysAgo: 3 },
      { id: 'UC0123456789abcdefghij02', title: '深夜街頭攝影誌 (Midnight Street)', category: 'Photography', subscriberCount: 78000, isIndie: true, lastActive: '本週更新', lastActiveDaysAgo: 6 },
      { id: 'UC0123456789abcdefghij03', title: '黑膠復古音樂盒 (Vinyl Nostalgia)', category: 'Music', subscriberCount: 29000, isIndie: true, lastActive: '持續活躍', lastActiveDaysAgo: 12 },
      { id: 'UC0123456789abcdefghij04', title: 'Rust 系統底層探險 (DeepRust)', category: 'Dev', subscriberCount: 15000, isIndie: true, lastActive: '🔥 昨天更新', lastActiveDaysAgo: 1 },
      { id: 'UC0123456789abcdefghij05', title: '山林野營野炊手記 (Wild Camp Log)', category: 'Outdoor', subscriberCount: 88000, isIndie: true, lastActive: '5天前更新', lastActiveDaysAgo: 5 }
    ];

    const gamingAndEntertainmentPool: ChannelItem[] = [
      { id: 'UC-lHJZR3Gqxm24_Vd_AJ5Yw', title: 'PewDiePie', category: 'Gaming', subscriberCount: 111000000, lastActive: '🔥 昨天更新', lastActiveDaysAgo: 1 },
      { id: 'UCX6OQ3DkcsbYNE6H8uQQuVA', title: 'MrBeast', category: 'Entertainment', subscriberCount: 350000000, lastActive: '本週更新', lastActiveDaysAgo: 4 },
      { id: 'UCv1Kz4rB0vKq496v9wG5V-g', title: '木曜4超玩', category: 'Entertainment', subscriberCount: 2300000, lastActive: '🔥 3天前更新', lastActiveDaysAgo: 3 },
      { id: 'UCp2mB4b4sF7m6D1K1l2G9yA', title: '志祺七七 X 圖文不符', category: 'News/Society', subscriberCount: 1450000, lastActive: '🔥 今天更新', lastActiveDaysAgo: 0 },
      { id: 'UCq1T2G3f4E5b6a7c8d9E0FA', title: '老高與小茉 Mr & Mrs Gao', category: 'Mystery', subscriberCount: 6100000, lastActive: '4天前更新', lastActiveDaysAgo: 4 }
    ];

    let combined: ChannelItem[] = [];

    if (profile === 'A') {
      combined = [
        ...techPool.slice(0, 8),
        nicheAndIndiePool[0],
        nicheAndIndiePool[1],
        nicheAndIndiePool[3],
        ...gamingAndEntertainmentPool.slice(0, 3)
      ];
    } else if (profile === 'B') {
      combined = [
        techPool[0],
        techPool[2],
        techPool[4],
        techPool[7],
        techPool[8],
        techPool[9],
        nicheAndIndiePool[0],
        nicheAndIndiePool[2],
        nicheAndIndiePool[4],
        gamingAndEntertainmentPool[0],
        gamingAndEntertainmentPool[1],
        gamingAndEntertainmentPool[3],
        gamingAndEntertainmentPool[4]
      ];
    } else {
      combined = [...techPool, ...nicheAndIndiePool, ...gamingAndEntertainmentPool];
    }

    // Sort by recent activity by default (smallest days ago first)
    return combined.sort((a, b) => (a.lastActiveDaysAgo || 99) - (b.lastActiveDaysAgo || 99));
  }
}

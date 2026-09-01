import { google } from 'googleapis';
import { ChannelItem } from './tasteService.js';

export interface OAuthConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}

// Mapping YouTube Knowledge Graph Wikipedia topic URLs to clean category labels
const TOPIC_CATEGORY_MAP: Record<string, { zh: string; en: string }> = {
  'Technology': { zh: '科技', en: 'Tech' },
  'Information_technology': { zh: '科技', en: 'Tech' },
  'Video_game_culture': { zh: '遊戲', en: 'Gaming' },
  'Action_game': { zh: '遊戲', en: 'Gaming' },
  'Role-playing_video_game': { zh: '遊戲', en: 'Gaming' },
  'Strategy_video_game': { zh: '遊戲', en: 'Gaming' },
  'Music': { zh: '音樂', en: 'Music' },
  'Pop_music': { zh: '音樂', en: 'Music' },
  'Rock_music': { zh: '音樂', en: 'Music' },
  'Hip_hop_music': { zh: '音樂', en: 'Music' },
  'Electronic_music': { zh: '音樂', en: 'Music' },
  'Film': { zh: '影視娛樂', en: 'Film/TV' },
  'Television_program': { zh: '影視娛樂', en: 'Film/TV' },
  'Entertainment': { zh: '娛樂', en: 'Entertainment' },
  'Humour': { zh: '娛樂', en: 'Entertainment' },
  'Science': { zh: '科普', en: 'Science' },
  'Knowledge': { zh: '知識', en: 'Knowledge' },
  'Society': { zh: '時事社會', en: 'Society' },
  'Politics': { zh: '時事政經', en: 'Politics' },
  'Lifestyle_(sociology)': { zh: '生活風格', en: 'Lifestyle' },
  'Food': { zh: '美食料理', en: 'Food' },
  'Sport': { zh: '運動健身', en: 'Sports' },
  'Anime': { zh: '動漫', en: 'Anime' },
  'Hobby': { zh: '手作興趣', en: 'Hobby' },
  'Vehicle': { zh: '汽機車', en: 'Automobile' },
  'Fashion': { zh: '時尚美妝', en: 'Fashion' },
  'Health': { zh: '健康醫療', en: 'Health' },
  'Business': { zh: '商業理財', en: 'Business' }
};

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
   * Helper to parse category from Wikipedia Topic URLs
   */
  private static parseCategoryFromTopics(topics?: string[]): string {
    if (!topics || topics.length === 0) return '綜合';
    for (const url of topics) {
      const match = url.match(/\/wiki\/(.+)$/);
      if (match && match[1]) {
        const topicKey = match[1];
        if (TOPIC_CATEGORY_MAP[topicKey]) {
          return TOPIC_CATEGORY_MAP[topicKey].zh;
        }
      }
    }
    return '綜合';
  }

  /**
   * Fetches all user subscriptions with pagination and enriches them with topic details and subscriber counts
   */
  public async fetchAllSubscriptions(accessToken: string): Promise<ChannelItem[]> {
    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: accessToken });

    const youtube = google.youtube({ version: 'v3', auth });
    const rawChannels: { id: string; title: string; description: string; thumbnailUrl: string; totalNewItems: number }[] = [];
    let nextPageToken: string | undefined = undefined;

    // Step 1: Fetch subscriptions list with pagination
    do {
      const response: any = await youtube.subscriptions.list({
        part: ['snippet', 'contentDetails'],
        mine: true,
        maxResults: 50,
        pageToken: nextPageToken,
        order: 'unread'
      });

      const items = response.data.items || [];
      for (const item of items) {
        const snippet = item.snippet;
        const channelId = snippet?.resourceId?.channelId;
        const totalNewItems = item.contentDetails?.newItemCount || 0;
        
        if (channelId) {
          rawChannels.push({
            id: channelId,
            title: snippet?.title || 'Unknown Channel',
            description: snippet?.description || '',
            thumbnailUrl: snippet?.thumbnails?.default?.url || snippet?.thumbnails?.medium?.url || '',
            totalNewItems
          });
        }
      }

      nextPageToken = response.data.nextPageToken;
    } while (nextPageToken);

    if (rawChannels.length === 0) {
      return [];
    }

    // Step 2: Batch enrich channels with topicDetails and statistics (50 channels per batch)
    const channelMap = new Map<string, Partial<ChannelItem>>();
    const channelIdChunks: string[][] = [];
    
    for (let i = 0; i < rawChannels.length; i += 50) {
      channelIdChunks.push(rawChannels.slice(i, i + 50).map(c => c.id));
    }

    for (const chunk of channelIdChunks) {
      try {
        const detailsRes = await youtube.channels.list({
          part: ['topicDetails', 'statistics'],
          id: chunk
        });

        const detailItems = detailsRes.data.items || [];
        for (const item of detailItems) {
          if (item.id) {
            const subCount = item.statistics?.subscriberCount ? parseInt(item.statistics.subscriberCount, 10) : undefined;
            const category = YouTubeService.parseCategoryFromTopics(item.topicDetails?.topicCategories as string[] | undefined);
            const isIndie = subCount !== undefined && subCount < 100000 && subCount > 0;

            channelMap.set(item.id, {
              subscriberCount: subCount,
              category,
              isIndie
            });
          }
        }
      } catch (err) {
        console.warn('Could not enrich some channel details, using fallbacks', err);
      }
    }

    // Step 3: Combine raw info with enriched data
    const enrichedList: ChannelItem[] = rawChannels.map(c => {
      const extra = channelMap.get(c.id) || {};
      const subCount = extra.subscriberCount;
      const isIndie = extra.isIndie ?? (subCount !== undefined && subCount < 100000 && subCount > 0);

      return {
        id: c.id,
        title: c.title,
        description: c.description,
        thumbnailUrl: c.thumbnailUrl,
        subscriberCount: subCount,
        category: extra.category || '綜合',
        isIndie,
        lastActive: c.totalNewItems > 0 ? `🔥 近期有 ${c.totalNewItems} 部新片` : '持續活躍',
        lastActiveDaysAgo: c.totalNewItems > 0 ? 1 : 14
      };
    });

    return enrichedList.sort((a, b) => (a.lastActiveDaysAgo || 99) - (b.lastActiveDaysAgo || 99));
  }

  /**
   * Generates rich mock subscription data for testing without live API keys
   */
  public static getMockSubscriptions(profile: 'A' | 'B' | 'general' = 'general'): ChannelItem[] {
    const techPool: ChannelItem[] = [
      { id: 'UCBJycsmduvYEL83R_U4JriQ', title: 'MKBHD', category: '科技', subscriberCount: 19500000, lastActive: '🔥 昨天更新', lastActiveDaysAgo: 1 },
      { id: 'UC_x5XG1OV2P6uZZ5FSM9Ttw', title: 'Google Developers', category: '程式開發', subscriberCount: 2350000, lastActive: '🔥 3天前更新', lastActiveDaysAgo: 3 },
      { id: 'UCsTcErHg8oDvUnTzoqsYeNw', title: 'Veritasium', category: '科普', subscriberCount: 16200000, lastActive: '🔥 2天前更新', lastActiveDaysAgo: 2 },
      { id: 'UC7_YxT-KID8kRbqZo7MyscQ', title: 'Mark Rober', category: '科普', subscriberCount: 57000000, lastActive: '本週更新', lastActiveDaysAgo: 5 },
      { id: 'UCV6KDgJskWaEckne5aPA0aQ', title: 'Fireship', category: '程式開發', subscriberCount: 3200000, lastActive: '🔥 今天更新', lastActiveDaysAgo: 0 },
      { id: 'UCv613K_uhqJt8Gg2Z1lG-mA', title: 'Two Minute Papers', category: '科技', subscriberCount: 1600000, lastActive: '🔥 2天前更新', lastActiveDaysAgo: 2 },
      { id: 'UCsooa4yRKGN_zEE8iknghZA', title: 'TED-Ed', category: '知識', subscriberCount: 20000000, lastActive: '本週更新', lastActiveDaysAgo: 4 },
      { id: 'UCtinbFUXtCuCYZ3Uet1uFBA', title: 'Joeman', category: '科技', subscriberCount: 2600000, lastActive: '🔥 昨天更新', lastActiveDaysAgo: 1 },
      { id: 'UC2C_jShtL725hvbm1arSV9w', title: '臺灣吧 Taiwan Bar', category: '知識', subscriberCount: 1100000, lastActive: '上週更新', lastActiveDaysAgo: 10 },
      { id: 'UCr3cBLTYmIK9kY0F_OdFWFQ', title: '柴鼠兄弟 ZRBros', category: '商業理財', subscriberCount: 1050000, lastActive: '4天前更新', lastActiveDaysAgo: 4 }
    ];

    const nicheAndIndiePool: ChannelItem[] = [
      { id: 'UC0123456789abcdefghij01', title: '微縮模型工作室 (MicroCraft)', category: '手作興趣', subscriberCount: 42000, isIndie: true, lastActive: '🔥 3天前更新', lastActiveDaysAgo: 3 },
      { id: 'UC0123456789abcdefghij02', title: '深夜街頭攝影誌 (Midnight Street)', category: '生活風格', subscriberCount: 78000, isIndie: true, lastActive: '本週更新', lastActiveDaysAgo: 6 },
      { id: 'UC0123456789abcdefghij03', title: '黑膠復古音樂盒 (Vinyl Nostalgia)', category: '音樂', subscriberCount: 29000, isIndie: true, lastActive: '持續活躍', lastActiveDaysAgo: 12 },
      { id: 'UC0123456789abcdefghij04', title: 'Rust 系統底層探險 (DeepRust)', category: '程式開發', subscriberCount: 15000, isIndie: true, lastActive: '🔥 昨天更新', lastActiveDaysAgo: 1 },
      { id: 'UC0123456789abcdefghij05', title: '山林野營野炊手記 (Wild Camp Log)', category: '生活風格', subscriberCount: 88000, isIndie: true, lastActive: '5天前更新', lastActiveDaysAgo: 5 }
    ];

    const gamingAndEntertainmentPool: ChannelItem[] = [
      { id: 'UC-lHJZR3Gqxm24_Vd_AJ5Yw', title: 'PewDiePie', category: '遊戲', subscriberCount: 111000000, lastActive: '🔥 昨天更新', lastActiveDaysAgo: 1 },
      { id: 'UCX6OQ3DkcsbYNE6H8uQQuVA', title: 'MrBeast', category: '娛樂', subscriberCount: 350000000, lastActive: '本週更新', lastActiveDaysAgo: 4 },
      { id: 'UCv1Kz4rB0vKq496v9wG5V-g', title: '木曜4超玩', category: '娛樂', subscriberCount: 2300000, lastActive: '🔥 3天前更新', lastActiveDaysAgo: 3 },
      { id: 'UCp2mB4b4sF7m6D1K1l2G9yA', title: '志祺七七 X 圖文不符', category: '時事社會', subscriberCount: 1450000, lastActive: '🔥 今天更新', lastActiveDaysAgo: 0 },
      { id: 'UCq1T2G3f4E5b6a7c8d9E0FA', title: '老高與小茉 Mr & Mrs Gao', category: '知識', subscriberCount: 6100000, lastActive: '4天前更新', lastActiveDaysAgo: 4 }
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

    return combined.sort((a, b) => (a.lastActiveDaysAgo || 99) - (b.lastActiveDaysAgo || 99));
  }
}

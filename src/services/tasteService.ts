import { unpackChannelIds } from '../codec/channelCodec.js';

export interface ChannelItem {
  id: string;
  title: string;
  description?: string;
  thumbnailUrl?: string;
  subscriberCount?: number;
  isIndie?: boolean; // Subscriber count < 100k
  category?: string;
  lastActive?: string; // e.g. "本週更新", "3天前", "持續活躍"
  lastActiveDaysAgo?: number; // For sorting by recent activity
}

export interface TasteBlendResult {
  userA: {
    name: string;
    totalCount: number;
  };
  userB: {
    name: string;
    totalCount: number;
  };
  stats: {
    commonCount: number;
    aOnlyCount: number;
    bOnlyCount: number;
    totalUniqueCount: number;
    jaccardIndex: number; // 0.00 to 1.00
    matchPercentage: number; // 0 to 100
    chemistryKey: 'soul_twins' | 'kindred_spirits' | 'taste_buddies' | 'complementary_explorers' | 'parallel_universes';
    chemistryLevel: string;
    chemistryDescription: string;
    chemistryLevelEn: string;
    chemistryDescriptionEn: string;
  };
  commonChannels: ChannelItem[];
  aRecommendationsToB: ChannelItem[]; // A has, B doesn't
  bRecommendationsToA: ChannelItem[]; // B has, A doesn't
  indieGems: ChannelItem[]; // Common channels that are indie (< 100k)
}

/**
 * Categorizes the chemistry level based on the Jaccard similarity percentage.
 */
export function getChemistryTier(percentage: number): {
  key: 'soul_twins' | 'kindred_spirits' | 'taste_buddies' | 'complementary_explorers' | 'parallel_universes';
  level: string;
  description: string;
  levelEn: string;
  descriptionEn: string;
} {
  if (percentage >= 85) {
    return {
      key: 'soul_twins',
      level: '⚡ 靈魂雙胞胎 (Soul Twins)',
      description: '你們的演算法是同一條流水線出來的吧！幾乎看一樣的頻道，品味契合度爆表！',
      levelEn: '⚡ Soul Twins',
      descriptionEn: 'Your algorithms must be identical! You watch almost the exact same channels with unmatched synergy!'
    };
  } else if (percentage >= 60) {
    return {
      key: 'kindred_spirits',
      level: '🤝 志同道合 (Kindred Spirits)',
      description: '高度重疊的品味宇宙，平時一定常常互傳一樣的迷因或話題！',
      levelEn: '🤝 Kindred Spirits',
      descriptionEn: 'Highly overlapping taste universes. You definitely share the same memes and trending topics!'
    };
  } else if (percentage >= 35) {
    return {
      key: 'taste_buddies',
      level: '🎯 品味知己 (Taste Buddies)',
      description: '既有共同語言，又有彼此未探索的寶藏領域，最適合互相推坑！',
      levelEn: '🎯 Taste Buddies',
      descriptionEn: 'A great balance of common interests and undiscovered gems. Perfect for recommending channels to each other!'
    };
  } else if (percentage >= 15) {
    return {
      key: 'complementary_explorers',
      level: '🧭 互補探險家 (Complementary Explorers)',
      description: '少量共同喜好加上滿滿的未知頻道，點開對方的推薦清單就像發現新大陸！',
      levelEn: '🧭 Complementary Explorers',
      descriptionEn: 'A handful of shared channels and a whole world of new discoveries waiting for you!'
    };
  } else {
    return {
      key: 'parallel_universes',
      level: '🌌 異次元拓荒者 (Parallel Universes)',
      description: '你們的生活圈在不同的平行宇宙，這是一場跨界文化交流！',
      levelEn: '🌌 Parallel Universes',
      descriptionEn: 'You live in completely different taste dimensions. A true cross-cultural exchange!'
    };
  }
}

/**
 * Calculates the taste blend between User A and User B.
 */
export function calculateTasteBlend(
  userAChannels: ChannelItem[],
  userBChannels: ChannelItem[],
  userAName = 'User A',
  userBName = 'User B'
): TasteBlendResult {
  const mapA = new Map(userAChannels.map(c => [c.id, c]));
  const mapB = new Map(userBChannels.map(c => [c.id, c]));

  const idsA = new Set(mapA.keys());
  const idsB = new Set(mapB.keys());

  const commonIds = new Set<string>();
  const aOnlyIds = new Set<string>();
  const bOnlyIds = new Set<string>();
  const allUniqueIds = new Set<string>([...idsA, ...idsB]);

  for (const id of idsA) {
    if (idsB.has(id)) {
      commonIds.add(id);
    } else {
      aOnlyIds.add(id);
    }
  }

  for (const id of idsB) {
    if (!idsA.has(id)) {
      bOnlyIds.add(id);
    }
  }

  const commonCount = commonIds.size;
  const totalUniqueCount = allUniqueIds.size;
  const jaccard = totalUniqueCount > 0 ? commonCount / totalUniqueCount : 0;
  const matchPercentage = Math.round(jaccard * 100);

  const chemistry = getChemistryTier(matchPercentage);

  const commonChannels: ChannelItem[] = Array.from(commonIds).map(id => mapA.get(id) || mapB.get(id)!);
  const aRecommendationsToB: ChannelItem[] = Array.from(aOnlyIds).map(id => mapA.get(id)!);
  const bRecommendationsToA: ChannelItem[] = Array.from(bOnlyIds).map(id => mapB.get(id)!);

  const indieGems = commonChannels.filter(c => c.isIndie || (c.subscriberCount && c.subscriberCount < 100000));

  return {
    userA: {
      name: userAName,
      totalCount: userAChannels.length
    },
    userB: {
      name: userBName,
      totalCount: userBChannels.length
    },
    stats: {
      commonCount,
      aOnlyCount: aOnlyIds.size,
      bOnlyCount: bOnlyIds.size,
      totalUniqueCount,
      jaccardIndex: Number(jaccard.toFixed(4)),
      matchPercentage,
      chemistryKey: chemistry.key,
      chemistryLevel: chemistry.level,
      chemistryDescription: chemistry.description,
      chemistryLevelEn: chemistry.levelEn,
      chemistryDescriptionEn: chemistry.descriptionEn
    },
    commonChannels,
    aRecommendationsToB,
    bRecommendationsToA,
    indieGems
  };
}

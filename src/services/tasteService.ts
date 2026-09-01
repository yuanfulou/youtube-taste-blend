import { unpackChannelIds } from '../codec/channelCodec.js';

export interface ChannelItem {
  id: string;
  title: string;
  description?: string;
  thumbnailUrl?: string;
  subscriberCount?: number;
  isIndie?: boolean; // Subscriber count < 100k
  category?: string;
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
    chemistryLevel: string;
    chemistryDescription: string;
  };
  commonChannels: ChannelItem[];
  aRecommendationsToB: ChannelItem[]; // A has, B doesn't
  bRecommendationsToA: ChannelItem[]; // B has, A doesn't
  indieGems: ChannelItem[]; // Common channels that are indie (< 100k)
}

/**
 * Categorizes the chemistry level based on the Jaccard similarity percentage.
 */
export function getChemistryTier(percentage: number): { level: string; description: string } {
  if (percentage >= 85) {
    return {
      level: '⚡ 靈魂雙胞胎 (Soul Twins)',
      description: '你們的演算法是同一條流水線出來的吧！幾乎看一樣的頻道，品味契合度爆表！'
    };
  } else if (percentage >= 60) {
    return {
      level: '🤝 志同道合 (Kindred Spirits)',
      description: '高度重疊的品味宇宙，平時一定常常互傳一樣的迷因或話題！'
    };
  } else if (percentage >= 35) {
    return {
      level: '🎯 品味知己 (Taste Buddies)',
      description: '既有共同語言，又有彼此未探索的寶藏領域，最適合互相推坑！'
    };
  } else if (percentage >= 15) {
    return {
      level: '🧭 互補探險家 (Complementary Explorers)',
      description: '少量共同喜好加上滿滿的未知頻道，點開對方的推薦清單就像發現新大陸！'
    };
  } else {
    return {
      level: '🌌 異次元拓荒者 (Parallel Universes)',
      description: '你們的生活圈在不同的平行宇宙，這是一場跨界文化交流！'
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
      chemistryLevel: chemistry.level,
      chemistryDescription: chemistry.description
    },
    commonChannels,
    aRecommendationsToB,
    bRecommendationsToA,
    indieGems
  };
}

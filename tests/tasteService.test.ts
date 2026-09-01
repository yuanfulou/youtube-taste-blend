import { describe, it, expect } from 'vitest';
import { calculateTasteBlend, getChemistryTier } from '../src/services/tasteService.js';
import { YouTubeService } from '../src/services/youtubeService.js';

describe('Taste Blend Service', () => {
  it('should accurately calculate Jaccard index and set differences between User A and User B', () => {
    const userAChannels = YouTubeService.getMockSubscriptions('A');
    const userBChannels = YouTubeService.getMockSubscriptions('B');

    const result = calculateTasteBlend(userAChannels, userBChannels, 'Alice', 'Bob');

    expect(result.userA.name).toBe('Alice');
    expect(result.userB.name).toBe('Bob');
    expect(result.stats.commonCount).toBeGreaterThan(0);
    expect(result.stats.aOnlyCount).toBeGreaterThan(0);
    expect(result.stats.bOnlyCount).toBeGreaterThan(0);
    expect(result.stats.totalUniqueCount).toBe(
      result.stats.commonCount + result.stats.aOnlyCount + result.stats.bOnlyCount
    );

    // Jaccard index formula verification
    const expectedJaccard = Number((result.stats.commonCount / result.stats.totalUniqueCount).toFixed(4));
    expect(result.stats.jaccardIndex).toBe(expectedJaccard);
    expect(result.stats.matchPercentage).toBe(Math.round(expectedJaccard * 100));

    // Indie gems verification
    expect(result.indieGems.length).toBeGreaterThanOrEqual(1);
    expect(result.indieGems[0].title).toContain('微縮模型');
  });

  it('should return 100% match when users have identical channel lists', () => {
    const channels = YouTubeService.getMockSubscriptions('A');
    const result = calculateTasteBlend(channels, channels, 'Twin1', 'Twin2');

    expect(result.stats.matchPercentage).toBe(100);
    expect(result.stats.commonCount).toBe(channels.length);
    expect(result.stats.aOnlyCount).toBe(0);
    expect(result.stats.bOnlyCount).toBe(0);
    expect(result.stats.chemistryLevel).toContain('靈魂雙胞胎');
  });

  it('should return 0% match when users have disjoint channel lists', () => {
    const listA = [{ id: 'UC00000000000000000000001', title: 'Channel 1' }];
    const listB = [{ id: 'UC00000000000000000000002', title: 'Channel 2' }];

    const result = calculateTasteBlend(listA, listB);
    expect(result.stats.matchPercentage).toBe(0);
    expect(result.stats.commonCount).toBe(0);
    expect(result.stats.chemistryLevel).toContain('異次元拓荒者');
  });

  it('should assign correct chemistry tiers', () => {
    expect(getChemistryTier(90).level).toContain('靈魂雙胞胎');
    expect(getChemistryTier(75).level).toContain('志同道合');
    expect(getChemistryTier(50).level).toContain('品味知己');
    expect(getChemistryTier(25).level).toContain('互補探險家');
    expect(getChemistryTier(5).level).toContain('異次元拓荒者');
  });
});

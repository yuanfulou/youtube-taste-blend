import { describe, it, expect } from 'vitest';
import { 
  channelIdTo16Bytes, 
  bytes16ToChannelId, 
  packChannelIds, 
  unpackChannelIds, 
  getCompressionStats 
} from '../src/codec/channelCodec.js';

describe('Channel ID Binary & Brotli Codec', () => {
  // Real YouTube Channel IDs for testing
  const sampleChannels = [
    'UC_x5XG1OV2P6uZZ5FSM9Ttw', // Google Developers
    'UCBJycsmduvYEL83R_U4JriQ', // MKBHD
    'UC-lHJZR3Gqxm24_Vd_AJ5Yw', // PewDiePie
    'UCX6OQ3DkcsbYNE6H8uQQuVA', // MrBeast
    'UCsTcErHg8oDvUnTzoqsYeNw', // Veritasium
    'UC7_YxT-KID8kRbqZo7MyscQ', // Mark Rober
    'UCHnyfMqiRRG1u-2MsSQLbXA', // Veritasium second channel
    'UC2C_jShtL725hvbm1arSV9w', // Taiwan Bar
    'UCtinbFUXtCuCYZ3Uet1uFBA', // Joeman
    'UCsI0G1L8fL3P-2U6nN5eXkg'  // Mock channel
  ];

  it('should accurately convert a channel ID to 16 bytes and back without loss', () => {
    for (const channelId of sampleChannels) {
      const bytes = channelIdTo16Bytes(channelId);
      expect(bytes.length).toBe(16);

      const reconstructed = bytes16ToChannelId(bytes);
      expect(reconstructed).toBe(channelId);
    }
  });

  it('should compress and decompress a list of channel IDs with 100% fidelity', () => {
    const payload = packChannelIds(sampleChannels);
    expect(typeof payload).toBe('string');
    expect(payload.length).toBeGreaterThan(0);

    const unpacked = unpackChannelIds(payload);
    expect(unpacked).toEqual(sampleChannels);
  });

  it('should handle large batches of channels (e.g. 100 channels) efficiently', () => {
    // Generate 100 synthetic valid YouTube channel IDs
    const syntheticChannels: string[] = [];
    for (let i = 0; i < 100; i++) {
      const buf = Buffer.alloc(16);
      buf.writeUInt32BE(i * 1234567, 0);
      buf.writeUInt32BE(i * 7654321, 4);
      buf.writeUInt32BE(i * 9876543, 8);
      buf.writeUInt32BE(i * 3456789, 12);
      syntheticChannels.push(bytes16ToChannelId(buf));
    }

    const stats = getCompressionStats(syntheticChannels);
    expect(stats.channelCount).toBe(100);
    // 100 IDs as raw text = 2400 bytes. Compressed should be significantly smaller!
    expect(stats.compressedPayloadLength).toBeLessThan(stats.originalTextBytes);

    const unpacked = unpackChannelIds(stats.payload);
    expect(unpacked).toEqual(syntheticChannels);
  });

  it('should gracefully handle empty channel list', () => {
    expect(packChannelIds([])).toBe('');
    expect(unpackChannelIds('')).toEqual([]);
  });

  it('should throw clear error on corrupted or malformed payload', () => {
    expect(() => unpackChannelIds('invalid_corrupted_payload!@#$')).toThrow();
  });
});

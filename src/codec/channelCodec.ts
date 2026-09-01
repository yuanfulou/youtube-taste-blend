import zlib from 'node:zlib';

/**
 * YouTube Taste Blend - Channel ID Binary Codec
 * 
 * YouTube Channel ID format: "UC" + 22 Base64/Base64URL characters (e.g. UC_x5XG1OV2P6uZZ5FSM9Ttw)
 * 22 Base64 characters represent 128 bits (16 bytes) of raw binary data.
 */

/**
 * Converts a standard 24-character YouTube Channel ID ("UC" + 22 chars) into a 16-byte Buffer.
 */
export function channelIdTo16Bytes(channelId: string): Buffer {
  const trimmed = channelId.trim();
  if (!trimmed.startsWith('UC') || trimmed.length !== 24) {
    throw new Error(`Invalid YouTube Channel ID format: "${channelId}". Expected "UC" followed by 22 characters.`);
  }

  const raw22 = trimmed.slice(2);
  // Convert Base64URL to standard Base64 with padding
  const base64 = raw22.replace(/-/g, '+').replace(/_/g, '/') + '==';
  const buf = Buffer.from(base64, 'base64');
  
  if (buf.length !== 16) {
    throw new Error(`Decoded channel ID byte length is ${buf.length}, expected 16 bytes.`);
  }

  return buf;
}

/**
 * Converts a 16-byte Buffer back into a standard YouTube Channel ID ("UC" + 22 chars).
 */
export function bytes16ToChannelId(buffer: Buffer | Uint8Array, offset = 0): string {
  const slice = Buffer.isBuffer(buffer) 
    ? buffer.subarray(offset, offset + 16)
    : Buffer.from(buffer.buffer, buffer.byteOffset + offset, 16);

  if (slice.length !== 16) {
    throw new Error(`Expected 16 bytes to decode channel ID, got ${slice.length}.`);
  }

  const base64 = slice.toString('base64');
  // Convert standard Base64 to Base64URL and strip "==" padding
  const base64url = base64.replace(/\+/g, '-').replace(/\//g, '_').slice(0, 22);
  return `UC${base64url}`;
}

/**
 * Packs an array of YouTube Channel IDs into a single compressed Base64URL payload string.
 * Pipeline: [Channel IDs] -> Raw 16*N Bytes Buffer -> Brotli Compression -> Base64URL String
 */
export function packChannelIds(channelIds: string[]): string {
  // Deduplicate and filter valid IDs
  const uniqueIds = Array.from(new Set(channelIds.map(id => id.trim()))).filter(
    id => id.startsWith('UC') && id.length === 24
  );

  if (uniqueIds.length === 0) {
    return '';
  }

  // Concatenate all 16-byte raw buffers
  const rawBuffer = Buffer.allocUnsafe(uniqueIds.length * 16);
  uniqueIds.forEach((id, idx) => {
    const bytes16 = channelIdTo16Bytes(id);
    bytes16.copy(rawBuffer, idx * 16);
  });

  // Compress using Brotli with maximum quality for smallest URL footprint
  const compressed = zlib.brotliCompressSync(rawBuffer, {
    params: {
      [zlib.constants.BROTLI_PARAM_QUALITY]: 11,
      [zlib.constants.BROTLI_PARAM_MODE]: zlib.constants.BROTLI_MODE_GENERIC
    }
  });

  // Return Base64URL string (URL-safe without padding)
  return compressed.toString('base64url');
}

/**
 * Unpacks a compressed Base64URL payload string back into an array of YouTube Channel IDs.
 * Pipeline: Base64URL String -> Brotli Decompression -> Raw 16*N Bytes Buffer -> [Channel IDs]
 */
export function unpackChannelIds(payload: string): string[] {
  if (!payload || payload.trim() === '') {
    return [];
  }

  try {
    const compressedBuffer = Buffer.from(payload.trim(), 'base64url');
    const decompressed = zlib.brotliDecompressSync(compressedBuffer);

    if (decompressed.length % 16 !== 0) {
      throw new Error(`Decompressed data length (${decompressed.length}) is not a multiple of 16.`);
    }

    const count = decompressed.length / 16;
    const channelIds: string[] = [];

    for (let i = 0; i < count; i++) {
      channelIds.push(bytes16ToChannelId(decompressed, i * 16));
    }

    return channelIds;
  } catch (err: any) {
    throw new Error(`Failed to unpack channel IDs payload: ${err.message}`);
  }
}

/**
 * Returns diagnostic compression stats for a given list of channel IDs.
 */
export function getCompressionStats(channelIds: string[]) {
  const packed = packChannelIds(channelIds);
  const rawBytes = channelIds.length * 24; // If stored as plain JSON strings
  const packedBytes = Buffer.byteLength(packed, 'utf8');
  const ratio = rawBytes > 0 ? ((1 - packedBytes / rawBytes) * 100).toFixed(1) : '0';

  return {
    channelCount: channelIds.length,
    originalTextBytes: rawBytes,
    binaryPackedBytes: channelIds.length * 16,
    compressedPayloadLength: packedBytes,
    compressionRatio: `${ratio}% saved`,
    payload: packed
  };
}

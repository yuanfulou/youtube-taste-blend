import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../src/server.js';
import { packChannelIds } from '../src/codec/channelCodec.js';
describe('YouTube Taste Blend Backend API Routes', () => {
    it('GET /api/health should return ok and server info', async () => {
        const res = await request(app).get('/api/health');
        expect(res.status).toBe(200);
        expect(res.body.status).toBe('ok');
        expect(res.body.service).toBe('YouTube Taste Blend Backend');
    });
    it('GET /auth/status should return auth & config state', async () => {
        const res = await request(app).get('/auth/status');
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('configured');
        expect(res.body).toHaveProperty('authenticated');
    });
    it('GET /api/mock/subscriptions should return rich test channels', async () => {
        const resA = await request(app).get('/api/mock/subscriptions?profile=A');
        expect(resA.status).toBe(200);
        expect(resA.body.source).toBe('mock');
        expect(resA.body.channels.length).toBeGreaterThan(5);
        const resB = await request(app).get('/api/mock/subscriptions?profile=B');
        expect(resB.status).toBe(200);
        expect(resB.body.channels.length).toBeGreaterThan(5);
    });
    it('POST /api/pack and POST /api/unpack should compress and decompress cleanly', async () => {
        const testChannels = [
            'UCBJycsmduvYEL83R_U4JriQ',
            'UC_x5XG1OV2P6uZZ5FSM9Ttw',
            'UCsTcErHg8oDvUnTzoqsYeNw'
        ];
        // Pack
        const packRes = await request(app)
            .post('/api/pack')
            .send({ channelIds: testChannels });
        expect(packRes.status).toBe(200);
        expect(packRes.body.success).toBe(true);
        expect(packRes.body.payload).toBeDefined();
        // Unpack
        const unpackRes = await request(app)
            .post('/api/unpack')
            .send({ payload: packRes.body.payload });
        expect(unpackRes.status).toBe(200);
        expect(unpackRes.body.success).toBe(true);
        expect(unpackRes.body.channelIds).toEqual(testChannels);
    });
    it('POST /api/blend should calculate taste overlap between two compressed payloads', async () => {
        const channelsA = [
            'UCBJycsmduvYEL83R_U4JriQ', // MKBHD (Common)
            'UC_x5XG1OV2P6uZZ5FSM9Ttw', // Google Developers (A only)
            'UCsTcErHg8oDvUnTzoqsYeNw' // Veritasium (Common)
        ];
        const channelsB = [
            'UCBJycsmduvYEL83R_U4JriQ', // MKBHD (Common)
            'UCsTcErHg8oDvUnTzoqsYeNw', // Veritasium (Common)
            'UC7_YxT-KID8kRbqZo7MyscQ' // Mark Rober (B only)
        ];
        const payloadA = packChannelIds(channelsA);
        const payloadB = packChannelIds(channelsB);
        const res = await request(app)
            .post('/api/blend')
            .send({
            userA: { name: 'Alice', payload: payloadA },
            userB: { name: 'Bob', payload: payloadB }
        });
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.result.userA.name).toBe('Alice');
        expect(res.body.result.userB.name).toBe('Bob');
        expect(res.body.result.stats.commonCount).toBe(2);
        expect(res.body.result.stats.aOnlyCount).toBe(1);
        expect(res.body.result.stats.bOnlyCount).toBe(1);
        expect(res.body.result.stats.totalUniqueCount).toBe(4);
        expect(res.body.result.stats.matchPercentage).toBe(50); // 2/4 = 50%
    });
});

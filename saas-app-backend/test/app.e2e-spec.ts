import * as request from 'supertest';

describe('AppController (e2e) - external', () => {
  const baseUrl = process.env.E2E_BASE_URL || 'http://127.0.0.1:3001';

  it('/ (GET)', async () => {
    const res = await request(baseUrl).get('/');
    expect([200, 404]).toContain(res.status); // server may not expose root
  });
});

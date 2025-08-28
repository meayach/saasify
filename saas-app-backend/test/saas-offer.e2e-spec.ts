import * as request from 'supertest';

describe('SaasOffer (e2e) - external server', () => {
  const baseUrl = process.env.E2E_BASE_URL || 'http://127.0.0.1:3001';

  it('POST /api/v1/saas-offers then GET by application (requires running server + DB)', async () => {
    const applicationId = process.env.TEST_APPLICATION_ID || '68a87801a0fc8740c837946c';

    const postRes = await request(baseUrl)
      .post('/api/v1/saas-offers')
      .send({ offerName: 'E2E Offer', saasApplicationId: applicationId, plans: [] })
      .set('Accept', 'application/json');

    expect([200, 201]).toContain(postRes.status);

    const getRes = await request(baseUrl).get(`/api/v1/saas-offers/application/${applicationId}`);
    expect(getRes.status).toBe(200);
    expect(Array.isArray(getRes.body)).toBe(true);
  });
});

var request = require('supertest');

let authToken: string;
describe('Auth Service E2E', () => {
  const baseUrl = `${process.env.API_GATEWAY_URL}/auth`;

  it('should register a new user', async () => {
    const res = await request(baseUrl)
      .post('/signup')
      .send({email: 'test@example.com', name: 'test user', password: 'securepass'});

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('token');
    expect(res.body).toHaveProperty('user');
    authToken = res.body.token;
  });

  it('should sign in an existing user', async () => {
    const res = await request(baseUrl)
      .post('/signin')
      .send({email: 'test@example.com', password: 'securepass'});

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('token');
    expect(res.body).toHaveProperty('user');
    authToken = res.body.token;
  });

  it('should request a service token', async () => {
    const res = await request(baseUrl)
      .post('/service-token')
      .set('x-service-secret', process.env.SERVICE_SECRET || 'test-service-secret')
      .send({serviceName: "subscription-service"});

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('token');
  });

});

describe('Subscription Service E2E', () => {
  const baseUrl = `${process.env.API_GATEWAY_URL}/subscriptions`;
  let productId: string;

  it('should create a new subscription', async () => {
    const res = await request(baseUrl)
      .post('/')
      .send({ url: 'https://intersport.com.au/products/resistance-system' })
      .set('Authorization', `Bearer ${authToken}`);

    console.log(res.body);
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('url');
    productId = res.body.id;
  });

  it('should return all subscriptions', async () => {
    const res = await request(baseUrl)
      .get('/')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBeTruthy();
  });

  it('should unsubscribe from a product', async () => {
    const res = await request(baseUrl)
      .post('/unsubscribe')
      .send({ productId })
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(201);
  });
});

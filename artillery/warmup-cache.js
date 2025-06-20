const redis = require('ioredis');
const products = require('../libs/shared/scripts/products.json');

const TTL = 3600;
const redisClient = new redis.Redis({
  host: 'localhost',
  port: 6380
});

redisClient.on('error', err => console.error('Redis connection error', err));

async function warmup() {
  for (const url of products) {
    const price = +(Math.random() * 1000).toFixed(2);
    const cacheData = {
      price,
      timestamp: Date.now(),
    };

    await redisClient.set(
      url,
      JSON.stringify(cacheData),
      'EX',
      TTL
    );
  }

  await redisClient.quit();
}

warmup().catch(console.error);

const prismaModule = require('@prisma/client');
const {PrismaClient} = prismaModule;
const products = require('./products.json');

const prisma = new PrismaClient();

async function main() {
  for (const url of products) {
    await prisma.product.upsert({
      where: {url},
      update: {},
      create: {
        url,
        name: 'Test Product',
        currentPrice: Math.floor(Math.random() * 1000),
      },
    });
  }
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

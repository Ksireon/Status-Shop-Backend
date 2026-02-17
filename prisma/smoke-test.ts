import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const email = 'test_user@status-shop.local';
  const password = 'Test123456';
  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.upsert({
    where: { email },
    create: {
      email,
      passwordHash,
      name: 'Test User',
      phone: '+998000000000',
      city: 'Tashkent',
    },
    update: {
      passwordHash,
      name: 'Test User',
      phone: '+998000000000',
      city: 'Tashkent',
    },
    select: {
      id: true,
      email: true,
      role: true,
      name: true,
      phone: true,
      city: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  const usersCount = await prisma.user.count();
  const productsCount = await prisma.product.count();
  const shopsCount = await prisma.shop.count();

  return { user, usersCount, productsCount, shopsCount };
}

main()
  .then(async (res) => {
    await prisma.$disconnect();
    process.stdout.write(JSON.stringify(res, null, 2));
    process.stdout.write('\n');
  })
  .catch(async (e: unknown) => {
    await prisma.$disconnect();
    throw e;
  });

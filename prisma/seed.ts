import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const textile = await prisma.category.upsert({
    where: { slug: 'textile' },
    create: {
      slug: 'textile',
      name: { ru: 'Текстиль', uz: 'Tekstil', en: 'Textile' },
    },
    update: {},
  });

  const vinyl = await prisma.category.upsert({
    where: { slug: 'vinyl' },
    create: { slug: 'vinyl', name: { ru: 'Винил', uz: 'Vinil', en: 'Vinyl' } },
    update: {},
  });

  const accessories = await prisma.category.upsert({
    where: { slug: 'accessories' },
    create: {
      slug: 'accessories',
      name: { ru: 'Аксессуары', uz: 'Aksessuarlar', en: 'Accessories' },
    },
    update: {},
  });

  await prisma.shop.upsert({
    where: { key: 'main' },
    create: {
      key: 'main',
      name: { ru: 'Главный филиал', uz: 'Asosiy filial', en: 'Main branch' },
      city: 'Tashkent',
      address: 'Tashkent, Example street 1',
      phone: '+998000000000',
      hours: '10:00-20:00',
      isActive: true,
    },
    update: {},
  });

  await prisma.product.upsert({
    where: {
      id: '00000000-0000-0000-0000-000000000001',
    },
    create: {
      id: '00000000-0000-0000-0000-000000000001',
      categoryId: textile.id,
      type: 'textile',
      price: 95000,
      isActive: true,
      name: {
        ru: 'Футболка Статус',
        uz: 'Status futbolkasi',
        en: 'Status T-shirt',
      },
      description: {
        ru: 'Футболка из плотного хлопка премиум-класса.',
        uz: 'Premium sifatli paxtadan tikilgan futbolka.',
        en: 'Premium-quality cotton T-shirt.',
      },
      characteristics: {
        material: { ru: 'Хлопок 100%', uz: '100% paxta', en: '100% cotton' },
        weight: { ru: '180 г/м²', uz: '180 g/m²', en: '180 g/m²' },
      },
      images: {
        create: [{ url: 'https://example.com/images/tshirt.png', sort: 0 }],
      },
    },
    update: {},
  });

  await prisma.product.upsert({
    where: {
      id: '00000000-0000-0000-0000-000000000002',
    },
    create: {
      id: '00000000-0000-0000-0000-000000000002',
      categoryId: vinyl.id,
      type: 'vinyl',
      price: 140000,
      isActive: true,
      name: { ru: 'PU Flex', uz: 'PU Flex', en: 'PU Flex' },
      description: {
        ru: 'PU Flex — премиальная термотрансферная плёнка высокой эластичности.',
        uz: 'PU Flex — yuqori elastiklik va yorqin rang beruvchi premium termo plyonka.',
        en: 'PU Flex — premium heat transfer film with high elasticity.',
      },
      characteristics: {
        width: { ru: '50 см', uz: '50 sm', en: '50 cm' },
        temp: { ru: '150°C', uz: '150°C', en: '150°C' },
      },
      images: {
        create: [{ url: 'https://example.com/images/pu_1.png', sort: 0 }],
      },
    },
    update: {},
  });

  await prisma.product.upsert({
    where: {
      id: '00000000-0000-0000-0000-000000000003',
    },
    create: {
      id: '00000000-0000-0000-0000-000000000003',
      categoryId: accessories.id,
      type: 'bag',
      price: 55000,
      isActive: true,
      name: { ru: 'ЭКО сумка', uz: 'EKO sumka', en: 'ECO Bag' },
      description: {
        ru: 'Экологичная сумка из спанбонда — лёгкая и прочная.',
        uz: 'Spanbonddan yasalgan ekologik sumka — yengil va mustahkam.',
        en: 'Eco-friendly bag made of spunbond — lightweight and durable.',
      },
      images: {
        create: [{ url: 'https://example.com/images/eco_bag.png', sort: 0 }],
      },
    },
    update: {},
  });

  const ownerEmail = process.env.OWNER_EMAIL;
  const ownerPassword = process.env.OWNER_PASSWORD;
  if (ownerEmail && ownerPassword) {
    const passwordHash = await bcrypt.hash(ownerPassword, 10);
    await prisma.user.upsert({
      where: { email: ownerEmail },
      create: {
        email: ownerEmail,
        passwordHash,
        role: UserRole.OWNER,
        name: 'Owner',
      },
      update: {
        passwordHash,
        role: UserRole.OWNER,
      },
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e: unknown) => {
    await prisma.$disconnect();
    throw e;
  });

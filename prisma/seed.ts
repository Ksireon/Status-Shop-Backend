import { Prisma, PrismaClient, UserRole } from '@prisma/client';
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

  const mainShop = await prisma.shop.upsert({
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
      stockQuantity: 50,
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
        create: [
          { url: 'https://placehold.co/400x400/ffffff/000000?text=White+T-Shirt', sort: 0, label: 'Белый' },
          { url: 'https://placehold.co/400x400/000000/ffffff?text=Black+T-Shirt', sort: 1, label: 'Черный' },
          { url: 'https://placehold.co/400x400/ff0000/ffffff?text=Red+T-Shirt', sort: 2, label: 'Красный' },
          { url: 'https://placehold.co/400x400/0000ff/ffffff?text=Blue+T-Shirt', sort: 3, label: 'Синий' },
        ],
      },
    } as Prisma.ProductCreateInput,
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
      stockQuantity: 80,
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
        create: [
          { url: 'https://placehold.co/400x400/ffffff/000000?text=PU+White', sort: 0, label: 'Белый' },
          { url: 'https://placehold.co/400x400/000000/ffffff?text=PU+Black', sort: 1, label: 'Черный' },
          { url: 'https://placehold.co/400x400/ff0000/ffffff?text=PU+Red', sort: 2, label: 'Красный' },
          { url: 'https://placehold.co/400x400/ffd700/000000?text=PU+Gold', sort: 3, label: 'Золотой' },
          { url: 'https://placehold.co/400x400/c0c0c0/000000?text=PU+Silver', sort: 4, label: 'Серебряный' },
        ],
      },
    } as Prisma.ProductCreateInput,
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
      stockQuantity: 40,
      isActive: true,
      name: { ru: 'ЭКО сумка', uz: 'EKO sumka', en: 'ECO Bag' },
      description: {
        ru: 'Экологичная сумка из спанбонда — лёгкая и прочная.',
        uz: 'Spanbonddan yasalgan ekologik sumka — yengil va mustahkam.',
        en: 'Eco-friendly bag made of spunbond — lightweight and durable.',
      },
      images: {
        create: [
          { url: 'https://placehold.co/400x400/ffffff/000000?text=Eco+Bag+White', sort: 0, label: 'Белый' },
          { url: 'https://placehold.co/400x400/000000/ffffff?text=Eco+Bag+Black', sort: 1, label: 'Черный' },
          { url: 'https://placehold.co/400x400/f5f5dc/000000?text=Eco+Bag+Beige', sort: 2, label: 'Бежевый' },
        ],
      },
    } as Prisma.ProductCreateInput,
    update: {},
  });

  // ── Admin Dashboard Users ──────────────────────────────────────────
  const dashboardUsers: {
    email: string;
    password: string;
    role: UserRole;
    name: string;
  }[] = [
    {
      email: 'owner@status.uz',
      password: 'Status_shop_owner123',
      role: UserRole.OWNER,
      name: 'Owner',
    },
    {
      email: 'director@status.uz',
      password: 'Status_shop_director123',
      role: UserRole.BRANCH_DIRECTOR,
      name: 'Director',
    },
    {
      email: 'manager@status.uz',
      password: 'Status_shop_manager123',
      role: UserRole.MANAGER,
      name: 'Manager',
    },
  ];

  for (const u of dashboardUsers) {
    const hash = await bcrypt.hash(u.password, 10);
    await prisma.user.upsert({
      where: { email: u.email },
      create: {
        email: u.email,
        passwordHash: hash,
        role: u.role,
        name: u.name,
        shopId: mainShop.id,
      },
      update: {
        passwordHash: hash,
        role: u.role,
        shopId: mainShop.id,
      },
    });
  }

  // Legacy owner from env vars (kept for backward compatibility)
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

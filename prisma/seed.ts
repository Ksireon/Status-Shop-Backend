import { PrismaClient, ProductUnit, UserRole } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import * as bcrypt from 'bcrypt';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error('DATABASE_URL is required');
const pool = new pg.Pool({ connectionString });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

async function upsertUser(params: {
  email: string;
  password: string;
  role: UserRole;
  name: string;
  surname: string;
  phone: string;
  city: string;
  company?: string;
  position?: string;
}) {
  const passwordHash = await bcrypt.hash(params.password, 10);
  await prisma.user.upsert({
    where: { email: params.email },
    create: {
      email: params.email,
      passwordHash,
      role: params.role,
      name: params.name,
      surname: params.surname,
      phone: params.phone,
      city: params.city,
      company: params.company,
      position: params.position,
    },
    update: {
      role: params.role,
      name: params.name,
      surname: params.surname,
      phone: params.phone,
      city: params.city,
      company: params.company,
      position: params.position,
    },
  });
}

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@status.local';
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin12345';
  const supportEmail = process.env.SUPPORT_EMAIL || 'support@status.local';
  const supportPassword = process.env.SUPPORT_PASSWORD || 'support12345';

  await upsertUser({
    email: adminEmail,
    password: adminPassword,
    role: UserRole.ADMIN,
    name: 'Admin',
    surname: 'Status',
    phone: '+998900000000',
    city: 'Tashkent',
  });

  await upsertUser({
    email: supportEmail,
    password: supportPassword,
    role: UserRole.SUPPORT,
    name: 'Support',
    surname: 'Status',
    phone: '+998901111111',
    city: 'Tashkent',
  });

  const categories = [
    {
      key: 'textile',
      ru: 'Текстиль',
      uz: 'Tekstil',
      en: 'Textile',
      icon: 'checkroom',
      sortOrder: 1,
    },
    {
      key: 'vinil',
      ru: 'Термо винил',
      uz: 'Termo vinil',
      en: 'Heat vinyl',
      icon: 'layers',
      sortOrder: 2,
    },
    {
      key: 'dtf',
      ru: 'DTF материалы',
      uz: 'DTF materiallari',
      en: 'DTF materials',
      icon: 'print',
      sortOrder: 3,
    },
    {
      key: 'cups',
      ru: 'Сублимационные кружки',
      uz: 'Sublimatsiya krujkalar',
      en: 'Sublimation mugs',
      icon: 'coffee',
      sortOrder: 4,
    },
    {
      key: 'equipment',
      ru: 'Оборудование',
      uz: 'Uskunalar',
      en: 'Equipment',
      icon: 'precision_manufacturing',
      sortOrder: 5,
    },
  ];

  for (const c of categories) {
    await prisma.category.upsert({
      where: { key: c.key },
      create: {
        key: c.key,
        nameRu: c.ru,
        nameUz: c.uz,
        nameEn: c.en,
        icon: c.icon,
        sortOrder: c.sortOrder,
        isActive: true,
      },
      update: {
        nameRu: c.ru,
        nameUz: c.uz,
        nameEn: c.en,
        icon: c.icon,
        sortOrder: c.sortOrder,
        isActive: true,
      },
    });
  }

  const shops = [
    {
      key: 'tashkent',
      cityRu: 'Ташкент',
      cityUz: 'Toshkent',
      cityEn: 'Tashkent',
      addressRu: 'Чиланзар, 1-й квартал 59',
      addressUz: 'Chilonzor, 1-kvartal 59',
      addressEn: 'Chilanzar, Block 1, 59',
      phone: '+998901760104',
      workHours: 'Пн-Сб: 10:00–19:00',
      sortOrder: 1,
    },
  ];

  for (const s of shops) {
    await prisma.shop.upsert({
      where: { key: s.key },
      create: {
        key: s.key,
        cityRu: s.cityRu,
        cityUz: s.cityUz,
        cityEn: s.cityEn,
        addressRu: s.addressRu,
        addressUz: s.addressUz,
        addressEn: s.addressEn,
        phone: s.phone,
        workHours: s.workHours,
        isActive: true,
        sortOrder: s.sortOrder,
      },
      update: {
        cityRu: s.cityRu,
        cityUz: s.cityUz,
        cityEn: s.cityEn,
        addressRu: s.addressRu,
        addressUz: s.addressUz,
        addressEn: s.addressEn,
        phone: s.phone,
        workHours: s.workHours,
        isActive: true,
        sortOrder: s.sortOrder,
      },
    });
  }

  const textile = await prisma.category.findUnique({
    where: { key: 'textile' },
  });
  const vinil = await prisma.category.findUnique({ where: { key: 'vinil' } });

  if (textile) {
    await prisma.product.upsert({
      where: { id: 'seed-textile-tshirt' },
      create: {
        id: 'seed-textile-tshirt',
        type: 'clothes',
        unit: ProductUnit.PIECE,
        nameRu: 'Футболка Статус',
        nameUz: 'Status futbolkasi',
        nameEn: 'Status T-shirt',
        descRu: 'Футболка из плотного хлопка премиум-класса.',
        descUz: 'Premium sifatli paxtadan tikilgan futbolka.',
        descEn: 'Premium-quality cotton T-shirt.',
        price: 95000,
        images: ['assets/images/tshirt.png'],
        sizes: ['S', 'M', 'L', 'XL', 'XXL'],
        colors: [],
        characteristics: { material: 'cotton' },
        isActive: true,
        isFeatured: true,
        sortOrder: 1,
        category: { connect: { id: textile.id } },
      },
      update: {
        categoryId: textile.id,
        unit: ProductUnit.PIECE,
        isActive: true,
      },
    });
  }

  if (vinil) {
    await prisma.product.upsert({
      where: { id: 'seed-vinil-pu-flex' },
      create: {
        id: 'seed-vinil-pu-flex',
        type: 'vinil',
        unit: ProductUnit.METER,
        nameRu: 'PU Flex',
        nameUz: 'PU Flex',
        nameEn: 'PU Flex',
        descRu: 'PU Flex — премиальная термотрансферная плёнка.',
        descUz: 'PU Flex — premium termo plyonka.',
        descEn: 'PU Flex — premium heat transfer film.',
        price: 140000,
        images: ['assets/vinill/pu/pu_1.png'],
        sizes: [],
        colors: [],
        characteristics: { width: '50cm' },
        isActive: true,
        isFeatured: true,
        sortOrder: 2,
        category: { connect: { id: vinil.id } },
      },
      update: {
        categoryId: vinil.id,
        unit: ProductUnit.METER,
        isActive: true,
      },
    });
  }
}

main()
  .catch((e) => {
    throw e;
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });

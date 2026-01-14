import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { PrismaClient, UserRole } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import * as bcrypt from 'bcrypt';

const hasDb = Boolean(
  process.env.DATABASE_URL && process.env.DATABASE_URL.trim().length > 0,
);
const shouldRun = process.env.RUN_E2E === 'true';

const describeDb = hasDb && shouldRun ? describe : describe.skip;

describeDb('API (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaClient;
  let pool: pg.Pool;

  beforeAll(async () => {
    pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
    prisma = new PrismaClient({ adapter: new PrismaPg(pool) });
    await prisma.$connect();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    const passwordHash = await bcrypt.hash('admin12345', 10);
    await prisma.user.upsert({
      where: { email: 'admin@e2e.local' },
      create: {
        email: 'admin@e2e.local',
        passwordHash,
        role: UserRole.ADMIN,
        name: 'Admin',
        surname: 'E2E',
        city: 'Tashkent',
        phone: '+998900000001',
      },
      update: { passwordHash, role: UserRole.ADMIN },
    });
  });

  afterAll(async () => {
    await app.close();
    await prisma.$disconnect();
    await pool.end();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });

  it('auth: register/login returns access+refresh', async () => {
    const email = `user_${Date.now()}@e2e.local`;
    const password = 'password123';

    const registerRes = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({
        email,
        password,
        name: 'User',
        surname: 'E2E',
        phone: '+998900000002',
        city: 'Tashkent',
      })
      .expect(201);

    const registerBody = registerRes.body as {
      accessToken?: string;
      refreshToken?: string;
    };
    expect(registerBody.accessToken).toBeTruthy();
    expect(registerBody.refreshToken).toBeTruthy();

    const loginRes = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email, password })
      .expect(201);

    const loginBody = loginRes.body as {
      accessToken?: string;
      refreshToken?: string;
    };
    expect(loginBody.accessToken).toBeTruthy();
    expect(loginBody.refreshToken).toBeTruthy();
  });

  it('auth: refresh rotation + reuse detection', async () => {
    const email = `user_${Date.now()}@e2e.local`;
    const password = 'password123';

    const loginRes = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({
        email,
        password,
        name: 'User',
        surname: 'E2E',
        phone: '+998900000003',
        city: 'Tashkent',
      })
      .expect(201);

    const firstRefresh = (loginRes.body as { refreshToken?: string })
      .refreshToken as string;

    const refreshRes = await request(app.getHttpServer())
      .post('/api/auth/refresh')
      .send({ refreshToken: firstRefresh })
      .expect(201);

    const secondRefresh = (refreshRes.body as { refreshToken?: string })
      .refreshToken as string;
    expect(secondRefresh).toBeTruthy();
    expect(secondRefresh).not.toEqual(firstRefresh);

    await request(app.getHttpServer())
      .post('/api/auth/refresh')
      .send({ refreshToken: firstRefresh })
      .expect(401);

    await request(app.getHttpServer())
      .post('/api/auth/refresh')
      .send({ refreshToken: secondRefresh })
      .expect(401);
  });

  it('rbac: admin endpoints require ADMIN/MANAGER', async () => {
    const loginRes = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: 'admin@e2e.local', password: 'admin12345' })
      .expect(201);

    const token = (loginRes.body as { accessToken?: string })
      .accessToken as string;
    expect(token).toBeTruthy();

    await request(app.getHttpServer()).get('/api/admin/categories').expect(401);

    await request(app.getHttpServer())
      .get('/api/admin/categories')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
  });
});

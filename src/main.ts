import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import compression from 'compression';
import helmet from 'helmet';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { HttpLoggingInterceptor } from './common/logging/http-logging.interceptor';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.disable('x-powered-by');
  app.setGlobalPrefix('api');
  app.set('trust proxy', parseTrustProxy(process.env.TRUST_PROXY));
  app.use(helmet());
  app.use(compression());
  app.enableCors(buildCorsOptions());

  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalInterceptors(new HttpLoggingInterceptor());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  if (swaggerEnabled(process.env)) {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('Status Shop API')
      .setDescription('REST API for Status Shop')
      .setVersion('1.0')
      .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api/docs', app, document);
  }

  app.enableShutdownHooks();
  await app.listen(Number(process.env.PORT) || 3000);
}
void bootstrap();

function swaggerEnabled(env: NodeJS.ProcessEnv) {
  const raw = (env.SWAGGER_ENABLED ?? '').toString().trim().toLowerCase();
  if (raw === 'true') return true;
  if (raw === 'false') return false;
  return (env.NODE_ENV ?? 'development') !== 'production';
}

function buildCorsOptions(): {
  origin:
    | string[]
    | boolean
    | ((
        origin: string | undefined,
        cb: (err: Error | null, allow?: boolean) => void,
      ) => void);
  credentials: boolean;
} {
  const nodeEnv = (process.env.NODE_ENV ?? 'development').toString();
  const raw = (process.env.CORS_ORIGINS ?? '').toString().trim();
  if (nodeEnv !== 'production' && raw.length === 0) {
    return { origin: true, credentials: true };
  }

  const allowed = raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  if (allowed.length === 0) return { origin: false, credentials: true };

  return {
    origin: (origin, cb) => {
      if (!origin) return cb(null, true);
      cb(null, allowed.includes(origin));
    },
    credentials: true,
  };
}

function parseTrustProxy(raw: unknown): boolean | number {
  if (raw === undefined || raw === null) return false;
  const v =
    typeof raw === 'string'
      ? raw.trim().toLowerCase()
      : typeof raw === 'number'
        ? raw.toString()
        : typeof raw === 'boolean'
          ? raw.toString()
          : '';
  if (v.length === 0) return false;
  if (v === 'true') return true;
  if (v === 'false') return false;
  const asNumber = Number(v);
  if (Number.isFinite(asNumber)) return asNumber;
  return false;
}

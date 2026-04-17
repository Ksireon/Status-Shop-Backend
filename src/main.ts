import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import compression from 'compression';
import helmet from 'helmet';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger } from 'nestjs-pino';
import { AppModule } from './app.module';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { ExpressAdapter } from '@nestjs/platform-express';
import * as express from 'express';

const expressApp = express.default || express;

const server = expressApp();
let cachedApp: any;

async function createApp() {
  const app = await NestFactory.create<NestExpressApplication>(
    AppModule,
    new ExpressAdapter(server),
  );

  // Serve static files from uploads directory
  app.useStaticAssets(join(process.cwd(), 'uploads'), {
    prefix: '/uploads',
  });

  app.useLogger(app.get(Logger));
  app.enableShutdownHooks();

  const corsOriginEnv = process.env.CORS_ORIGIN;
  const originList =
    corsOriginEnv && corsOriginEnv.trim() && corsOriginEnv.trim() !== '*'
      ? corsOriginEnv
          .split(',')
          .map((o) => o.trim())
          .filter((o) => o.length > 0)
      : null;
  const origin = originList && originList.length > 0 ? originList : '*';

  // Включаем credentials всегда для поддержки авторизации через JWT
  app.enableCors({
    origin,
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Accept, Authorization',
  });

  app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  }));
  app.use(compression());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(
    new LoggingInterceptor(),
    new ResponseInterceptor(),
  );

  app.setGlobalPrefix('api');
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Status Shop API')
    .setVersion('1.0.0')
    .addBearerAuth()
    .addServer('http://64.112.127.107:3000')
    .addServer('/api/v1')
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
  });

  await app.init();
  return app;
}

// For Vercel serverless
export default async function handler(req: any, res: any) {
  if (!cachedApp) {
    cachedApp = await createApp();
  }
  server(req, res);
}

// For local development
if (process.env.NODE_ENV !== 'production' || process.env.LOCAL_DEV) {
  async function bootstrap() {
    const app = await NestFactory.create<NestExpressApplication>(AppModule);

    app.useStaticAssets(join(process.cwd(), 'uploads'), {
      prefix: '/uploads',
    });

    app.useLogger(app.get(Logger));
    app.enableShutdownHooks();

    const corsOriginEnv = process.env.CORS_ORIGIN;
    const originList =
      corsOriginEnv && corsOriginEnv.trim() && corsOriginEnv.trim() !== '*'
        ? corsOriginEnv
            .split(',')
            .map((o) => o.trim())
            .filter((o) => o.length > 0)
        : null;
    const origin = originList && originList.length > 0 ? originList : '*';

    // Включаем credentials всегда для поддержки авторизации через JWT
    app.enableCors({
      origin,
      credentials: true,
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
      allowedHeaders: 'Content-Type, Accept, Authorization',
    });

    app.use(helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    }));
    app.use(compression());

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    app.useGlobalFilters(new HttpExceptionFilter());
    app.useGlobalInterceptors(
      new LoggingInterceptor(),
      new ResponseInterceptor(),
    );

    app.setGlobalPrefix('api');
    app.enableVersioning({
      type: VersioningType.URI,
      defaultVersion: '1',
    });

    const swaggerConfig = new DocumentBuilder()
      .setTitle('Status Shop API')
      .setVersion('1.0.0')
      .addBearerAuth()
      .addServer('http://64.112.127.107:3000')
      .addServer('/api/v1')
      .build();
    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api/docs', app, document, {
      swaggerOptions: {
        tagsSorter: 'alpha',
        operationsSorter: 'alpha',
      },
    });

    // Bind to 0.0.0.0 to accept connections from outside the container
    await app.listen(Number(process.env.PORT ?? 3000), '0.0.0.0');
    console.log(`Application is running on: ${await app.getUrl()}`);
  }
  bootstrap();
}

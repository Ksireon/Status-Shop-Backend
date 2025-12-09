import 'reflect-metadata'
import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { ValidationPipe } from '@nestjs/common'
import { HttpErrorFilter } from './common/filters/http-exception.filter'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import * as cors from 'cors'
import helmet from 'helmet'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  app.use(helmet())
  const allowed = (process.env.ALLOWED_ORIGINS || '').split(',').filter(Boolean)
  app.use(cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true)
      if (allowed.length === 0) {
        if (/^http:\/\/localhost:\d+$/.test(origin) || /^http:\/\/127\.0\.0\.1:\d+$/.test(origin)) return cb(null, true)
        return cb(new Error('Not allowed by CORS'))
      }
      if (allowed.includes(origin)) return cb(null, true)
      return cb(new Error('Not allowed by CORS'))
    },
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE']
  }))
  app.setGlobalPrefix('api/v1', { exclude: ['docs'] })
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }))
  app.useGlobalFilters(new HttpErrorFilter())

  const config = new DocumentBuilder()
    .setTitle('Status Shop API')
    .setDescription('OpenAPI документация для Status Shop')
    .setVersion('1.0.0')
    .addBearerAuth()
    .build()
  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('docs', app, document)

  const port = process.env.PORT ? Number(process.env.PORT) : 3001
  await app.listen(port)
}

bootstrap()

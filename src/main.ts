import 'reflect-metadata'
import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { ValidationPipe } from '@nestjs/common'
import { HttpErrorFilter } from './common/filters/http-exception.filter'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import * as cors from 'cors'
import helmet from 'helmet'
import { IoAdapter } from '@nestjs/platform-socket.io'
import { setDefaultResultOrder } from 'node:dns'

async function bootstrap() {
  setDefaultResultOrder('ipv4first')
  const app = await NestFactory.create(AppModule)
  app.use(helmet())
  const allowed = (process.env.ALLOWED_ORIGINS || '').split(',').filter(Boolean)
  app.use(cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true)
      if (allowed.length === 0) return cb(null, true)
      if (allowed.includes(origin)) return cb(null, true)
      return cb(new Error('Not allowed by CORS'))
    },
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE']
  }))
  app.useWebSocketAdapter(new IoAdapter(app))
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

  const port = Number(process.env.PORT || 8080)
  await app.listen(port)
}

bootstrap()

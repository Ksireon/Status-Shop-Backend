"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const swagger_1 = require("@nestjs/swagger");
const compression_1 = __importDefault(require("compression"));
const helmet_1 = __importDefault(require("helmet"));
const all_exceptions_filter_1 = require("./common/filters/all-exceptions.filter");
const http_logging_interceptor_1 = require("./common/logging/http-logging.interceptor");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.disable('x-powered-by');
    app.setGlobalPrefix('api');
    app.set('trust proxy', parseTrustProxy(process.env.TRUST_PROXY));
    app.use((0, helmet_1.default)());
    app.use((0, compression_1.default)());
    app.enableCors(buildCorsOptions());
    app.useGlobalFilters(new all_exceptions_filter_1.AllExceptionsFilter());
    app.useGlobalInterceptors(new http_logging_interceptor_1.HttpLoggingInterceptor());
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
    }));
    if (swaggerEnabled(process.env)) {
        const swaggerConfig = new swagger_1.DocumentBuilder()
            .setTitle('Status Shop API')
            .setDescription('REST API for Status Shop')
            .setVersion('1.0')
            .addBearerAuth()
            .build();
        const document = swagger_1.SwaggerModule.createDocument(app, swaggerConfig);
        swagger_1.SwaggerModule.setup('api/docs', app, document);
    }
    app.enableShutdownHooks();
    await app.listen(Number(process.env.PORT) || 3000);
}
void bootstrap();
function swaggerEnabled(env) {
    const raw = (env.SWAGGER_ENABLED ?? '').toString().trim().toLowerCase();
    if (raw === 'true')
        return true;
    if (raw === 'false')
        return false;
    return (env.NODE_ENV ?? 'development') !== 'production';
}
function buildCorsOptions() {
    const nodeEnv = (process.env.NODE_ENV ?? 'development').toString();
    const raw = (process.env.CORS_ORIGINS ?? '').toString().trim();
    if (nodeEnv !== 'production' && raw.length === 0) {
        return { origin: true, credentials: true };
    }
    const allowed = raw
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
    if (allowed.length === 0)
        return { origin: false, credentials: true };
    return {
        origin: (origin, cb) => {
            if (!origin)
                return cb(null, true);
            cb(null, allowed.includes(origin));
        },
        credentials: true,
    };
}
function parseTrustProxy(raw) {
    if (raw === undefined || raw === null)
        return false;
    const v = typeof raw === 'string'
        ? raw.trim().toLowerCase()
        : typeof raw === 'number'
            ? raw.toString()
            : typeof raw === 'boolean'
                ? raw.toString()
                : '';
    if (v.length === 0)
        return false;
    if (v === 'true')
        return true;
    if (v === 'false')
        return false;
    const asNumber = Number(v);
    if (Number.isFinite(asNumber))
        return asNumber;
    return false;
}
//# sourceMappingURL=main.js.map
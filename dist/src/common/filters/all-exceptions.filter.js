"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var AllExceptionsFilter_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AllExceptionsFilter = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
let AllExceptionsFilter = AllExceptionsFilter_1 = class AllExceptionsFilter {
    logger = new common_1.Logger(AllExceptionsFilter_1.name);
    catch(exception, host) {
        const ctx = host.switchToHttp();
        const res = ctx.getResponse();
        const req = ctx.getRequest();
        const timestamp = new Date().toISOString();
        let status = common_1.HttpStatus.INTERNAL_SERVER_ERROR;
        let message = 'Internal server error';
        if (exception instanceof common_1.HttpException) {
            status = exception.getStatus();
            const payload = exception.getResponse();
            if (typeof payload === 'string') {
                message = payload;
            }
            else if (payload && typeof payload === 'object') {
                const anyPayload = payload;
                const m = anyPayload['message'];
                if (Array.isArray(m))
                    message = m.map(String).join(', ');
                else if (typeof m === 'string')
                    message = m;
                else
                    message = exception.message;
            }
            else {
                message = exception.message;
            }
        }
        else if (exception instanceof client_1.Prisma.PrismaClientKnownRequestError) {
            const mapped = this.mapPrismaKnownError(exception);
            status = mapped.status;
            message = mapped.message;
        }
        else if (exception instanceof client_1.Prisma.PrismaClientValidationError) {
            status = common_1.HttpStatus.BAD_REQUEST;
            message = 'Invalid request';
        }
        if (status >= 500) {
            this.logger.error(`${req.method} ${req.originalUrl} -> ${status}`, exception instanceof Error ? exception.stack : undefined);
        }
        res.status(status).json({
            statusCode: status,
            message,
            timestamp,
            path: req.originalUrl,
        });
    }
    mapPrismaKnownError(e) {
        if (e.code === 'P2002')
            return { status: 409, message: 'Already exists' };
        if (e.code === 'P2025')
            return { status: 404, message: 'Not found' };
        if (e.code === 'P2003')
            return { status: 400, message: 'Invalid reference' };
        return { status: 400, message: 'Invalid request' };
    }
};
exports.AllExceptionsFilter = AllExceptionsFilter;
exports.AllExceptionsFilter = AllExceptionsFilter = AllExceptionsFilter_1 = __decorate([
    (0, common_1.Catch)()
], AllExceptionsFilter);
//# sourceMappingURL=all-exceptions.filter.js.map
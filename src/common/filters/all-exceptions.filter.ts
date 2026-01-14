import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import type { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<Request>();

    const timestamp = new Date().toISOString();

    let status: number = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const payload = exception.getResponse();
      if (typeof payload === 'string') {
        message = payload;
      } else if (payload && typeof payload === 'object') {
        const anyPayload = payload as Record<string, unknown>;
        const m = anyPayload['message'];
        if (Array.isArray(m)) message = m.map(String).join(', ');
        else if (typeof m === 'string') message = m;
        else message = exception.message;
      } else {
        message = exception.message;
      }
    } else if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      const mapped = this.mapPrismaKnownError(exception);
      status = mapped.status;
      message = mapped.message;
    } else if (exception instanceof Prisma.PrismaClientValidationError) {
      status = HttpStatus.BAD_REQUEST;
      message = 'Invalid request';
    }

    if (status >= 500) {
      this.logger.error(
        `${req.method} ${req.originalUrl} -> ${status}`,
        exception instanceof Error ? exception.stack : undefined,
      );
    }

    res.status(status).json({
      statusCode: status,
      message,
      timestamp,
      path: req.originalUrl,
    });
  }

  private mapPrismaKnownError(e: Prisma.PrismaClientKnownRequestError): {
    status: number;
    message: string;
  } {
    if (e.code === 'P2002') return { status: 409, message: 'Already exists' };
    if (e.code === 'P2025') return { status: 404, message: 'Not found' };
    if (e.code === 'P2003')
      return { status: 400, message: 'Invalid reference' };
    return { status: 400, message: 'Invalid request' };
  }
}

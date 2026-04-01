import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { map } from 'rxjs/operators';
import type { Observable } from 'rxjs';

type Envelope = {
  data: unknown;
  meta?: Record<string, unknown>;
};

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(
    _context: ExecutionContext,
    next: CallHandler,
  ): Observable<Envelope> {
    return next.handle().pipe(
      map((value) => {
        if (value && typeof value === 'object' && 'data' in value) {
          return value as Envelope;
        }
        return { data: value };
      }),
    );
  }
}

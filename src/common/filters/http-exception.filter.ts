import { ArgumentsHost, Catch, ExceptionFilter, HttpException } from '@nestjs/common'

@Catch(HttpException)
export class HttpErrorFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse()
    const status = exception.getStatus()
    const res: any = exception.getResponse()
    const message = typeof res === 'object' ? res.message ?? res.error ?? 'Error' : res
    response.status(status).json({ statusCode: status, message })
  }
}

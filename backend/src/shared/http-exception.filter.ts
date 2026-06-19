import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from "@nestjs/common";

interface HttpResponse {
  status(code: number): HttpResponse;
  json(body: unknown): void;
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<HttpResponse>();
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : this.isMongoCastError(exception)
          ? HttpStatus.BAD_REQUEST
          : HttpStatus.INTERNAL_SERVER_ERROR;
    const payload = exception instanceof HttpException ? exception.getResponse() : null;
    const objectPayload = typeof payload === "object" && payload !== null ? payload : {};
    const rawMessage =
      typeof payload === "string"
        ? payload
        : "message" in objectPayload
          ? objectPayload.message
          : status === 500
            ? "Internal server error"
            : "Bad request";
    if (status === HttpStatus.INTERNAL_SERVER_ERROR) {
      console.error("Unhandled request error", exception);
    }
    response.status(status).json({
      statusCode: status,
      error:
        "error" in objectPayload
          ? objectPayload.error
          : status === 500
            ? "internal_server_error"
            : "request_error",
      message: rawMessage,
      timestamp: new Date().toISOString(),
    });
  }

  private isMongoCastError(exception: unknown) {
    return (
      typeof exception === "object" &&
      exception !== null &&
      "name" in exception &&
      exception.name === "CastError"
    );
  }
}

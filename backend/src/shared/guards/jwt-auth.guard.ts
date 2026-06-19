import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";

const jwt = require("jsonwebtoken") as {
  verify: (token: string, secret: string) => unknown;
};

@Injectable()
export class JwtAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<{
      headers: { authorization?: string };
      user?: unknown;
    }>();
    const header = request.headers.authorization;
    const [type, token] = header?.split(" ") ?? [];
    if (type !== "Bearer" || !token) {
      throw new UnauthorizedException("Missing bearer token");
    }
    try {
      const secret = process.env.JWT_SECRET;
      if (!secret) throw new Error("JWT secret unavailable");
      request.user = jwt.verify(token, secret);
      return true;
    } catch {
      throw new UnauthorizedException("Invalid bearer token");
    }
  }
}

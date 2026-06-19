import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { UserRole } from "../users/user.schema";
import { UsersService } from "../users/users.service";

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UsersService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService
  ) {}

  async login(email: string, password: string) {
    const user = await this.users.findByEmail(email);
    if (!user || !user.isActive) {
      throw new UnauthorizedException("Invalid credentials");
    }
    const ok = await bcrypt.compare(password ?? "", user.passwordHash);
    if (!ok) {
      throw new UnauthorizedException("Invalid credentials");
    }
    const safeUser = this.users.toPublicUser(user);
    const accessToken = await this.jwt.signAsync({
      sub: safeUser.id,
      email: safeUser.email,
      role: safeUser.role,
      name: safeUser.name,
    });
    return { accessToken, user: safeUser };
  }

  async currentUser(id: string) {
    const user = await this.users.findById(id);
    if (!user || !user.isActive) {
      throw new UnauthorizedException("User is inactive");
    }
    return this.users.toPublicUser(user);
  }

  async ensureDefaultAdmin() {
    const email = this.config.get<string>("ADMIN_EMAIL");
    const password = this.config.get<string>("ADMIN_PASSWORD");
    const name = this.config.get<string>("ADMIN_NAME") ?? "Admin";

    if (!email || !password) {
      return;
    }

    const existingUser = await this.users.findByEmail(email);
    if (existingUser) return;

    await this.users.create({
      name,
      email,
      password,
      role: "admin",
      isActive: true,
    });
  }
}

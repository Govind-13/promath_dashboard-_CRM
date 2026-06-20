import {
  BadRequestException,
  Injectable,
  ServiceUnavailableException,
  UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { createHash, randomBytes } from "node:crypto";
import * as nodemailer from "nodemailer";
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

  async forgotPassword(email: string) {
    const normalizedEmail = email.trim().toLowerCase();
    const user = await this.users.findByEmail(normalizedEmail);
    const genericResponse = {
      message: "If an active account exists for this email, a password reset link has been sent.",
    };
    if (!user || !user.isActive) return genericResponse;

    const token = randomBytes(32).toString("hex");
    const tokenHash = createHash("sha256").update(token).digest("hex");
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000);
    await this.users.setPasswordResetToken(normalizedEmail, tokenHash, expiresAt);

    try {
      await this.sendPasswordResetEmail(user.email, user.name, token);
    } catch (error) {
      console.error("Password reset email failed", error);
      throw new ServiceUnavailableException(
        "Password reset email could not be sent. Please contact your administrator.",
      );
    }
    return genericResponse;
  }

  async resetPassword(token: string, password: string) {
    const tokenHash = createHash("sha256").update(token).digest("hex");
    const user = await this.users.resetPasswordWithToken(tokenHash, password);
    if (!user) {
      throw new BadRequestException("This password reset link is invalid or has expired.");
    }
    return { message: "Password updated successfully. You can now sign in." };
  }

  async ensureDefaultAdmin() {
    const email = this.config.get<string>("ADMIN_EMAIL");
    const password = this.config.get<string>("ADMIN_PASSWORD");
    const name = this.config.get<string>("ADMIN_NAME") ?? "Admin";

    if (!email || !password) {
      return;
    }

    const existingUser = await this.users.findByEmail(email);
    if (existingUser) {
      await this.users.update(existingUser.id, {
        name,
        email,
        password,
        role: "admin",
        isActive: true,
      });
      return;
    }

    await this.users.create({
      name,
      email,
      password,
      role: "admin",
      isActive: true,
    });
  }

  private async sendPasswordResetEmail(email: string, name: string, token: string) {
    const host = this.config.get<string>("SMTP_HOST");
    const port = Number(this.config.get<string>("SMTP_PORT") ?? "587");
    const user = this.config.get<string>("SMTP_USER");
    const pass = this.config.get<string>("SMTP_PASS");
    const from = this.config.get<string>("SMTP_FROM") ?? user;
    const appUrl = (this.config.get<string>("APP_URL") ?? "").replace(/\/$/, "");

    if (!host || !user || !pass || !from || !appUrl) {
      throw new Error("SMTP_HOST, SMTP_USER, SMTP_PASS, SMTP_FROM, and APP_URL are required");
    }

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });
    const resetUrl = `${appUrl}/?resetToken=${encodeURIComponent(token)}`;
    await transporter.sendMail({
      from,
      to: email,
      subject: "Reset your Promath CRM password",
      text: `Hello ${name}, reset your Promath CRM password using this link: ${resetUrl}. This link expires in 30 minutes.`,
      html: `
        <div style="font-family:Arial,sans-serif;line-height:1.6;color:#101828">
          <h2>Reset your Promath CRM password</h2>
          <p>Hello ${this.escapeHtml(name)},</p>
          <p>Use the button below to choose a new password. This link expires in 30 minutes and can be used once.</p>
          <p><a href="${resetUrl}" style="display:inline-block;padding:11px 18px;border-radius:8px;background:#175CD3;color:#fff;text-decoration:none">Reset password</a></p>
          <p>If you did not request this, you can ignore this email.</p>
        </div>
      `,
    });
  }

  private escapeHtml(value: string) {
    return value.replace(/[&<>"']/g, (character) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;",
    })[character] ?? character);
  }
}

import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import * as bcrypt from "bcrypt";
import { Model } from "mongoose";
import { CreateUserDto, UpdateUserDto } from "./dto";
import { USER_ROLES, User, UserDocument, UserRole } from "./user.schema";

export interface PublicUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private readonly users: Model<UserDocument>) {}

  async create(dto: CreateUserDto) {
    this.assertRole(dto.role);
    const passwordHash = await bcrypt.hash(dto.password, 12);
    try {
      const created = await this.users.create({
        name: dto.name,
        email: dto.email.toLowerCase(),
        passwordHash,
        role: dto.role,
        isActive: dto.isActive ?? true,
      });
      return this.toPublicUser(created);
    } catch (error) {
      if (this.isDuplicateKey(error)) {
        throw new BadRequestException("Email already exists");
      }
      throw error;
    }
  }

  async list() {
    const rows = await this.users.find().sort({ createdAt: -1 }).exec();
    return rows.map((user) => this.toPublicUser(user));
  }

  async findByEmail(email: string) {
    return this.users.findOne({ email: (email ?? "").toLowerCase() }).exec();
  }

  async findById(id: string) {
    return this.users.findById(id).exec();
  }

  async existsByRole(role: UserRole) {
    return (await this.users.exists({ role })) !== null;
  }

  async update(id: string, dto: UpdateUserDto) {
    if (dto.role) this.assertRole(dto.role);
    const update: Partial<User> = {};
    if (dto.name !== undefined) update.name = dto.name;
    if (dto.email !== undefined) update.email = dto.email.toLowerCase();
    if (dto.role !== undefined) update.role = dto.role;
    if (dto.isActive !== undefined) update.isActive = dto.isActive;
    if (dto.password) update.passwordHash = await bcrypt.hash(dto.password, 12);

    try {
      const user = await this.users.findByIdAndUpdate(id, update, { new: true }).exec();
      if (!user) throw new NotFoundException("User not found");
      return this.toPublicUser(user);
    } catch (error) {
      if (this.isDuplicateKey(error)) {
        throw new BadRequestException("Email already exists");
      }
      throw error;
    }
  }

  async deactivate(id: string) {
    const user = await this.users
      .findByIdAndUpdate(id, { isActive: false }, { new: true })
      .exec();
    if (!user) throw new NotFoundException("User not found");
    return this.toPublicUser(user);
  }

  toPublicUser(user: UserDocument): PublicUser {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  private assertRole(role: string): asserts role is UserRole {
    if (!USER_ROLES.includes(role as UserRole)) {
      throw new BadRequestException("Invalid role");
    }
  }

  private isDuplicateKey(error: unknown) {
    return typeof error === "object" && error !== null && "code" in error && error.code === 11000;
  }
}

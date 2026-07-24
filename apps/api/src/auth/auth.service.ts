import {
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { compare } from "bcrypt";

import { PrismaService } from "../prisma/prisma.service";

import type { JwtPayload } from "./auth.types";
import { LoginDto } from "./dto/login.dto";

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async login(dto: LoginDto) {
    const username = dto.username
      .trim()
      .toLowerCase();

    const admin =
      await this.prisma.adminUser.findUnique({
        where: {
          username,
        },
      });

    if (!admin || !admin.isActive) {
      throw new UnauthorizedException(
        "Identifiant ou mot de passe incorrect.",
      );
    }

    const passwordIsValid = await compare(
      dto.password,
      admin.passwordHash,
    );

    if (!passwordIsValid) {
      throw new UnauthorizedException(
        "Identifiant ou mot de passe incorrect.",
      );
    }

    const payload: JwtPayload = {
      sub: admin.id,
      username: admin.username,
      displayName: admin.displayName,
      role: admin.role,
    };

    const accessToken =
      await this.jwtService.signAsync(payload);

    return {
      accessToken,

      user: {
        id: admin.id,
        username: admin.username,
        displayName: admin.displayName,
        role: admin.role,
      },
    };
  }
}
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";

import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";

import type { Request } from "express";

import type {
  JwtPayload,
} from "./auth.types";

type AuthenticatedRequest = Request & {
  user?: JwtPayload;
};

@Injectable()
export class AuthGuard
  implements CanActivate
{
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {
    const request =
      context
        .switchToHttp()
        .getRequest<AuthenticatedRequest>();

    const token =
      request.cookies?.[
        "support_chat_access_token"
      ];

    if (!token) {
      throw new UnauthorizedException(
        "Authentification requise.",
      );
    }

    const secret =
      this.configService.get<string>(
        "JWT_SECRET",
      );

    if (!secret) {
      throw new Error(
        "JWT_SECRET n’est pas configuré.",
      );
    }

    try {
      const payload =
        await this.jwtService.verifyAsync<JwtPayload>(
          token,
          {
            secret,
          },
        );

      request.user = payload;

      return true;
    } catch {
      throw new UnauthorizedException(
        "Session expirée ou invalide.",
      );
    }
  }
}
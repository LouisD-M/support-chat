import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from "@nestjs/common";

import {
  Reflector,
} from "@nestjs/core";

import type {
  Request,
} from "express";

import {
  ROLES_KEY,
} from "../decorators/roles.decorator";

import type {
  AdminRole,
  JwtPayload,
} from "../auth.types";

type AuthenticatedRequest = Request & {
  user?: JwtPayload;
};

@Injectable()
export class RolesGuard
  implements CanActivate
{
  constructor(
    private readonly reflector: Reflector,
  ) {}

  canActivate(
    context: ExecutionContext,
  ): boolean {
    const requiredRoles =
      this.reflector.getAllAndOverride<
        AdminRole[]
      >(
        ROLES_KEY,
        [
          context.getHandler(),
          context.getClass(),
        ],
      );

    if (
      !requiredRoles ||
      requiredRoles.length === 0
    ) {
      return true;
    }

    const request =
      context
        .switchToHttp()
        .getRequest<AuthenticatedRequest>();

    const user = request.user;

    if (!user) {
      throw new ForbiddenException(
        "Utilisateur non authentifié.",
      );
    }

    const isAllowed =
      requiredRoles.includes(user.role);

    if (!isAllowed) {
      throw new ForbiddenException(
        "Vous n’avez pas les droits nécessaires.",
      );
    }

    return true;
  }
}
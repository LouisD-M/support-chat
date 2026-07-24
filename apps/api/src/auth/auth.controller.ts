import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from "@nestjs/common";

import type {
  Request,
  Response,
} from "express";

import { AuthGuard } from "./auth.guard";
import { AuthService } from "./auth.service";
import type { JwtPayload } from "./auth.types";
import { LoginDto } from "./dto/login.dto";

const AUTH_COOKIE =
  "support_chat_access_token";

const COOKIE_MAX_AGE =
  8 * 60 * 60 * 1000;

type AuthenticatedRequest = Request & {
  user: JwtPayload;
};

function getCookieOptions() {
  const isProduction =
    process.env.NODE_ENV === "production";

  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: "strict" as const,
    path: "/",
    maxAge: COOKIE_MAX_AGE,
  };
}

@Controller("auth")
export class AuthController {
  constructor(
    private readonly authService: AuthService,
  ) {}

  @Post("login")
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true })
    response: Response,
  ) {
    const result =
      await this.authService.login(dto);

    response.cookie(
      AUTH_COOKIE,
      result.accessToken,
      getCookieOptions(),
    );

    // Le JWT n’est volontairement
    // jamais renvoyé au frontend.
    return {
      user: result.user,
    };
  }

  @UseGuards(AuthGuard)
  @Get("me")
  getCurrentUser(
    @Req() request: AuthenticatedRequest,
  ) {
    return {
      user: {
        id: request.user.sub,
        username: request.user.username,
        displayName:
          request.user.displayName,
        role: request.user.role,
      },
    };
  }

  @Post("logout")
  logout(
    @Res({ passthrough: true })
    response: Response,
  ) {
    const isProduction =
      process.env.NODE_ENV === "production";

    response.clearCookie(
      AUTH_COOKIE,
      {
        httpOnly: true,
        secure: isProduction,
        sameSite: "strict",
        path: "/",
      },
    );

    return {
      success: true,
    };
  }
}
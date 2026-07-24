import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";

import { PrismaModule } from "../prisma/prisma.module";

import { AuthController } from "./auth.controller";
import { AuthGuard } from "./auth.guard";
import { AuthService } from "./auth.service";

@Module({
  imports: [
    PrismaModule,

    JwtModule.registerAsync({
      inject: [
        ConfigService,
      ],

      useFactory: (
        configService: ConfigService,
      ) => {
        const secret =
          configService.get<string>(
            "JWT_SECRET",
          );

        if (!secret) {
          throw new Error(
            "JWT_SECRET n’est pas configuré.",
          );
        }

        return {
          secret,
          signOptions: {
            expiresIn: "8h",
          },
        };
      },
    }),
  ],

  controllers: [
    AuthController,
  ],

  providers: [
    AuthService,
    AuthGuard,
  ],

  exports: [
    AuthGuard,
    JwtModule,
  ],
})
export class AuthModule {}
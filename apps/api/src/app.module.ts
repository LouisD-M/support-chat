import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";

import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { ConversationsModule } from "./conversations/conversations.module";
import { DevicesModule } from "./devices/devices.module";
import { GlpiModule } from "./glpi/glpi.module";
import { MessagesModule } from "./messages/messages.module";
import { PrismaModule } from "./prisma/prisma.module";
import { RealtimeModule } from "./realtime/realtime.module";
import { AuthModule } from "./auth/auth.module";


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [
        "apps/api/.env.local",
        ".env.local",
        ".env",
      ],
    }),

    PrismaModule,
    AuthModule,
    GlpiModule,
    ConversationsModule,
    DevicesModule,
    MessagesModule,
    RealtimeModule,
  ],

  controllers: [AppController],

  providers: [AppService],
})
export class AppModule {}
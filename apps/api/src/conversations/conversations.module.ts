import { Module } from "@nestjs/common";

import { GlpiModule } from "../glpi/glpi.module";
import { MessagesModule } from "../messages/messages.module";
import { PrismaModule } from "../prisma/prisma.module";

import { ConversationsController } from "./conversations.controller";
import { ConversationsService } from "./conversations.service";

@Module({
  imports: [
    PrismaModule,
    MessagesModule,
    GlpiModule,
  ],
  controllers: [
    ConversationsController,
  ],
  providers: [
    ConversationsService,
  ],
  exports: [
    ConversationsService,
  ],
})
export class ConversationsModule {}
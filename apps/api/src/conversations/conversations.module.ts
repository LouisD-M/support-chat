import { Module } from "@nestjs/common";

import { MessagesModule } from "../messages/messages.module";
import { PrismaModule } from "../prisma/prisma.module";
import { ConversationsController } from "./conversations.controller";
import { ConversationsService } from "./conversations.service";

@Module({
  imports: [
    PrismaModule,
    MessagesModule,
  ],
  controllers: [ConversationsController],
  providers: [ConversationsService],
})
export class ConversationsModule {}
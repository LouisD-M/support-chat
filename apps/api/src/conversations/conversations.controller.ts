import {
  Body,
  Controller,
  Get,
  Param,
  Post,
} from "@nestjs/common";

import { MessagesService } from "../messages/messages.service";
import { CreateMessageDto } from "../messages/dto/create-message.dto";
import { ConversationsService } from "./conversations.service";
import { CreateConversationDto } from "./dto/create-conversation.dto";

@Controller("conversations")
export class ConversationsController {
  constructor(
    private readonly conversationsService: ConversationsService,
    private readonly messagesService: MessagesService,
  ) {}

  @Get()
  findAll() {
    return this.conversationsService.findAll();
  }

  @Post()
  create(@Body() dto: CreateConversationDto) {
    return this.conversationsService.create(dto);
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.conversationsService.findOne(id);
  }

  @Post(":id/messages")
  createMessage(
    @Param("id") conversationId: string,
    @Body() dto: CreateMessageDto,
  ) {
    return this.messagesService.create(
      conversationId,
      dto,
    );
  }
}
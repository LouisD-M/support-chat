import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from "@nestjs/common";

import { AuthGuard } from "../auth/auth.guard";

import {
  CurrentUser,
} from "../auth/decorators/current-user.decorator";

import {
  Roles,
} from "../auth/decorators/roles.decorator";

import {
  RolesGuard,
} from "../auth/guards/roles.guard";

import type {
  JwtPayload,
} from "../auth/auth.types";

import {
  ConversationsService,
} from "./conversations.service";

import {
  CreateConversationDto,
} from "./dto/create-conversation.dto";

import {
  UpdateConversationStatusDto,
} from "./dto/update-conversation-status.dto";

import {
  CreateClientMessageDto,
} from "./dto/create-client-message.dto";

import {
  CreateTechnicianMessageDto,
} from "./dto/create-technician-message.dto";

@Controller("conversations")
export class ConversationsController {
  constructor(
    private readonly conversationsService:
      ConversationsService,
  ) {}

  /*
   * CLIENT TAURI
   * Route publique
   */
  @Post()
  createConversation(
    @Body() dto: CreateConversationDto,
  ) {
    return this.conversationsService.create(
      dto,
    );
  }

  /*
   * ADMIN / TECHNICIEN
   */
  @UseGuards(
    AuthGuard,
    RolesGuard,
  )
  @Roles(
    "ADMIN",
    "TECHNICIAN",
  )
  @Get()
  findAll() {
    return this.conversationsService.findAll();
  }

  /*
   * CLIENT
   * Temporairement publique
   */
  @Get(":id")
  findOne(
    @Param("id") id: string,
  ) {
    return this.conversationsService.findOne(
      id,
    );
  }

  /*
   * CLIENT TAURI
   */
  @Post(":id/messages/client")
  createClientMessage(
    @Param("id") id: string,
    @Body() dto: CreateClientMessageDto,
  ) {
    return this.conversationsService
      .createClientMessage(
        id,
        dto,
      );
  }

  /*
   * ADMIN / TECHNICIEN
   */
  @UseGuards(
    AuthGuard,
    RolesGuard,
  )
  @Roles(
    "ADMIN",
    "TECHNICIAN",
  )
  @Post(":id/messages/technician")
  createTechnicianMessage(
    @Param("id") id: string,

    @Body()
    dto: CreateTechnicianMessageDto,

    @CurrentUser()
    user: JwtPayload,
  ) {
    return this.conversationsService
      .createTechnicianMessage(
        id,
        dto,
        user,
      );
  }

  /*
   * ADMIN / TECHNICIEN
   */
  @UseGuards(
    AuthGuard,
    RolesGuard,
  )
  @Roles(
    "ADMIN",
    "TECHNICIAN",
  )
  @Patch(":id/status")
  updateStatus(
    @Param("id") id: string,

    @Body()
    dto: UpdateConversationStatusDto,
  ) {
    return this.conversationsService
      .updateStatus(
        id,
        dto.status,
      );
  }

  /*
   * ADMIN / TECHNICIEN
   */
  @UseGuards(
    AuthGuard,
    RolesGuard,
  )
  @Roles(
    "ADMIN",
    "TECHNICIAN",
  )
  @Post(":id/glpi-ticket")
  createGlpiTicket(
    @Param("id") id: string,
  ) {
    return this.conversationsService
      .createGlpiTicket(id);
  }

  /*
   * ADMIN uniquement
   */
  @UseGuards(
    AuthGuard,
    RolesGuard,
  )
  @Roles("ADMIN")
  @Delete(":id")
  deleteConversation(
    @Param("id") id: string,
  ) {
    return this.conversationsService.remove(
      id,
    );
  }
}
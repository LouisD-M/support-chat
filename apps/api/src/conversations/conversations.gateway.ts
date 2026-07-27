import {
  WebSocketGateway,
  WebSocketServer,
} from "@nestjs/websockets";

import type {
  Server,
} from "socket.io";

@WebSocketGateway({
  namespace: "/support",
  cors: {
    origin: [
      "http://localhost:7001",
      "http://localhost:7002",
    ],
    credentials: true,
  },
})
export class ConversationsGateway {
  @WebSocketServer()
  private readonly server!: Server;

  emitConversationCreated(
    conversation: unknown,
  ): void {
    this.server.emit(
      "conversation:created",
      conversation,
    );
  }

  emitMessageCreated(
    message: unknown,
  ): void {
    this.server.emit(
      "message:created",
      message,
    );
  }

  emitConversationUpdated(
    conversation: unknown,
  ): void {
    this.server.emit(
      "conversation:updated",
      conversation,
    );
  }

  emitConversationDeleted(
    conversationId: string,
  ): void {
    this.server.emit(
      "conversation:deleted",
      {
        conversationId,
      },
    );
  }
}
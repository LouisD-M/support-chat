import {
  Injectable,
  Logger,
  ServiceUnavailableException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

import type {
  CreateGlpiTicketInput,
  GlpiCreateTicketResponse,
  GlpiSessionResponse,
} from "./glpi.types";

@Injectable()
export class GlpiService {
  private readonly logger = new Logger(
    GlpiService.name,
  );

  constructor(
    private readonly configService: ConfigService,
  ) {}

  private getConfiguration() {
    const apiUrl = this.configService
      .get<string>("GLPI_API_URL")
      ?.replace(/\/+$/, "");

    const appToken =
      this.configService.get<string>(
        "GLPI_APP_TOKEN",
      );

    const userToken =
      this.configService.get<string>(
        "GLPI_USER_TOKEN",
      );

    if (!apiUrl) {
      throw new ServiceUnavailableException(
        "GLPI_API_URL est absente de la configuration de l’API.",
      );
    }

    if (!appToken) {
      throw new ServiceUnavailableException(
        "GLPI_APP_TOKEN n’est pas encore configuré.",
      );
    }

    if (!userToken) {
      throw new ServiceUnavailableException(
        "GLPI_USER_TOKEN n’est pas encore configuré.",
      );
    }

    return {
      apiUrl,
      appToken,
      userToken,
    };
  }

  private async readErrorResponse(
    response: Response,
  ): Promise<string> {
    try {
      return await response.text();
    } catch {
      return "Réponse GLPI illisible";
    }
  }

  private async initSession(): Promise<string> {
    const {
      apiUrl,
      appToken,
      userToken,
    } = this.getConfiguration();

    let response: Response;

    try {
      response = await fetch(
        `${apiUrl}/initSession`,
        {
          method: "GET",
          headers: {
            "Content-Type":
              "application/json",
            "App-Token": appToken,
            Authorization:
              `user_token ${userToken}`,
          },
        },
      );
    } catch (error) {
      this.logger.error(
        "Impossible de joindre GLPI.",
        error instanceof Error
          ? error.stack
          : undefined,
      );

      throw new ServiceUnavailableException(
        "Le serveur GLPI est injoignable.",
      );
    }

    if (!response.ok) {
      const details =
        await this.readErrorResponse(response);

      throw new ServiceUnavailableException(
        `Connexion GLPI refusée (${response.status}) : ${details}`,
      );
    }

    const data =
      (await response.json()) as GlpiSessionResponse;

    if (!data.session_token) {
      throw new ServiceUnavailableException(
        "GLPI n’a pas retourné de Session-Token.",
      );
    }

    return data.session_token;
  }

  private async killSession(
    sessionToken: string,
  ): Promise<void> {
    const {
      apiUrl,
      appToken,
    } = this.getConfiguration();

    try {
      const response = await fetch(
        `${apiUrl}/killSession`,
        {
          method: "GET",
          headers: {
            "Content-Type":
              "application/json",
            "App-Token": appToken,
            "Session-Token":
              sessionToken,
          },
        },
      );

      if (!response.ok) {
        const details =
          await this.readErrorResponse(response);

        this.logger.warn(
          `Fermeture de la session GLPI refusée : ${details}`,
        );
      }
    } catch (error) {
      this.logger.warn(
        "Impossible de fermer proprement la session GLPI.",
        error instanceof Error
          ? error.message
          : undefined,
      );
    }
  }

  async createTicket(
    input: CreateGlpiTicketInput,
  ): Promise<GlpiCreateTicketResponse> {
    const {
      apiUrl,
      appToken,
    } = this.getConfiguration();

    const sessionToken =
      await this.initSession();

    try {
      const response = await fetch(
        `${apiUrl}/Ticket`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
            "App-Token": appToken,
            "Session-Token":
              sessionToken,
          },
          body: JSON.stringify({
            input: {
              name: input.name,
              content: input.content,

              ...(input.urgency !== undefined
                ? {
                    urgency: input.urgency,
                  }
                : {}),

              ...(input.priority !== undefined
                ? {
                    priority: input.priority,
                  }
                : {}),
            },
          }),
        },
      );

      if (!response.ok) {
        const details =
          await this.readErrorResponse(response);

        throw new ServiceUnavailableException(
          `Création du ticket GLPI refusée (${response.status}) : ${details}`,
        );
      }

      const ticket =
        (await response.json()) as GlpiCreateTicketResponse;

      if (!ticket.id) {
        throw new ServiceUnavailableException(
          "GLPI n’a pas retourné l’identifiant du ticket.",
        );
      }

      return ticket;
    } finally {
      await this.killSession(
        sessionToken,
      );
    }
  }
}
export type GlpiSessionResponse = {
  session_token: string;
};

export type GlpiCreateTicketResponse = {
  id: number;
  message?: string;
};

export type CreateGlpiTicketInput = {
  name: string;
  content: string;
  urgency?: number;
  priority?: number;
};
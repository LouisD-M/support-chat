export type JwtPayload = {
  sub: string;
  username: string;
  displayName: string;
  role: "ADMIN" | "TECHNICIAN";
};

export type AuthenticatedUser = JwtPayload;
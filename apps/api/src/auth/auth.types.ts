export type AdminRole =
  | "ADMIN"
  | "TECHNICIAN";

export type JwtPayload = {
  sub: string;
  username: string;
  displayName: string;
  role: AdminRole;
};
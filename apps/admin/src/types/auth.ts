export type AdminRole =
  | "ADMIN"
  | "TECHNICIAN";

export type AdminUser = {
  id: string;
  username: string;
  displayName: string;
  role: AdminRole;
};
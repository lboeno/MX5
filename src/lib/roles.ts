export const ADMIN_ROLES = ["admin", "superadmin"] as const;

export type AppRole = "admin" | "superadmin" | "organizer" | "pilot" | "team";

export function isAdminRole(role?: string | null): boolean {
  return role === "admin" || role === "superadmin";
}

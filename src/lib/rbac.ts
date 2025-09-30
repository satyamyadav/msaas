export type Role = "owner" | "admin" | "member" | "viewer";

export type Permission =
  | "billing.manage"
  | "users.invite"
  | "modules.configure"
  | "settings.view";

const ROLE_MATRIX: Record<Role, Permission[]> = {
  owner: ["billing.manage", "users.invite", "modules.configure", "settings.view"],
  admin: ["billing.manage", "users.invite", "settings.view"],
  member: ["users.invite", "settings.view"],
  viewer: ["settings.view"],
};

export function hasPermission(role: Role, permission: Permission) {
  return ROLE_MATRIX[role].includes(permission);
}

export function listPermissions(role: Role) {
  return ROLE_MATRIX[role];
}

export function getAvailableRoles(): Role[] {
  return Object.keys(ROLE_MATRIX) as Role[];
}

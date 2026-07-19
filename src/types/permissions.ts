export type PermissionScreen = keyof typeof SCREEN_LABELS;

export const SCREEN_GROUPS = [
  {
    label: "Administrativo",
    screens: ["admin.dashboard", "admin.analytics", "admin.configuracoes"] as PermissionScreen[],
  },
  {
    label: "Gestão",
    screens: ["admin.eventos", "admin.pilotos", "admin.rankings", "admin.calendario"] as PermissionScreen[],
  },
  {
    label: "Financeiro",
    screens: ["admin.inscricoes", "admin.pagamentos"] as PermissionScreen[],
  },
  {
    label: "Conteúdo",
    screens: ["admin.noticias", "admin.galeria"] as PermissionScreen[],
  },
  {
    label: "Sistema",
    screens: ["admin.usuarios", "admin.logs"] as PermissionScreen[],
  },
] as const;

export const SCREEN_LABELS = {
  "admin.dashboard": "Dashboard",
  "admin.analytics": "Analytics",
  "admin.configuracoes": "Configurações",
  "admin.eventos": "Eventos",
  "admin.pilotos": "Pilotos",
  "admin.rankings": "Rankings",
  "admin.calendario": "Calendário",
  "admin.noticias": "Notícias",
  "admin.galeria": "Galeria",
  "admin.inscricoes": "Inscrições",
  "admin.pagamentos": "Pagamentos",
  "admin.usuarios": "Usuários",
  "admin.logs": "Logs",
} as const;

export const ALL_SCREENS = Object.keys(SCREEN_LABELS) as PermissionScreen[];

export interface RolePermission {
  role: string;
  screens: Record<string, boolean>;
}

export interface UserPermission {
  userId: string;
  screens: Record<string, boolean>;
}

export interface ProfileWithPermissions {
  id: string;
  name: string;
  email: string;
  role: string;
  phone?: string;
  photo_url?: string;
  created_at: string;
  permissions: Record<string, boolean>;
  overrideCount: number;
}

export function getDefaultScreens(role: string): Record<string, boolean> {
  switch (role) {
    case "admin":
      return Object.fromEntries(ALL_SCREENS.map((s) => [s, true]));
    case "organizer":
      return {
        "admin.dashboard": true,
        "admin.eventos": true,
        "admin.pilotos": true,
        "admin.rankings": true,
        "admin.calendario": true,
        "admin.noticias": true,
        "admin.galeria": true,
        "admin.inscricoes": true,
        "admin.pagamentos": true,
        "admin.analytics": false,
        "admin.configuracoes": false,
        "admin.usuarios": false,
        "admin.logs": false,
      };
    default:
      return Object.fromEntries(ALL_SCREENS.map((s) => [s, false]));
  }
}

export function getScreenGroup(screen: string): string {
  for (const group of SCREEN_GROUPS) {
    if ((group.screens as readonly string[]).includes(screen)) {
      return group.label;
    }
  }
  return "Outros";
}

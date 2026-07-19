export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  body?: string | null;
  link?: string | null;
  read: boolean;
  level: "info" | "success" | "warning" | "error";
  createdAt: string;
}

export interface CreateNotificationInput {
  userId: string;
  title: string;
  body?: string | null;
  link?: string | null;
  level?: "info" | "success" | "warning" | "error";
}

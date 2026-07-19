export interface DashboardStats {
  totalRevenue: number;
  activePilots: number;
  activeEvents: number;
  totalRegistrations: number;
  pendingPayments: number;
  pendingAmount: number;
  revenueChange: number;
  pilotsChange: number;
  registrationsChange: number;
  conversionRate: number;
  avgRegistrationDays: number;
}

export interface MonthlyChartData {
  month: string;
  revenue: number;
  registrations: number;
}

export interface DashboardPayment {
  id: string;
  pilotId: string;
  pilotName: string;
  eventId?: string;
  eventName: string;
  amount: number;
  status: string;
  method: string;
  category?: string;
  transactionId?: string;
  createdAt: string;
  paidAt?: string;
}

export interface DashboardLog {
  id: string;
  userName: string;
  action: string;
  entity: string;
  entityId?: string;
  details: string;
  level: string;
  createdAt: string;
}

export interface DashboardData {
  stats: DashboardStats;
  charts: MonthlyChartData[];
  recentPayments: DashboardPayment[];
  recentLogs: DashboardLog[];
}

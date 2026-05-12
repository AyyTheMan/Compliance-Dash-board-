
export enum RiskLevel {
  Red = 'RED',
  Yellow = 'YELLOW',
  Green = 'GREEN',
}

export enum TaskStatus {
  Drafting = 'Drafting',
  PendingLegal = 'Pending Legal Review',
  PendingCompliance = 'Pending Compliance Sign-off',
  Completed = 'Completed',
  Overdue = 'Overdue',
}

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface AuditLogEntry {
  id: string;
  timestamp: Date;
  user: string;
  action: string;
}

export interface Task {
  id: string;
  name: string;
  deadline: Date;
  riskLevel: RiskLevel;
  status: TaskStatus;
  checklist: ChecklistItem[];
  signatures: {
    complianceManager: boolean;
    headOfLegal: boolean;
  };
  auditLog: AuditLogEntry[];
  source?: File | string;
  coverImage?: string;
}

export interface EarlyWarning {
    id: string;
    title: string;
    source: string;
    date: Date;
    summary: string;
    fullText: string;
}

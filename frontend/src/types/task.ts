export type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE";

export interface Task {
  id: string;
  title: string;
  status: TaskStatus;
  deadline?: string | null;
  companyId: string;
  leadId?: string | null;
  assignedToId?: string | null;
  createdById: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskDto {
  title: string;
  leadId?: string;
  assignedToId?: string;
  deadline?: string;
}

export interface UpdateTaskDto {
  title?: string;
  assignedToId?: string;
  status?: TaskStatus;
  deadline?: string;
}

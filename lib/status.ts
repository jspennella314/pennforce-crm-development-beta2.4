import { TaskStatus } from "@prisma/client";

// Display labels for UI
export const TaskStatusLabel: Record<TaskStatus, string> = {
  OPEN: "Not Started",
  IN_PROGRESS: "In Progress",
  BLOCKED: "Blocked",
  DONE: "Completed",
  CANCELED: "Canceled",
};

// Accept common legacy/user inputs and normalize to enum
export function toTaskStatus(input: string): TaskStatus {
  const s = input.trim().toLowerCase();
  switch (s) {
    case "not started":
    case "open":
      return TaskStatus.OPEN;
    case "in progress":
      return TaskStatus.IN_PROGRESS;
    case "completed":
    case "done":
      return TaskStatus.DONE;
    case "blocked":
      return TaskStatus.BLOCKED;
    case "canceled":
    case "cancelled":
      return TaskStatus.CANCELED;
  }
  // Also allow direct enum strings
  switch (input) {
    case "OPEN":
    case "IN_PROGRESS":
    case "BLOCKED":
    case "DONE":
    case "CANCELED":
      return input as TaskStatus;
  }
  throw new Error(`Invalid TaskStatus: ${input}`);
}

export function fromTaskStatus(status: TaskStatus): string {
  return TaskStatusLabel[status];
}

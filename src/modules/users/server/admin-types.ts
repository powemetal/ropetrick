import type { MessageReportStatus } from "@prisma/client";

export type ReportStatus = MessageReportStatus;
export type ModerationAction = "DISMISS" | "DELETE_CONTENT" | "SUSPEND_USER";

export class AdminAuthorizationError extends Error {
  readonly statusCode = 403;

  constructor() {
    super("Administrator access required");
    this.name = "AdminAuthorizationError";
  }
}

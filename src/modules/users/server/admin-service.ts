"use server";

import { auth } from "@clerk/nextjs/server";
import { MessageReportStatus, Prisma, UserRole, UserStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { AdminAuthorizationError, type ModerationAction, type ReportStatus } from "@/modules/users/server/admin-types";

const ensureAdmin = async (adminId: string) => {
  const admin = await prisma.user.findUnique({ where: { id: adminId }, select: { id: true, role: true, status: true } });
  if (!admin || admin.role !== UserRole.ADMIN || admin.status !== UserStatus.ACTIVE) throw new AdminAuthorizationError();
  return admin;
};

const ensureCurrentAdmin = async () => {
  const { userId } = await auth();
  if (!userId) throw new AdminAuthorizationError();
  return ensureAdmin(userId);
};

export async function requireAdminAccess() {
  return ensureCurrentAdmin();
}

const requireReason = (reason?: string) => {
  const normalizedReason = reason?.trim();
  if (!normalizedReason) throw new Error("A moderation reason is required");
  return normalizedReason;
};

export async function getReports(status?: ReportStatus, cursor?: string, limit = 25) {
  await ensureCurrentAdmin();
  const safeLimit = Math.min(Math.max(Math.floor(limit), 1), 100);
  return prisma.messageReport.findMany({
    where: status ? { status } : undefined,
    include: {
      reporter: { select: { id: true, name: true, nickname: true, email: true } },
      message: {
        include: {
          sender: { select: { id: true, name: true, nickname: true, email: true, status: true } },
          conversation: { select: { id: true, title: true, isGroup: true } },
          attachments: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: safeLimit,
    ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
  });
}

export async function resolveReport(reportId: string, action: ModerationAction, adminId: string, reason?: string) {
  const admin = await ensureAdmin(adminId);
  const normalizedReason = requireReason(reason);
  const report = await prisma.messageReport.findUnique({
    where: { id: reportId },
    include: { message: { select: { id: true, senderId: true, isDeleted: true } } },
  });
  if (!report) throw new Error("Report not found");
  if (report.status !== MessageReportStatus.PENDING) throw new Error("Report has already been processed");

  return prisma.$transaction(async (transaction) => {
    if (action === "DISMISS") {
      await transaction.messageReport.update({ where: { id: reportId }, data: { status: MessageReportStatus.DISMISSED } });
      await transaction.adminAuditLog.create({ data: { adminId: admin.id, reportId, messageId: report.message.id, action, reason: normalizedReason } });
    } else if (action === "DELETE_CONTENT") {
      await transaction.chatMessage.update({ where: { id: report.message.id }, data: { isDeleted: true } });
      await transaction.messageReport.update({ where: { id: reportId }, data: { status: MessageReportStatus.RESOLVED } });
      await transaction.adminAuditLog.create({ data: { adminId: admin.id, reportId, messageId: report.message.id, action, reason: normalizedReason, metadata: { previousIsDeleted: report.message.isDeleted } } });
    } else {
      await transaction.user.update({ where: { id: report.message.senderId }, data: { status: UserStatus.SUSPENDED } });
      await transaction.messageReport.update({ where: { id: reportId }, data: { status: MessageReportStatus.RESOLVED } });
      await transaction.adminAuditLog.create({ data: { adminId: admin.id, reportId, messageId: report.message.id, targetUserId: report.message.senderId, action, reason: normalizedReason } });
    }

    return transaction.messageReport.findUnique({ where: { id: reportId } });
  });
}

export async function getUserManagementList(query?: string, page = 1) {
  await ensureCurrentAdmin();
  const safePage = Math.max(Math.floor(page), 1);
  const pageSize = 25;
  const normalizedQuery = query?.trim();
  const where: Prisma.UserWhereInput = normalizedQuery ? { OR: [{ id: { contains: normalizedQuery, mode: "insensitive" } }, { email: { contains: normalizedQuery, mode: "insensitive" } }, { name: { contains: normalizedQuery, mode: "insensitive" } }, { nickname: { contains: normalizedQuery, mode: "insensitive" } }] } : {};
  const [users, total] = await Promise.all([prisma.user.findMany({ where, select: { id: true, email: true, name: true, nickname: true, avatarUrl: true, role: true, status: true, createdAt: true, updatedAt: true }, orderBy: { createdAt: "desc" }, skip: (safePage - 1) * pageSize, take: pageSize }), prisma.user.count({ where })]);
  return { users, total, page: safePage, pageSize, pageCount: Math.ceil(total / pageSize) };
}

export async function updateUserStatus(userId: string, status: UserStatus, reason: string) {
  const admin = await ensureCurrentAdmin();
  const normalizedReason = requireReason(reason);
  if (admin.id === userId && status !== UserStatus.ACTIVE) throw new AdminAuthorizationError();
  const target = await prisma.user.findUnique({ where: { id: userId }, select: { id: true, status: true } });
  if (!target) throw new Error("User not found");

  return prisma.$transaction(async (transaction) => {
    const updatedUser = await transaction.user.update({ where: { id: userId }, data: { status } });
    await transaction.adminAuditLog.create({ data: { adminId: admin.id, targetUserId: userId, action: "UPDATE_USER_STATUS", reason: normalizedReason, metadata: { previousStatus: target.status, nextStatus: status } } });
    return updatedUser;
  });
}

export async function getAdminAuditLogs(limit = 50) {
  await ensureCurrentAdmin();
  return prisma.adminAuditLog.findMany({ take: Math.min(Math.max(Math.floor(limit), 1), 100), orderBy: { createdAt: "desc" }, include: { admin: { select: { id: true, name: true, nickname: true } }, targetUser: { select: { id: true, name: true, nickname: true } } } });
}

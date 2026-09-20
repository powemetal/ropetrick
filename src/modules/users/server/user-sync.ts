import { PrismaClient } from "@prisma/client";
import type { User } from "@prisma/client";
import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export class UnauthorizedError extends Error {
  constructor() {
    super("Authentication required");
    this.name = "UnauthorizedError";
  }
}

type SyncUserInput = {
  id: string;
  email: string;
  name: string;
  nickname?: string | null;
  avatarUrl?: string | null;
};

const nicknameFromValue = (value: string) => {
  const normalized = value
    .normalize("NFKD")
    .replace(/[\\u0300-\\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 24);

  return normalized || "adventurer";
};

const findAvailableNickname = async (prisma: PrismaClient, requestedNickname: string, userId: string) => {
  const baseNickname = nicknameFromValue(requestedNickname);
  let candidate = baseNickname;
  let suffix = 2;

  while (true) {
    const existingUser = await prisma.user.findUnique({
      where: { nickname: candidate },
      select: { id: true },
    });

    if (!existingUser || existingUser.id === userId) {
      return candidate;
    }

    candidate = `${baseNickname.slice(0, 20)}-${suffix}`;
    suffix += 1;
  }
};

export async function getOrCreateCurrentUser(): Promise<User> {
  const clerkUser = await currentUser();
  if (!clerkUser) throw new UnauthorizedError();

  const email = clerkUser.primaryEmailAddress?.emailAddress ?? clerkUser.emailAddresses[0]?.emailAddress;
  if (!email) throw new Error("Authenticated Clerk user has no email address");

  const nickname = clerkUser.username ?? clerkUser.firstName ?? email.split("@")[0] ?? "adventurer";
  const name = clerkUser.fullName ?? clerkUser.username ?? email;

  return syncUser(prisma, {
    id: clerkUser.id,
    email,
    name,
    nickname,
    avatarUrl: clerkUser.imageUrl,
  });
}

export async function syncUser(prisma: PrismaClient, input: SyncUserInput) {
  const existingUser = await prisma.user.findUnique({
    where: { id: input.id },
    select: { nickname: true },
  });
  const nickname = input.nickname ?? existingUser?.nickname ?? input.email.split("@")[0];
  const availableNickname = await findAvailableNickname(prisma, nickname, input.id);

  return prisma.user.upsert({
    where: { id: input.id },
    create: {
      id: input.id,
      email: input.email,
      name: input.name,
      nickname: availableNickname,
      avatarUrl: input.avatarUrl,
    },
    update: {
      email: input.email,
      name: input.name,
      nickname: availableNickname,
      avatarUrl: input.avatarUrl,
    },
  });
}

export async function deleteUser(prisma: PrismaClient, userId: string) {
  await prisma.user.deleteMany({ where: { id: userId } });
}

import { headers } from "next/headers";
import { Webhook } from "svix";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { deleteUser, syncUser } from "@/modules/users/server/user-sync";

const clerkUserDataSchema = z.object({
  id: z.string().min(1),
  email_addresses: z
    .array(
      z.object({
        email_address: z.string().email(),
        id: z.string(),
      }),
    )
    .default([]),
  primary_email_address_id: z.string().nullable().optional(),
  first_name: z.string().nullable().optional(),
  last_name: z.string().nullable().optional(),
  username: z.string().nullable().optional(),
  image_url: z.string().nullable().optional(),
});

const clerkEventSchema = z.object({
  type: z.enum(["user.created", "user.updated", "user.deleted"]),
  data: clerkUserDataSchema,
});

const getUserEmail = (data: z.infer<typeof clerkUserDataSchema>) => {
  const primaryEmail = data.email_addresses.find((email) => email.id === data.primary_email_address_id);

  return primaryEmail?.email_address ?? data.email_addresses[0]?.email_address;
};

export async function POST(request: Request) {
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return Response.json({ error: "Missing webhook configuration" }, { status: 500 });
  }

  const headerStore = await headers();
  const svixId = headerStore.get("svix-id");
  const svixTimestamp = headerStore.get("svix-timestamp");
  const svixSignature = headerStore.get("svix-signature");
  if (!svixId || !svixTimestamp || !svixSignature) {
    return Response.json({ error: "Missing Svix headers" }, { status: 400 });
  }

  const payload = await request.text();
  let event: unknown;
  try {
    event = new Webhook(webhookSecret).verify(payload, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    });
  } catch {
    return Response.json({ error: "Invalid webhook signature" }, { status: 400 });
  }

  const parsedEvent = clerkEventSchema.safeParse(event);
  if (!parsedEvent.success) {
    return Response.json({ error: "Invalid Clerk event payload" }, { status: 400 });
  }

  const { type, data } = parsedEvent.data;
  if (type === "user.deleted") {
    await deleteUser(prisma, data.id);
    return Response.json({ received: true });
  }

  const email = getUserEmail(data);
  if (!email) {
    return Response.json({ error: "Clerk user has no email address" }, { status: 422 });
  }

  const name = [data.first_name, data.last_name].filter(Boolean).join(" ") || data.username || email;
  await syncUser(prisma, {
    id: data.id,
    email,
    name,
    nickname: data.username,
    avatarUrl: data.image_url,
  });

  return Response.json({ received: true });
}

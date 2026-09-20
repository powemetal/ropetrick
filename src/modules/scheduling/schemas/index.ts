import { z } from "zod";

export const ScheduleRuleSchema = z.object({
  campaignId: z.string().min(1),
  frequency: z.enum(["WEEKLY", "BIWEEKLY", "MONTHLY", "CUSTOM"]),
  dayOfWeek: z.number().int().min(0).max(6),
  startTime: z
    .string()
    .transform((value) => value.trim().slice(0, 5))
    .pipe(z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "L'heure doit respecter le format HH:MM")),
  durationMinutes: z.number().int().positive(),
});

export const ScheduleRuleCreateSchema = ScheduleRuleSchema.omit({ campaignId: true });

export const ScheduledGameSchema = z.object({
  campaignId: z.string().min(1),
  scheduleRuleId: z.string().nullable().optional(),
  dateTime: z.coerce.date(),
  title: z.string().min(1),
  status: z.enum(["SCHEDULED", "CONFIRMED", "CANCELLED", "COMPLETED"]),
});

export const GameAttendanceSchema = z.object({
  gameId: z.string().min(1),
  userId: z.string().min(1),
  status: z.enum(["ATTENDING", "NOT_ATTENDING", "TENTATIVE", "NO_REPLY"]),
  comment: z.string().nullable().optional(),
});

import { Prisma } from "@prisma/client";
import { z } from "zod";

const foundryActorSchema = z
  .object({
    _id: z.string().optional(),
    name: z.string().min(1),
    img: z.string().optional(),
    system: z.record(z.string(), z.unknown()),
    flags: z.record(z.string(), z.unknown()).optional(),
  })
  .passthrough();

type JsonRecord = Record<string, unknown>;

export type ParsedFoundryCharacter = {
  name: string;
  avatarUrl: string | null;
  race: string | null;
  class: string | null;
  subclass: string | null;
  level: number;
  stats: Prisma.InputJsonObject;
  foundryActorId: string | null;
  foundryVersion: string | null;
  rawImportData: Prisma.InputJsonValue;
};

const asRecord = (value: unknown): JsonRecord => (typeof value === "object" && value !== null && !Array.isArray(value) ? (value as JsonRecord) : {});

const textAt = (record: JsonRecord, ...keys: string[]) => {
  let current: unknown = record;
  for (const key of keys) {
    current = asRecord(current)[key];
  }
  return typeof current === "string" && current.trim() ? current.trim() : null;
};

const numberAt = (record: JsonRecord, ...keys: string[]) => {
  let current: unknown = record;
  for (const key of keys) {
    current = asRecord(current)[key];
  }
  return typeof current === "number" && Number.isFinite(current) ? current : null;
};

const firstText = (...values: (string | null)[]) => values.find(Boolean) ?? null;

const extractClassData = (system: JsonRecord) => {
  const classes = asRecord(system.classes);
  const firstClass = Object.values(classes).find((value) => typeof value === "object");
  const classRecord = asRecord(firstClass);
  const subclass = firstText(textAt(classRecord, "subclass"), textAt(classRecord, "subclassName"));

  return {
    className: firstText(textAt(system, "details", "class", "name"), textAt(system, "details", "class"), textAt(classRecord, "name")),
    subclass,
  };
};

const extractItems = (rawActor: JsonRecord): Prisma.InputJsonArray => {
  const items = Array.isArray(rawActor.items) ? rawActor.items : [];
  return items.map((item) => {
    const itemRecord = asRecord(item);
    const itemSystem = asRecord(itemRecord.system);
    return {
      name: typeof itemRecord.name === "string" ? itemRecord.name : "Unnamed item",
      type: typeof itemRecord.type === "string" ? itemRecord.type : null,
      quantity: numberAt(itemSystem, "quantity") ?? 1,
      equipped: itemSystem.equipped === true,
    };
  });
};

export function parseFoundryActor(rawJson: unknown): ParsedFoundryCharacter {
  const actor = foundryActorSchema.parse(rawJson);
  const system = actor.system;
  const classData = extractClassData(system);
  const attributes = asRecord(system.attributes);
  const hitPoints = {
    current: numberAt(system, "attributes", "hp", "value"),
    max: numberAt(system, "attributes", "hp", "max"),
  };

  const stats: Prisma.InputJsonObject = {
    abilities: asRecord(system.abilities) as Prisma.InputJsonObject,
    hitPoints,
    armorClass: numberAt(system, "attributes", "ac", "value") ?? numberAt(system, "attributes", "ac"),
    speed: attributes.movement ?? attributes.speed ?? null,
    inventory: extractItems(actor as JsonRecord),
  };

  const rawImportData = actor as unknown as Prisma.InputJsonValue;
  return {
    name: actor.name,
    avatarUrl: actor.img ?? null,
    race: firstText(textAt(system, "details", "race", "name"), textAt(system, "details", "race")),
    class: classData.className,
    subclass: classData.subclass,
    level: numberAt(system, "details", "level") ?? 1,
    stats,
    foundryActorId: actor._id ?? null,
    foundryVersion: textAt(actor.flags ?? {}, "core", "version"),
    rawImportData,
  };
}

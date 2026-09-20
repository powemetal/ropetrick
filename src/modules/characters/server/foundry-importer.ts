import { Prisma } from "@prisma/client";
import { z } from "zod";

const foundryActorSchema = z
  .object({
    _id: z.string().optional(),
    name: z.string().min(1),
    img: z.string().optional(),
    system: z.record(z.string(), z.unknown()),
    flags: z.record(z.string(), z.unknown()).optional(),
    items: z.array(z.record(z.string(), z.unknown())).optional(),
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
  extractedSpells: Array<{
    name: string;
    level: number;
    school: string;
    castingTime: string;
    range: string;
    description: string;
    concentration: boolean;
  }>;
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

function cleanHtmlDescription(html: string | null): string {
  if (!html) return "";

  return html
    .replace(/<\/p>/gi, "\n")
    .replace(/<\/div>/gi, "\n")
    .replace(/<br\s*[\/]?>/gi, "\n")
    .replace(/<[^>]*>/g, "")
    .replace(/@(?:Item|JournalEntry|Actor|RollTable|Compendium|UUID|config|embed|variantrule|spell|creature|action|feat)\[([^|\]]+)(?:\|[^\]]+)*\]/g, "$1")
    .replace(/\[\[\/damage\s+([0-9d+\s-]+)(?:\s+type=([a-z]+))?\]\]/gi, "$1 $2")
    .replace(/\[\[\/[a-z]+\s+([^\]]+)\]\]/gi, "$1")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .split("\n")
    .map((line) => line.replace(/\s+/g, " ").trim())
    .filter((line) => line.length > 0)
    .join("\n");
}

export function parseFoundryActor(rawJson: unknown): ParsedFoundryCharacter {
  const actor = foundryActorSchema.parse(rawJson);
  const system = actor.system;
  const items = actor.items ?? [];

  let className: string | null = null;
  let subclass: string | null = null;
  let calculatedLevel = 0;

  const classItem = items.find((item) => item.type === "class");
  if (classItem) {
    className = typeof classItem.name === "string" ? classItem.name : null;
    const classSystem = asRecord(classItem.system);
    calculatedLevel = numberAt(classSystem, "levels") ?? 1;
    subclass = firstText(textAt(classSystem, "subclass"), textAt(classSystem, "subclassName"));
  }

  if (!className) {
    className = firstText(
      textAt(system, "details", "class", "name"),
      textAt(system, "details", "class"),
      textAt(asRecord(system.classes), "name")
    );
  }

  const level = numberAt(system, "details", "level") ?? calculatedLevel ?? 1;

  const race = firstText(
    textAt(system, "details", "race", "name"),
    textAt(system, "details", "race")
  );

  const inventory: any[] = [];
  const extractedSpells: ParsedFoundryCharacter["extractedSpells"] = [];

  for (const item of items) {
    const itemRecord = asRecord(item);
    const itemSystem = asRecord(itemRecord.system);
    const currentItemType = typeof itemRecord.type === "string" ? itemRecord.type : null;

    if (currentItemType === "spell") {
      extractedSpells.push({
        name: typeof itemRecord.name === "string" ? itemRecord.name : "Sort inconnu",
        level: numberAt(itemSystem, "level") ?? 0,
        school: textAt(itemSystem, "school") ?? "universal",
        castingTime: textAt(itemSystem, "activation", "type") ?? "action",
        range: textAt(itemSystem, "range", "units") ?? "self",
        description: cleanHtmlDescription(textAt(itemSystem, "description", "value")),
        concentration: Array.isArray(itemSystem.properties) && itemSystem.properties.includes("concentration"),
      });
    } else if (["weapon", "equipment", "tool", "loot", "consumable", "shield"].includes(currentItemType ?? "")) {
      inventory.push({
        name: typeof itemRecord.name === "string" ? itemRecord.name : "Objet",
        type: currentItemType,
        quantity: numberAt(itemSystem, "quantity") ?? 1,
        equipped: itemSystem.equipped === true,
      });
    }
  }

  const attributes = asRecord(system.attributes);
  const hitPoints = {
    current: numberAt(system, "attributes", "hp", "value"),
    max: numberAt(system, "attributes", "hp", "max"),
  };

  const stats: Prisma.InputJsonObject = {
    abilities: asRecord(system.abilities) as Prisma.InputJsonObject,
    hitPoints,
    armorClass: numberAt(system, "attributes", "ac", "value") ?? numberAt(system, "attributes", "ac") ?? 10,
    speed: (attributes.movement as Prisma.InputJsonValue) ?? (attributes.speed as Prisma.InputJsonValue) ?? null,
    inventory: inventory as unknown as Prisma.InputJsonValue,
  };

  const rawImportData = actor as unknown as Prisma.InputJsonValue;

  return {
    name: actor.name,
    avatarUrl: actor.img ?? null,
    race,
    class: className,
    subclass,
    level,
    stats,
    foundryActorId: actor._id ?? null,
    foundryVersion: textAt(actor.flags ?? {}, "core", "version") ?? textAt(actor, "_stats", "systemVersion"),
    rawImportData,
    extractedSpells,
  };
}
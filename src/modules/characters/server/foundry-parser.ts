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
  backstory: string | null;
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
  extractedFeats: Array<{
    name: string;
    description: string;
    requirements: string | null;
    featureType: string; // "feat", "race", "class", etc.
  }>;
  extractedItems: Array<{
    name: string;
    type: string;
    quantity: number;
    equipped: boolean;
    description: string;
    weight: number;
    price: number;
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
  return typeof current === "number" && Number.isFinite(current) ? current : 0;
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
    calculatedLevel = numberAt(classSystem, "levels") || 1;
    subclass = firstText(textAt(classSystem, "subclass"), textAt(classSystem, "subclassName"));
  }

  if (!className) {
    className = firstText(
      textAt(system, "details", "class", "name"),
      textAt(system, "details", "class"),
      textAt(asRecord(system.classes), "name")
    );
  }

  const level = numberAt(system, "details", "level") || calculatedLevel || 1;

  const race = firstText(
    textAt(system, "details", "race", "name"),
    textAt(system, "details", "race")
  );

  const rawBiography = textAt(system, "details", "biography", "value");
  const backstory = rawBiography ? cleanHtmlDescription(rawBiography) : null;

  const extractedSpells: ParsedFoundryCharacter["extractedSpells"] = [];
  const extractedFeats: ParsedFoundryCharacter["extractedFeats"] = [];
  const extractedItems: ParsedFoundryCharacter["extractedItems"] = [];

  for (const item of items) {
    const itemRecord = asRecord(item);
    const itemSystem = asRecord(itemRecord.system);
    const currentItemType = typeof itemRecord.type === "string" ? itemRecord.type : null;
    const itemName = typeof itemRecord.name === "string" ? itemRecord.name : "Inconnu";
    const itemDesc = cleanHtmlDescription(textAt(itemSystem, "description", "value"));

    const itemSysTypeObj = asRecord(itemSystem.type);
    const itemSysTypeValue = typeof itemSysTypeObj.value === "string" ? itemSysTypeObj.value : null;
    const itemSubtypeValue = typeof itemSysTypeObj.subtype === "string" ? itemSysTypeObj.subtype : null;

    if (currentItemType === "spell") {
      extractedSpells.push({
        name: itemName,
        level: numberAt(itemSystem, "level"),
        school: textAt(itemSystem, "school") ?? "universal",
        castingTime: textAt(itemSystem, "activation", "type") ?? "action",
        range: textAt(itemSystem, "range", "units") ?? "self",
        description: itemDesc,
        concentration: Array.isArray(itemSystem.properties) && itemSystem.properties.includes("concentration"),
      });
    } else if (
      currentItemType === "feat" || 
      currentItemType === "race" || 
      currentItemType === "class" ||
      currentItemType === "subclass" ||
      itemSysTypeValue === "race" || 
      itemSysTypeValue === "class" ||
      itemSysTypeValue === "subclass" ||
      itemSysTypeValue === "feat"
    ) {
      // Détermination propre du type pour le tri dans l'UI (inclut désormais les sous-classes)
      let resolvedFeatureType = "feat";
      if (itemSysTypeValue === "race" || currentItemType === "race") {
        resolvedFeatureType = "race";
      } else if (
        itemSysTypeValue === "class" || 
        currentItemType === "class" || 
        currentItemType === "subclass" ||
        currentItemType === "subclass" ||
        itemSubtypeValue === "class" ||
        currentItemType === "subclass"
      ) {
        resolvedFeatureType = "class";
      } else if (itemSubtypeValue === "origin" || itemSubtypeValue === "fightingStyle") {
        resolvedFeatureType = "feat";
      }

      extractedFeats.push({
        name: itemName,
        description: itemDesc,
        requirements: textAt(itemSystem, "requirements"),
        featureType: resolvedFeatureType,
      });
    } else if (["weapon", "equipment", "tool", "loot", "consumable", "shield"].includes(currentItemType ?? "")) {
      const weightObj = asRecord(itemSystem.weight);
      const priceObj = asRecord(itemSystem.price);

      extractedItems.push({
        name: itemName,
        type: currentItemType ?? "loot",
        quantity: numberAt(itemSystem, "quantity") || 1,
        equipped: itemSystem.equipped === true,
        description: itemDesc,
        weight: numberAt(weightObj, "value"),
        price: numberAt(priceObj, "value"),
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
    armorClass: numberAt(system, "attributes", "ac", "value") || numberAt(system, "attributes", "ac") || 10,
    speed: (attributes.movement as Prisma.InputJsonValue) ?? (attributes.speed as Prisma.InputJsonValue) ?? null,
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
    backstory,
    foundryActorId: actor._id ?? null,
    foundryVersion: textAt(actor.flags ?? {}, "core", "version") ?? textAt(actor, "_stats", "systemVersion"),
    rawImportData,
    extractedSpells,
    extractedFeats,
    extractedItems,
  };
}
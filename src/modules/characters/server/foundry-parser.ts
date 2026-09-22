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
  currency: {
    cp: number;
    sp: number;
    ep: number;
    gp: number;
    pp: number;
  };
  spellSlots: Prisma.InputJsonObject;
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
    ritual: boolean;
    prepared: boolean;
  }>;
  extractedFeats: Array<{
    name: string;
    description: string;
    requirements: string | null;
    featureType: string; // "feat", "race", "class", "background"
    usesValue: number | null;
    usesMax: number | null;
  }>;
  extractedItems: Array<{
    name: string;
    type: string;
    quantity: number;
    equipped: boolean;
    attunement: number; // 0: none, 1: required, 2: attuned
    description: string;
    weight: number;
    price: number;
    customData: Prisma.InputJsonObject;
  }>;
};

const asRecord = (value: unknown): JsonRecord =>
  typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as JsonRecord)
    : {};

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
    .replace(
      /@(?:Item|JournalEntry|Actor|RollTable|Compendium|UUID|config|embed|variantrule|spell|creature|action|feat)\[([^|\]]+)(?:\|[^\]]+)*\]/g,
      "$1"
    )
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

  // 1. Détection des classes (support multiclassage et v11/v12)
  const classItems = items.filter((item) => item.type === "class");
  const subclassItems = items.filter((item) => item.type === "subclass");

  let className: string | null = null;
  let subclassName: string | null = null;
  let totalCalculatedLevel = 0;

  if (classItems.length > 0) {
    // Si multiclassage, concatène ex: "Fighter / Cleric"
    const classNames: string[] = [];
    const subClassNames: string[] = [];

    for (const cItem of classItems) {
      const cSystem = asRecord(cItem.system);
      const cName = typeof cItem.name === "string" ? cItem.name : "Inconnu";
      const cLvl = numberAt(cSystem, "levels") || 1;
      totalCalculatedLevel += cLvl;
      classNames.push(`${cName} ${cLvl}`);

      const inlineSubclass = firstText(
        textAt(cSystem, "subclass"),
        textAt(cSystem, "subclassName")
      );
      if (inlineSubclass) subClassNames.push(inlineSubclass);
    }

    className = classNames.join(" / ");

    // Ajout des items de type "subclass" v12 si non trouvés en inline
    for (const scItem of subclassItems) {
      if (typeof scItem.name === "string" && !subClassNames.includes(scItem.name)) {
        subClassNames.push(scItem.name);
      }
    }

    subclassName = subClassNames.length > 0 ? subClassNames.join(" / ") : null;
  }

  // Fallback si pas d'item de classe dédié
  if (!className) {
    className = firstText(
      textAt(system, "details", "class", "name"),
      textAt(system, "details", "class"),
      textAt(asRecord(system.classes), "name")
    );
  }

  const level = numberAt(system, "details", "level") || totalCalculatedLevel || 1;
  const race = firstText(
    textAt(system, "details", "race", "name"),
    textAt(system, "details", "race")
  );

  const rawBiography = textAt(system, "details", "biography", "value");
  const backstory = rawBiography ? cleanHtmlDescription(rawBiography) : null;

  // 2. Extraction des devises (currency)
  const currencyObj = asRecord(system.currency);
  const currency = {
    cp: numberAt(currencyObj, "cp"),
    sp: numberAt(currencyObj, "sp"),
    ep: numberAt(currencyObj, "ep"),
    gp: numberAt(currencyObj, "gp"),
    pp: numberAt(currencyObj, "pp"),
  };

  // 3. Extraction des emplacements de sorts (spell slots)
  const rawSpells = asRecord(system.spells);
  const spellSlots: Record<string, { value: number; max: number }> = {};
  for (const [key, val] of Object.entries(rawSpells)) {
    const slotRecord = asRecord(val);
    const max = numberAt(slotRecord, "max");
    if (max > 0 || key === "pact") {
      spellSlots[key] = {
        value: numberAt(slotRecord, "value"),
        max,
      };
    }
  }

  // 4. Parcourt des items
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
    const itemFlags = asRecord(itemRecord.flags);
    const plutoniumFlags = asRecord(itemFlags.plutonium);
    const dnd5eFlags = asRecord(itemFlags.dnd5e);

    // Sorts
    if (currentItemType === "spell") {
      const prepRecord = asRecord(itemSystem.preparation);
      const isPrepared =
        prepRecord.prepared === true ||
        prepRecord.mode === "always" ||
        prepRecord.mode === "innate" ||
        prepRecord.mode === "pact";

      const properties = Array.isArray(itemSystem.properties)
        ? (itemSystem.properties as string[])
        : Object.keys(asRecord(itemSystem.properties));

      extractedSpells.push({
        name: itemName,
        level: numberAt(itemSystem, "level"),
        school: textAt(itemSystem, "school") ?? "universal",
        castingTime: textAt(itemSystem, "activation", "type") ?? "action",
        range: textAt(itemSystem, "range", "units") ?? "self",
        description: itemDesc,
        concentration: properties.includes("concentration") || properties.includes("conc"),
        ritual: properties.includes("ritual") || properties.includes("rit"),
        prepared: isPrepared,
      });
      continue;
    }

    // Capacités, Dons et Traits
    if (
      currentItemType === "feat" ||
      currentItemType === "race" ||
      currentItemType === "background" ||
      itemSysTypeValue === "race" ||
      itemSysTypeValue === "class" ||
      itemSysTypeValue === "feat" ||
      itemSysTypeValue === "background"
    ) {
      let resolvedFeatureType = "feat";
      if (itemSysTypeValue === "race" || currentItemType === "race") {
        resolvedFeatureType = "race";
      } else if (
        itemSysTypeValue === "class" ||
        itemSubtypeValue === "class" ||
        plutoniumFlags.page === "classFeature" ||
        dnd5eFlags.isClassFeatureVariant === true
      ) {
        resolvedFeatureType = "class";
      } else if (itemSysTypeValue === "background" || currentItemType === "background") {
        resolvedFeatureType = "background";
      } else if (itemSubtypeValue === "origin" || itemSubtypeValue === "fightingStyle") {
        resolvedFeatureType = "feat";
      }

      const usesObj = asRecord(itemSystem.uses);
      const usesMax = numberAt(usesObj, "max");

      extractedFeats.push({
        name: itemName,
        description: itemDesc,
        requirements: textAt(itemSystem, "requirements"),
        featureType: resolvedFeatureType,
        usesValue: usesMax > 0 ? numberAt(usesObj, "value") : null,
        usesMax: usesMax > 0 ? usesMax : null,
      });
      continue;
    }

    // Équipement, Armes, Armures, Consommables, Butin
    if (
      [
        "weapon",
        "equipment",
        "tool",
        "loot",
        "consumable",
        "shield",
        "container",
      ].includes(currentItemType ?? "")
    ) {
      const weightObj = asRecord(itemSystem.weight);
      const priceObj = asRecord(itemSystem.price);
      const attunementVal = numberAt(itemSystem, "attunement");

      extractedItems.push({
        name: itemName,
        type: currentItemType ?? "loot",
        quantity: numberAt(itemSystem, "quantity") || 1,
        equipped: itemSystem.equipped === true,
        attunement: attunementVal, // 0 = non, 1 = requis, 2 = harmonisé
        description: itemDesc,
        weight: numberAt(weightObj, "value"),
        price: numberAt(priceObj, "value"),
        customData: {
          damage: itemSystem.damage,
          properties: itemSystem.properties,
          armor: itemSystem.armor,
          rarity: textAt(itemSystem, "rarity"),
        } as Prisma.InputJsonObject,
      });
    }
  }

  // 5. Statistiques & Attributs
  const attributes = asRecord(system.attributes);
  const hitPoints = {
    current: numberAt(system, "attributes", "hp", "value"),
    max: numberAt(system, "attributes", "hp", "max"),
    temp: numberAt(system, "attributes", "hp", "temp"),
  };

  const stats: Prisma.InputJsonObject = {
    abilities: asRecord(system.abilities) as Prisma.InputJsonObject,
    hitPoints,
    armorClass:
      numberAt(system, "attributes", "ac", "value") ||
      numberAt(system, "attributes", "ac") ||
      10,
    speed:
      (attributes.movement as Prisma.InputJsonValue) ??
      (attributes.speed as Prisma.InputJsonValue) ??
      null,
    initiative: numberAt(attributes, "init", "total") || numberAt(attributes, "init", "value"),
    spellSaveDc: numberAt(attributes, "spelldc") || null,
  };

  const rawImportData = actor as unknown as Prisma.InputJsonValue;

  return {
    name: actor.name,
    avatarUrl: actor.img ?? null,
    race,
    class: className,
    subclass: subclassName,
    level,
    stats,
    currency,
    spellSlots: spellSlots as Prisma.InputJsonObject,
    backstory,
    foundryActorId: actor._id ?? null,
    foundryVersion:
      textAt(actor.flags ?? {}, "core", "version") ??
      textAt(actor, "_stats", "systemVersion") ??
      null,
    rawImportData,
    extractedSpells,
    extractedFeats,
    extractedItems,
  };
}
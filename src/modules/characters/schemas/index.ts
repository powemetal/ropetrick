import { z } from "zod";

export const CharacterSchema = z.object({
  userId: z.string().min(1),
  name: z.string().trim().min(1),
  avatarUrl: z.string().url().nullable().optional(),
  race: z.string().nullable().optional(),
  class: z.string().nullable().optional(),
  subclass: z.string().nullable().optional(),
  level: z.number().int().min(1),
  stats: z.record(z.string(), z.unknown()),
  foundryActorId: z.string().nullable().optional(),
  foundryVersion: z.string().nullable().optional(),
  rawImportData: z.record(z.string(), z.unknown()).nullable().optional(),
});

export const CharacterCreateSchema = CharacterSchema.omit({
  userId: true,
  rawImportData: true,
}).extend({
  strength: z.number().int().min(1).max(30).optional(),
  dexterity: z.number().int().min(1).max(30).optional(),
  constitution: z.number().int().min(1).max(30).optional(),
  intelligence: z.number().int().min(1).max(30).optional(),
  wisdom: z.number().int().min(1).max(30).optional(),
  charisma: z.number().int().min(1).max(30).optional(),
  maxHitPoints: z.number().int().min(1).optional(),
  currentHitPoints: z.number().int().min(0).optional(),
  temporaryHitPoints: z.number().int().min(0).optional(),
  hitDie: z
    .number()
    .int()
    .refine((value) => [6, 8, 10, 12].includes(value))
    .optional(),
  armorClass: z.number().int().min(0).optional(),
  speed: z.number().int().min(0).optional(),
  themeKey: z.string().min(1).optional(),
  notebookTheme: z.string().min(1).optional(),
  speciesId: z.string().min(1).optional(),
  subspeciesId: z.string().min(1).nullable().optional(),
  backgroundId: z.string().min(1).optional(),
  dndClassId: z.string().min(1).optional(),
  subclassId: z.string().min(1).nullable().optional(),
  skillProficiencies: z.record(z.string(), z.enum(["NONE", "PROFICIENT", "EXPERTISE"])).optional(),
  selectedSpellIds: z.array(z.string().min(1)).optional(),
  selectedWeaponMasteryIds: z.array(z.string().min(1)).optional(),
  selectedLanguageIds: z.array(z.string().min(1)).optional(),
  startingEquipmentIds: z.array(z.string().min(1)).optional(),
});

export const CharacterSheetUpdateSchema = z.object({
  name: z.string().min(1),
  class: z.string().nullable(),
  subclass: z.string().nullable(),
  strength: z.number().int().min(1).max(30),
  dexterity: z.number().int().min(1).max(30),
  constitution: z.number().int().min(1).max(30),
  intelligence: z.number().int().min(1).max(30),
  wisdom: z.number().int().min(1).max(30),
  charisma: z.number().int().min(1).max(30),
  skillProficiencies: z.record(z.string(), z.enum(["NONE", "PROFICIENT", "EXPERTISE"])),
  themeKey: z.string().min(1).optional(),
  notebookTheme: z.string().min(1).optional(),
  copperPieces: z.number().int().min(0).optional(),
  silverPieces: z.number().int().min(0).optional(),
  electrumPieces: z.number().int().min(0).optional(),
  goldPieces: z.number().int().min(0).optional(),
  platinumPieces: z.number().int().min(0).optional(),
  personalityTraits: z.string().nullable().optional(),
  ideals: z.string().nullable().optional(),
  bonds: z.string().nullable().optional(),
  flaws: z.string().nullable().optional(),
  appearance: z.string().nullable().optional(),
  backstory: z.string().nullable().optional(),
  alliesOrganizations: z.string().nullable().optional(),
  inventoryItems: z
    .array(
      z.object({
        id: z.string().min(1),
        quantity: z.number().int().min(1),
        isEquipped: z.boolean(),
        item: z.object({
          id: z.string().min(1),
          name: z.string().min(1),
          category: z.string().min(1),
          type: z.enum(["WEAPON", "ARMOR", "SHIELD", "TOOL", "GEAR", "CONSUMABLE"]).nullable(),
          costGp: z.number().nullable(),
          weightLb: z.number().nullable(),
          armorClass: z.number().nullable(),
        }),
      }),
    )
    .optional(),
});

export const CharacterLevelUpSchema = z.object({
  hitPointMethod: z.enum(["AVERAGE", "ROLL"]),
  abilityIncrease: z.record(z.string(), z.number().int().min(0).max(2)).optional(),
  feat: z.string().max(120).nullable().optional(),
  subclassId: z.string().min(1).nullable().optional(),
  spellIds: z.array(z.string().min(1)).optional(),
  preparedSpells: z.array(z.string()).optional(),
});

export const CharacterNotebookSchema = z.object({
  characterId: z.string().min(1),
  title: z.string().min(1),
  subject: z.string().min(1),
  content: z.string(),
});

export const NoteAttachmentSchema = z.object({
  notebookId: z.string().min(1),
  fileUrl: z.string().url(),
  caption: z.string().nullable().optional(),
});
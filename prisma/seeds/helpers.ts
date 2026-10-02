import { PrismaClient, AbilityScore, SpellcastingProgression } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

export const prisma = new PrismaClient();

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export function resolveDataFile(filename: string): string | null {
  const possiblePaths = [
    path.join(__dirname, "..", "data_personnal", filename),
    path.join(__dirname, "..", "data", filename),
    path.join(__dirname, filename),
    path.join(process.cwd(), "prisma", "data_personnal", filename),
    path.join(process.cwd(), "prisma", "data", filename),
    path.join(process.cwd(), "data", filename),
    path.join(process.cwd(), filename),
  ];
  return possiblePaths.find((p) => fs.existsSync(p)) || null;
}

export async function getOrCreateSourceBook(code: string, title?: string) {
  const cleanCode = (code || "XPHB").toUpperCase();
  return prisma.sourceBook.upsert({
    where: { code: cleanCode },
    update: {},
    create: {
      code: cleanCode,
      title: title || `${cleanCode} Sourcebook`,
      isOfficial: true,
      enabledByDefault: cleanCode === "XPHB" || cleanCode === "PHB",
    },
  });
}

export function mapAbilityScore(val?: string): AbilityScore | null {
  if (!val) return null;
  const key = val.trim().toLowerCase();
  if (key.startsWith("str")) return AbilityScore.STRENGTH;
  if (key.startsWith("dex")) return AbilityScore.DEXTERITY;
  if (key.startsWith("con")) return AbilityScore.CONSTITUTION;
  if (key.startsWith("int")) return AbilityScore.INTELLIGENCE;
  if (key.startsWith("wis")) return AbilityScore.WISDOM;
  if (key.startsWith("cha")) return AbilityScore.CHARISMA;
  return null;
}

export function mapCasterProgression(prog?: string): SpellcastingProgression {
  if (!prog) return SpellcastingProgression.NONE;
  const key = prog.trim().toLowerCase();
  if (key === "full") return SpellcastingProgression.FULL;
  if (key === "half") return SpellcastingProgression.HALF;
  if (key === "1/3" || key === "third") return SpellcastingProgression.THIRD;
  if (key === "pact") return SpellcastingProgression.PACT;
  if (key === "artificer") return SpellcastingProgression.ARTIFICER;
  return SpellcastingProgression.NONE;
}

export function findClassFiles(): string[] {
  const possibleDirs = [
    path.join(__dirname, "..", "data_personnal"),
    path.join(__dirname, "..", "data"),
    path.join(__dirname, "data"),
    __dirname,
    path.join(process.cwd(), "prisma", "data_personnal"),
    path.join(process.cwd(), "prisma", "data"),
    path.join(process.cwd(), "data"),
    process.cwd(),
  ];

  const foundFiles = new Set<string>();
  for (const dir of possibleDirs) {
    if (fs.existsSync(dir)) {
      const files = fs.readdirSync(dir);
      for (const file of files) {
        if (file.startsWith("class-") && file.endsWith(".json")) {
          foundFiles.add(path.join(dir, file));
        }
      }
    }
  }
  return Array.from(foundFiles);
}
import { prisma } from "./seeds/helpers";
import { seedSourceBooks } from "./seeds/sourceBooks";
import { seedWeaponMasteries } from "./seeds/weaponMasteries";
import { seedLanguages } from "./seeds/languages";
import { seedSkills } from "./seeds/skills";
import { seedOptionalFeatures } from "./seeds/optionalFeatures";
import { seedFeats } from "./seeds/feats";
import { seedSpecies } from "./seeds/species";
import { seedBackgrounds } from "./seeds/backgrounds";
import { seedEquipment } from "./seeds/equipment";
import { seedClassesAndSubclasses } from "./seeds/classes";
import { seedDeities } from "./seeds/deities";
import { seedMagicVariants } from "./seeds/magicVariants";

async function clearDatabase() {
  console.log("🧹 Vidage complet de la base de données...");
  
  // Ordre inverse strict des dépendances (enfants d'abord, parents ensuite)
  await prisma.characterInventoryItem.deleteMany();
  await prisma.characterSpell.deleteMany();
  await prisma.characterWeaponMastery.deleteMany();
  await prisma.characterOptionalFeature.deleteMany();
  await prisma.characterResourceTracker.deleteMany();
  await prisma.characterLanguage.deleteMany();
  await prisma.characterNotebook.deleteMany();
  await prisma.character.deleteMany();

  await prisma.monster.deleteMany();
  await prisma.equipmentItem.deleteMany();
  await prisma.weaponMasteryProperty.deleteMany();
  await prisma.classFeature.deleteMany();
  await prisma.classLevelFeature.deleteMany();
  await prisma.classResourceDefinition.deleteMany();
  await prisma.dndSubclass.deleteMany();
  await prisma.dndClass.deleteMany();
  await prisma.background.deleteMany();
  await prisma.feat.deleteMany();
  await prisma.species.deleteMany();
  await prisma.subspecies.deleteMany();
  await prisma.optionalFeature.deleteMany();
  await prisma.skillDefinition.deleteMany();
  await prisma.language.deleteMany();
  await prisma.deity.deleteMany();
  await prisma.magicVariant.deleteMany();
  await prisma.sourceBook.deleteMany();

  console.log("✨ Base de données nettoyée avec succès.");
}

async function main() {
  console.log("🚀 Début du seed du Compendium...");

  // 1. On vide tout d'abord
  await clearDatabase();

  // 2. On réinsère tout de zéro
  await seedSourceBooks();
  const masteryMap = await seedWeaponMasteries();
  await seedLanguages();
  await seedSkills();
  await seedOptionalFeatures();
  const featMap = await seedFeats();
  await seedSpecies();
  await seedBackgrounds(featMap);
  await seedEquipment(masteryMap);
  await seedClassesAndSubclasses();
  await seedDeities();
  await seedMagicVariants();

  console.log("🎉 Seed terminé avec succès !");
}

main()
  .catch((e) => {
    console.error("❌ Erreur pendant le seed :", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
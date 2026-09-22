import { prisma } from "./helpers";

export async function seedWeaponMasteries() {
  console.log("⏳ Traitement des propriétés de Weapon Mastery...");
  const masteryDefinitions = [
    { code: "CLEAVE", name: "Cleave", description: "Make a melee attack against a second creature within 5 ft." },
    { code: "GRAZE", name: "Graze", description: "Deal ability modifier damage on a miss." },
    { code: "NICK", name: "Nick", description: "Make the Light extra attack as part of the Attack action." },
    { code: "PUSH", name: "Push", description: "Push a creature up to 10 feet away." },
    { code: "SAP", name: "Sap", description: "Disadvantage on the target's next attack roll." },
    { code: "SLOW", name: "Slow", description: "Reduce target speed by 10 feet." },
    { code: "TOPPLE", name: "Topple", description: "Force a Constitution save or knock the target prone." },
    { code: "VEX", name: "Vex", description: "Advantage on your next attack roll against that target." },
  ];

  // Insertion en masse
  await prisma.weaponMasteryProperty.createMany({
    data: masteryDefinitions,
    skipDuplicates: true,
  });

  // Récupération des IDs pour construire la map
  const records = await prisma.weaponMasteryProperty.findMany({
    select: { id: true, code: true, name: true },
  });

  const masteryMap = new Map<string, string>();
  for (const record of records) {
    masteryMap.set(record.name.toLowerCase(), record.id);
    masteryMap.set(record.code.toLowerCase(), record.id);
  }

  console.log("✅ Weapon Masteries insérées instantanément !");
  return masteryMap;
}
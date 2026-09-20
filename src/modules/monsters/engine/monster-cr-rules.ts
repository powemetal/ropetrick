export type MonsterCrSuggestion = {
  challengeRating: string;
  proficiencyBonus: number;
  armorClass: number;
  hitPoints: { min: number; max: number };
  attackBonus: number;
  saveDc: number;
  damagePerRound: { min: number; max: number };
};

const CR_VALUES = ["0", "1/8", "1/4", "1/2", ...Array.from({ length: 30 }, (_, index) => String(index + 1))];

const CR_REFERENCE: Record<string, Omit<MonsterCrSuggestion, "challengeRating">> = {
  "0": { proficiencyBonus: 2, armorClass: 12, hitPoints: { min: 1, max: 6 }, attackBonus: 3, saveDc: 10, damagePerRound: { min: 0, max: 1 } },
  "1/4": { proficiencyBonus: 2, armorClass: 13, hitPoints: { min: 36, max: 49 }, attackBonus: 3, saveDc: 11, damagePerRound: { min: 4, max: 5 } },
  "1/2": { proficiencyBonus: 2, armorClass: 13, hitPoints: { min: 50, max: 70 }, attackBonus: 3, saveDc: 12, damagePerRound: { min: 6, max: 8 } },
  "1": { proficiencyBonus: 2, armorClass: 13, hitPoints: { min: 71, max: 85 }, attackBonus: 3, saveDc: 12, damagePerRound: { min: 9, max: 14 } },
  "2": { proficiencyBonus: 2, armorClass: 13, hitPoints: { min: 86, max: 100 }, attackBonus: 3, saveDc: 13, damagePerRound: { min: 15, max: 20 } },
  "3": { proficiencyBonus: 2, armorClass: 13, hitPoints: { min: 101, max: 115 }, attackBonus: 4, saveDc: 13, damagePerRound: { min: 21, max: 26 } },
  "4": { proficiencyBonus: 2, armorClass: 14, hitPoints: { min: 116, max: 130 }, attackBonus: 5, saveDc: 14, damagePerRound: { min: 27, max: 32 } },
  "5": { proficiencyBonus: 3, armorClass: 15, hitPoints: { min: 131, max: 145 }, attackBonus: 6, saveDc: 15, damagePerRound: { min: 33, max: 38 } },
  "8": { proficiencyBonus: 3, armorClass: 16, hitPoints: { min: 176, max: 190 }, attackBonus: 7, saveDc: 16, damagePerRound: { min: 51, max: 56 } },
  "10": { proficiencyBonus: 4, armorClass: 17, hitPoints: { min: 206, max: 220 }, attackBonus: 7, saveDc: 16, damagePerRound: { min: 63, max: 68 } },
  "15": { proficiencyBonus: 5, armorClass: 18, hitPoints: { min: 281, max: 295 }, attackBonus: 8, saveDc: 18, damagePerRound: { min: 93, max: 98 } },
  "20": { proficiencyBonus: 6, armorClass: 19, hitPoints: { min: 356, max: 400 }, attackBonus: 10, saveDc: 19, damagePerRound: { min: 140, max: 150 } },
  "25": { proficiencyBonus: 8, armorClass: 19, hitPoints: { min: 586, max: 640 }, attackBonus: 12, saveDc: 21, damagePerRound: { min: 215, max: 230 } },
  "30": { proficiencyBonus: 9, armorClass: 19, hitPoints: { min: 801, max: 850 }, attackBonus: 14, saveDc: 23, damagePerRound: { min: 300, max: 320 } },
};

export function challengeRatings() {
  return CR_VALUES;
}

export function monsterCrSuggestion(challengeRating: string): MonsterCrSuggestion {
  if (CR_REFERENCE[challengeRating]) return { challengeRating, ...CR_REFERENCE[challengeRating] };
  const index = Math.max(CR_VALUES.indexOf(challengeRating), 0);
  const numericCr = challengeRating.includes("/") ? Number(challengeRating.split("/")[0]) / Number(challengeRating.split("/")[1]) : Number(challengeRating);
  const proficiencyBonus = 2 + Math.floor(Math.max(numericCr, 0) / 4);
  const armorClass = 13 + Math.floor(numericCr * 0.35);
  const baseHp = Math.max(5, Math.round(8 + numericCr * 28));
  const damage = Math.max(2, Math.round(3 + numericCr * 7));
  return { challengeRating, proficiencyBonus, armorClass, hitPoints: { min: Math.max(1, baseHp - 10), max: baseHp + 15 }, attackBonus: proficiencyBonus + 3 + Math.floor(index / 8), saveDc: 12 + Math.floor(numericCr / 3), damagePerRound: { min: Math.max(1, damage - 5), max: damage + 7 } };
}

export function scaleMonsterStats(stats: { armorClass: number; hitPoints: number; challengeRating: string }, direction: "up" | "down") {
  const factor = direction === "up" ? 1.25 : 0.8;
  return { armorClass: Math.max(1, Math.round(stats.armorClass + (direction === "up" ? 1 : -1))), hitPoints: Math.max(1, Math.round(stats.hitPoints * factor)), challengeRating: stats.challengeRating };
}

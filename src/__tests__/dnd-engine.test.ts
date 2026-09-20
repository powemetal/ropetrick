import { describe, expect, it } from "vitest";
import { calculateArmorClass, calculateMaxHitPoints, calculateModifier, calculateSkillBonuses, calculateSpellSlots, isValidPointBuy, pointBuyCost, proficiencyBonus } from "@/modules/characters/engine/dnd-rules-engine";

const scores = { strength: 15, dexterity: 14, constitution: 13, intelligence: 12, wisdom: 10, charisma: 8 } as const;

describe("D&D 5.5 rules engine", () => {
  it("calculates modifiers including negative odd scores", () => {
    expect(calculateModifier(18)).toBe(4);
    expect(calculateModifier(9)).toBe(-1);
    expect(calculateModifier(7)).toBe(-2);
  });

  it("validates the 27 point buy array", () => {
    expect(pointBuyCost(scores)).toBe(27);
    expect(isValidPointBuy(scores)).toBe(true);
    expect(isValidPointBuy({ ...scores, strength: 16 })).toBe(false);
  });

  it("uses the level-based proficiency bonus", () => {
    expect(proficiencyBonus(1)).toBe(2);
    expect(proficiencyBonus(5)).toBe(3);
    expect(proficiencyBonus(17)).toBe(6);
  });

  it("calculates armor for unarmored, medium and heavy armor", () => {
    expect(calculateArmorClass({ dexterityModifier: 3 })).toBe(13);
    expect(calculateArmorClass({ dexterityModifier: 4, armorCategory: "MEDIUM", armorBaseClass: 14, shieldBonus: 2 })).toBe(18);
    expect(calculateArmorClass({ dexterityModifier: 4, armorCategory: "HEAVY", armorBaseClass: 18 })).toBe(18);
    expect(calculateArmorClass({ dexterityModifier: 2, constitutionModifier: 3, armorCategory: "NONE", unarmoredStyle: "BARBARIAN" })).toBe(15);
  });

  it("calculates hit points, skills and spell slots", () => {
    expect(calculateMaxHitPoints({ level: 3, hitDie: 8, constitutionModifier: 2 })).toBe(24);
    expect(calculateSkillBonuses(scores, { athletics: "PROFICIENT", perception: "EXPERTISE" }, 5)).toMatchObject({ athletics: 5, perception: 6 });
    expect(calculateSpellSlots(5, "FULL")).toEqual([4, 3, 2, 0, 0, 0, 0, 0, 0]);
  });
});

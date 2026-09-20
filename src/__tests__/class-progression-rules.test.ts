import { describe, expect, it } from "vitest";
import { asiLevelsForClass, getMulticlassEligibility, validateLevelUpChoices } from "@/modules/characters/engine/class-progression-rules";

describe("strict class progression", () => {
  it("uses the official fighter and rogue ASI tables", () => {
    expect(asiLevelsForClass("Guerrier")).toEqual([4, 6, 8, 12, 14, 16, 19]);
    expect(asiLevelsForClass("Roublard")).toEqual([4, 8, 10, 12, 16, 19]);
  });

  it("blocks missing choices and allows a valid ASI", () => {
    expect(validateLevelUpChoices("Barde", 3, { hitPointMethod: "AVERAGE" }).valid).toBe(false);
    expect(validateLevelUpChoices("Barde", 3, { hitPointMethod: "AVERAGE", abilityIncrease: { strength: 2 } }).valid).toBe(true);
    expect(validateLevelUpChoices("Barde", 4, { hitPointMethod: "AVERAGE", feat: "Alert" }).errors[0]).toContain("interdits");
  });

  it("requires a subclass at level three and hides ASI outside legal levels", () => {
    expect(validateLevelUpChoices("Guerrier", 2, { hitPointMethod: "ROLL" }).errors).toContain("Une sous-classe doit être sélectionnée au niveau 3.");
    expect(validateLevelUpChoices("Guerrier", 2, { hitPointMethod: "ROLL", subclassId: "champion" }).valid).toBe(true);
    expect(validateLevelUpChoices("Guerrier", 1, { hitPointMethod: "AVERAGE", abilityIncrease: { strength: 2 } }).valid).toBe(false);
    expect(validateLevelUpChoices("Barde", 3, { hitPointMethod: "AVERAGE", abilityIncrease: { strength: 2 } }).valid).toBe(true);
  });

  it("enforces multiclass prerequisites for both current and new classes", () => {
    expect(getMulticlassEligibility("Guerrier", "Paladin", { strength: 12, dexterity: 15, wisdom: 12, charisma: 13, intelligence: 10, constitution: 14 }).eligible).toBe(false);
    expect(getMulticlassEligibility("Guerrier", "Magicien", { strength: 13, dexterity: 14, wisdom: 12, charisma: 10, intelligence: 13, constitution: 14 }).eligible).toBe(true);
    expect(getMulticlassEligibility("Moine", "Paladin", { strength: 13, dexterity: 13, wisdom: 12, charisma: 13, intelligence: 10, constitution: 14 }).eligible).toBe(false);
  });
});

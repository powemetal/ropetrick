import { CreatureSize } from "@prisma/client";
import { CompendiumCrudTable, type CrudField } from "@/components/admin/CompendiumCrudTable";
import { createAdminMonster, deleteAdminCompendiumRecord, getAdminCompendiumData, updateAdminMonster } from "@/modules/users/server/admin-compendium-service";

const str = (formData: FormData, key: string) => String(formData.get(key) ?? "").trim();
const optStr = (formData: FormData, key: string) => str(formData, key) || null;
const num = (formData: FormData, key: string) => Number(formData.get(key) ?? 0);
const optNum = (formData: FormData, key: string) => { const raw = str(formData, key); return raw ? Number(raw) : null; };

export default async function AdminMonstersPage() {
  const { monsters, sourceBooks } = await getAdminCompendiumData();

  async function remove(id: string) {
    "use server";
    await deleteAdminCompendiumRecord("monster", id);
  }

  async function create(formData: FormData) {
    "use server";
    await createAdminMonster({
      sourceBookId: optStr(formData, "sourceBookId"),
      slug: str(formData, "slug"),
      name: str(formData, "name"),
      size: str(formData, "size") as CreatureSize,
      creatureType: str(formData, "creatureType"),
      subtype: optStr(formData, "subtype"),
      alignment: optStr(formData, "alignment"),
      challengeRating: str(formData, "challengeRating"),
      cr: optNum(formData, "cr"),
      armorClass: num(formData, "armorClass"),
      hitPoints: num(formData, "hitPoints"),
      hitDice: optStr(formData, "hitDice"),
      strength: num(formData, "strength"),
      dexterity: num(formData, "dexterity"),
      constitution: num(formData, "constitution"),
      intelligence: num(formData, "intelligence"),
      wisdom: num(formData, "wisdom"),
      charisma: num(formData, "charisma"),
      passivePerception: optNum(formData, "passivePerception"),
      isLegendary: formData.get("isLegendary") === "on",
    });
  }

  async function update(id: string, formData: FormData) {
    "use server";
    await updateAdminMonster(id, {
      sourceBookId: optStr(formData, "sourceBookId"),
      name: str(formData, "name"),
      size: str(formData, "size") as CreatureSize,
      creatureType: str(formData, "creatureType"),
      subtype: optStr(formData, "subtype"),
      alignment: optStr(formData, "alignment"),
      challengeRating: str(formData, "challengeRating"),
      cr: optNum(formData, "cr"),
      armorClass: num(formData, "armorClass"),
      hitPoints: num(formData, "hitPoints"),
      hitDice: optStr(formData, "hitDice"),
      strength: num(formData, "strength"),
      dexterity: num(formData, "dexterity"),
      constitution: num(formData, "constitution"),
      intelligence: num(formData, "intelligence"),
      wisdom: num(formData, "wisdom"),
      charisma: num(formData, "charisma"),
      passivePerception: optNum(formData, "passivePerception"),
      isLegendary: formData.get("isLegendary") === "on",
    });
  }

  const sizes: CreatureSize[] = ["TINY", "SMALL", "MEDIUM", "LARGE", "HUGE", "GARGANTUAN"];

  const fields: CrudField[] = [
    { name: "name", label: "Nom", type: "text", required: true },
    { name: "slug", label: "Slug", type: "text", required: true, hideOnEdit: true },
    { name: "size", label: "Taille", type: "select", required: true, options: sizes.map((size) => ({ value: size, label: size })) },
    { name: "creatureType", label: "Type de créature", type: "text", required: true },
    { name: "subtype", label: "Sous-type", type: "text" },
    { name: "alignment", label: "Alignement", type: "text" },
    { name: "challengeRating", label: "Facteur de puissance", type: "text", required: true },
    { name: "cr", label: "FP (numérique)", type: "number", step: "0.01" },
    { name: "armorClass", label: "Classe d'armure", type: "number", required: true },
    { name: "hitPoints", label: "Points de vie", type: "number", required: true },
    { name: "hitDice", label: "Dés de vie", type: "text" },
    { name: "strength", label: "Force", type: "number", required: true },
    { name: "dexterity", label: "Dextérité", type: "number", required: true },
    { name: "constitution", label: "Constitution", type: "number", required: true },
    { name: "intelligence", label: "Intelligence", type: "number", required: true },
    { name: "wisdom", label: "Sagesse", type: "number", required: true },
    { name: "charisma", label: "Charisme", type: "number", required: true },
    { name: "passivePerception", label: "Perception passive", type: "number" },
    { name: "isLegendary", label: "Légendaire", type: "checkbox" },
    { name: "sourceBookId", label: "Source", type: "select", options: sourceBooks.map((book) => ({ value: book.id, label: book.code })) },
  ];

  return (
    <CompendiumCrudTable
      title="Bestiaire"
      rows={monsters.map((monster) => ({
        id: monster.id,
        name: monster.name,
        cr: monster.challengeRating,
        armorClass: monster.armorClass,
        hitPoints: monster.hitPoints,
        legendary: monster.isLegendary ? "Oui" : "Non",
        lair: monster.hasLair ? "Oui" : "Non",
        slug: monster.slug,
        size: monster.size,
        creatureType: monster.creatureType,
        subtype: monster.subtype,
        alignment: monster.alignment,
        challengeRating: monster.challengeRating,
        hitDice: monster.hitDice,
        strength: monster.strength,
        dexterity: monster.dexterity,
        constitution: monster.constitution,
        intelligence: monster.intelligence,
        wisdom: monster.wisdom,
        charisma: monster.charisma,
        passivePerception: monster.passivePerception,
        isLegendary: monster.isLegendary,
        sourceBookId: monster.sourceBookId ?? "",
      }))}
      columns={["name", "cr", "armorClass", "hitPoints", "legendary", "lair"]}
      filters={[{ field: "creatureType", label: "Type" }, { field: "challengeRating", label: "FP" }]}
      fields={fields}
      onCreate={create}
      onUpdate={update}
      onDelete={remove}
    />
  );
}


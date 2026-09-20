import { ArmorCategory, ItemType } from "@prisma/client";
import { CompendiumCrudTable, type CrudField } from "@/components/admin/CompendiumCrudTable";
import { createAdminItem, deleteAdminCompendiumRecord, getAdminCompendiumData, updateAdminItem } from "@/modules/users/server/admin-compendium-service";

const str = (formData: FormData, key: string) => String(formData.get(key) ?? "").trim();
const optStr = (formData: FormData, key: string) => str(formData, key) || null;
const optNum = (formData: FormData, key: string) => { const raw = str(formData, key); return raw ? Number(raw) : null; };
const list = (formData: FormData, key: string) => str(formData, key).split(",").map((entry) => entry.trim()).filter(Boolean);

export default async function AdminItemsPage() {
  const { items, sourceBooks, masteries } = await getAdminCompendiumData();

  async function remove(id: string) {
    "use server";
    await deleteAdminCompendiumRecord("item", id);
  }

  async function create(formData: FormData) {
    "use server";
    await createAdminItem({
      sourceBookId: str(formData, "sourceBookId"),
      slug: str(formData, "slug"),
      name: str(formData, "name"),
      category: str(formData, "category"),
      description: str(formData, "description"),
      type: (optStr(formData, "type") as ItemType | null) ?? null,
      costGp: optNum(formData, "costGp"),
      weightLb: optNum(formData, "weightLb"),
      damageFormula: optStr(formData, "damageFormula"),
      damageType: optStr(formData, "damageType"),
      properties: list(formData, "properties"),
      rangeNormal: optNum(formData, "rangeNormal"),
      rangeLong: optNum(formData, "rangeLong"),
      armorCategory: (optStr(formData, "armorCategory") as ArmorCategory | null) ?? null,
      armorClass: optNum(formData, "armorClass"),
      shieldBonus: optNum(formData, "shieldBonus"),
      dexterityBonusMax: optNum(formData, "dexterityBonusMax"),
      strengthRequirement: optNum(formData, "strengthRequirement"),
      stealthDisadvantage: formData.get("stealthDisadvantage") === "on",
      masteryPropertyId: optStr(formData, "masteryPropertyId"),
    });
  }

  async function update(id: string, formData: FormData) {
    "use server";
    await updateAdminItem(id, {
      sourceBookId: str(formData, "sourceBookId"),
      name: str(formData, "name"),
      category: str(formData, "category"),
      description: str(formData, "description"),
      type: (optStr(formData, "type") as ItemType | null) ?? null,
      costGp: optNum(formData, "costGp"),
      weightLb: optNum(formData, "weightLb"),
      damageFormula: optStr(formData, "damageFormula"),
      damageType: optStr(formData, "damageType"),
      properties: list(formData, "properties"),
      rangeNormal: optNum(formData, "rangeNormal"),
      rangeLong: optNum(formData, "rangeLong"),
      armorCategory: (optStr(formData, "armorCategory") as ArmorCategory | null) ?? null,
      armorClass: optNum(formData, "armorClass"),
      shieldBonus: optNum(formData, "shieldBonus"),
      dexterityBonusMax: optNum(formData, "dexterityBonusMax"),
      strengthRequirement: optNum(formData, "strengthRequirement"),
      stealthDisadvantage: formData.get("stealthDisadvantage") === "on",
      masteryPropertyId: optStr(formData, "masteryPropertyId"),
    });
  }

  const itemTypes: ItemType[] = ["WEAPON", "ARMOR", "SHIELD", "TOOL", "GEAR", "CONSUMABLE"];
  const armorCategories: ArmorCategory[] = ["NONE", "LIGHT", "MEDIUM", "HEAVY", "SHIELD"];

  const fields: CrudField[] = [
    { name: "name", label: "Nom", type: "text", required: true },
    { name: "slug", label: "Slug", type: "text", required: true, hideOnEdit: true },
    { name: "category", label: "Catégorie", type: "text", required: true },
    { name: "type", label: "Type", type: "select", options: itemTypes.map((type) => ({ value: type, label: type })) },
    { name: "costGp", label: "Coût (po)", type: "number", step: "0.01" },
    { name: "weightLb", label: "Poids (lb)", type: "number", step: "0.1" },
    { name: "damageFormula", label: "Formule de dégâts", type: "text" },
    { name: "damageType", label: "Type de dégâts", type: "text" },
    { name: "properties", label: "Propriétés (séparées par virgule)", type: "text" },
    { name: "rangeNormal", label: "Portée normale", type: "number" },
    { name: "rangeLong", label: "Portée longue", type: "number" },
    { name: "armorCategory", label: "Catégorie d'armure", type: "select", options: armorCategories.map((category) => ({ value: category, label: category })) },
    { name: "armorClass", label: "Classe d'armure", type: "number" },
    { name: "shieldBonus", label: "Bonus de bouclier", type: "number" },
    { name: "dexterityBonusMax", label: "Bonus de Dex max", type: "number" },
    { name: "strengthRequirement", label: "Force requise", type: "number" },
    { name: "stealthDisadvantage", label: "Désavantage discrétion", type: "checkbox" },
    { name: "masteryPropertyId", label: "Maîtrise d'arme", type: "select", options: masteries.map((mastery) => ({ value: mastery.id, label: mastery.name })) },
    { name: "description", label: "Description", type: "textarea", required: true },
    { name: "sourceBookId", label: "Source", type: "select", required: true, options: sourceBooks.map((book) => ({ value: book.id, label: book.code })) },
  ];

  return (
    <CompendiumCrudTable
      title="Équipement"
      rows={items.map((item) => ({
        id: item.id,
        name: item.name,
        type: item.type ?? item.category,
        cost: item.costGp ?? "-",
        weight: item.weightLb ?? "-",
        mastery: item.masteryProperty?.name ?? "-",
        slug: item.slug,
        category: item.category,
        description: item.description,
        costGp: item.costGp,
        weightLb: item.weightLb,
        damageFormula: item.damageFormula,
        damageType: item.damageType,
        properties: item.properties,
        rangeNormal: item.rangeNormal,
        rangeLong: item.rangeLong,
        armorCategory: item.armorCategory,
        armorClass: item.armorClass,
        shieldBonus: item.shieldBonus,
        dexterityBonusMax: item.dexterityBonusMax,
        strengthRequirement: item.strengthRequirement,
        stealthDisadvantage: item.stealthDisadvantage,
        masteryPropertyId: item.masteryPropertyId ?? "",
        sourceBookId: item.sourceBookId ?? "",
      }))}
      columns={["name", "type", "cost", "weight", "mastery"]}
      filters={[{ field: "type", label: "Type" }, { field: "category", label: "Catégorie" }]}
      fields={fields}
      onCreate={create}
      onUpdate={update}
      onDelete={remove}
    />
  );
}


import { CompendiumCrudTable, type CrudField } from "@/components/admin/CompendiumCrudTable";
import { createAdminSpell, deleteAdminCompendiumRecord, getAdminCompendiumData, updateAdminSpell } from "@/modules/users/server/admin-compendium-service";

const str = (formData: FormData, key: string) => String(formData.get(key) ?? "").trim();
const optStr = (formData: FormData, key: string) => str(formData, key) || null;
const list = (formData: FormData, key: string) => str(formData, key).split(",").map((entry) => entry.trim()).filter(Boolean);

export default async function AdminSpellsPage() {
  const { spells, sourceBooks } = await getAdminCompendiumData();

  async function remove(id: string) {
    "use server";
    await deleteAdminCompendiumRecord("spell", id);
  }

  async function create(formData: FormData) {
    "use server";
    await createAdminSpell({
      sourceBookId: str(formData, "sourceBookId"),
      slug: str(formData, "slug"),
      name: str(formData, "name"),
      level: Number(formData.get("level")),
      school: str(formData, "school"),
      castingTime: str(formData, "castingTime"),
      range: str(formData, "range"),
      components: list(formData, "components"),
      duration: str(formData, "duration"),
      description: str(formData, "description"),
      materials: optStr(formData, "materials"),
      higherLevels: optStr(formData, "higherLevels"),
      concentration: formData.get("concentration") === "on",
      ritual: formData.get("ritual") === "on",
      classes: list(formData, "classes"),
    });
  }

  async function update(id: string, formData: FormData) {
    "use server";
    await updateAdminSpell(id, {
      sourceBookId: str(formData, "sourceBookId"),
      name: str(formData, "name"),
      level: Number(formData.get("level")),
      school: str(formData, "school"),
      castingTime: str(formData, "castingTime"),
      range: str(formData, "range"),
      components: list(formData, "components"),
      duration: str(formData, "duration"),
      description: str(formData, "description"),
      materials: optStr(formData, "materials"),
      higherLevels: optStr(formData, "higherLevels"),
      concentration: formData.get("concentration") === "on",
      ritual: formData.get("ritual") === "on",
      classes: list(formData, "classes"),
    });
  }

  const fields: CrudField[] = [
    { name: "name", label: "Nom", type: "text", required: true },
    { name: "slug", label: "Slug", type: "text", required: true, hideOnEdit: true },
    { name: "level", label: "Niveau", type: "number", required: true },
    { name: "school", label: "École", type: "text", required: true },
    { name: "castingTime", label: "Temps d'incantation", type: "text", required: true },
    { name: "range", label: "Portée", type: "text", required: true },
    { name: "duration", label: "Durée", type: "text", required: true },
    { name: "components", label: "Composantes (ex: V, S, M)", type: "text" },
    { name: "materials", label: "Matériaux", type: "text" },
    { name: "classes", label: "Classes (séparées par virgule)", type: "text" },
    { name: "concentration", label: "Concentration", type: "checkbox" },
    { name: "ritual", label: "Rituel", type: "checkbox" },
    { name: "higherLevels", label: "Aux niveaux supérieurs", type: "textarea" },
    { name: "description", label: "Description", type: "textarea", required: true },
    { name: "sourceBookId", label: "Source", type: "select", required: true, options: sourceBooks.map((book) => ({ value: book.id, label: book.code })) },
  ];

  return (
    <CompendiumCrudTable
      title="Sorts"
      rows={spells.map((spell) => ({
        id: spell.id,
        name: spell.name,
        level: spell.level,
        school: spell.school,
        description: spell.description,
        source: spell.sourceBook?.code ?? "-",
        slug: spell.slug,
        castingTime: spell.castingTime,
        range: spell.range,
        duration: spell.duration,
        components: spell.components,
        materials: spell.materials,
        classes: spell.classes,
        concentration: spell.concentration,
        ritual: spell.ritual,
        higherLevels: spell.higherLevels,
        sourceBookId: spell.sourceBookId ?? "",
      }))}
      columns={["name", "level", "school", "description", "source"]}
      filters={[{ field: "school", label: "École" }, { field: "level", label: "Niveau" }]}
      fields={fields}
      onCreate={create}
      onUpdate={update}
      onDelete={remove}
    />
  );
}


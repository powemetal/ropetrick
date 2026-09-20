import { CompendiumCrudTable, type CrudField } from "@/components/admin/CompendiumCrudTable";
import { createAdminFeat, deleteAdminCompendiumRecord, getAdminCompendiumData, updateAdminFeat } from "@/modules/users/server/admin-compendium-service";

const str = (formData: FormData, key: string) => String(formData.get(key) ?? "").trim();
const optStr = (formData: FormData, key: string) => str(formData, key) || null;
const optNum = (formData: FormData, key: string) => { const raw = str(formData, key); return raw ? Number(raw) : null; };

export default async function AdminFeatsPage() {
  const { feats, sourceBooks } = await getAdminCompendiumData();

  async function remove(id: string) {
    "use server";
    await deleteAdminCompendiumRecord("feat", id);
  }

  async function create(formData: FormData) {
    "use server";
    await createAdminFeat({
      sourceBookId: str(formData, "sourceBookId"),
      slug: str(formData, "slug"),
      name: str(formData, "name"),
      category: str(formData, "category"),
      prerequisite: optStr(formData, "prerequisite"),
      levelRequirement: optNum(formData, "levelRequirement"),
      description: str(formData, "description"),
    });
  }

  async function update(id: string, formData: FormData) {
    "use server";
    await updateAdminFeat(id, {
      sourceBookId: str(formData, "sourceBookId"),
      name: str(formData, "name"),
      category: str(formData, "category"),
      prerequisite: optStr(formData, "prerequisite"),
      levelRequirement: optNum(formData, "levelRequirement"),
      description: str(formData, "description"),
    });
  }

  const fields: CrudField[] = [
    { name: "name", label: "Nom", type: "text", required: true },
    { name: "slug", label: "Slug", type: "text", required: true, hideOnEdit: true },
    { name: "category", label: "Catégorie", type: "text", required: true },
    { name: "prerequisite", label: "Prérequis", type: "text" },
    { name: "levelRequirement", label: "Niveau requis", type: "number" },
    { name: "description", label: "Description", type: "textarea", required: true },
    { name: "sourceBookId", label: "Source", type: "select", required: true, options: sourceBooks.map((book) => ({ value: book.id, label: book.code })) },
  ];

  return (
    <CompendiumCrudTable
      title="Dons"
      rows={feats.map((feat) => ({
        id: feat.id,
        name: feat.name,
        category: feat.category,
        level: feat.levelRequirement ?? "-",
        prerequisite: feat.prerequisite ?? "-",
        description: feat.description,
        slug: feat.slug,
        levelRequirement: feat.levelRequirement,
        sourceBookId: feat.sourceBookId ?? "",
      }))}
      columns={["name", "category", "level", "prerequisite", "description"]}
      filters={[{ field: "category", label: "Catégorie" }]}
      fields={fields}
      onCreate={create}
      onUpdate={update}
      onDelete={remove}
    />
  );
}


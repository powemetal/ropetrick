import { CompendiumCrudTable, type CrudField } from "@/components/admin/CompendiumCrudTable";
import { createAdminClassFeature, deleteAdminCompendiumRecord, getAdminCompendiumData, updateAdminClassFeature } from "@/modules/users/server/admin-compendium-service";

const value = (formData: FormData, key: string) => String(formData.get(key) ?? "");

export default async function AdminClassFeaturesPage() {
  const { classFeatures, classes, subclasses, sourceBooks } = await getAdminCompendiumData();

  async function remove(id: string) {
    "use server";
    await deleteAdminCompendiumRecord("classFeature", id);
  }

  async function create(formData: FormData) {
    "use server";
    await createAdminClassFeature({
      sourceBookId: value(formData, "sourceBookId"),
      dndClassId: value(formData, "dndClassId"),
      dndSubclassId: value(formData, "dndSubclassId") || null,
      level: Number(formData.get("level")),
      name: value(formData, "name"),
      description: value(formData, "description"),
    });
  }

  async function update(id: string, formData: FormData) {
    "use server";
    await updateAdminClassFeature(id, {
      dndSubclassId: value(formData, "dndSubclassId") || null,
      level: Number(formData.get("level")),
      name: value(formData, "name"),
      description: value(formData, "description"),
    });
  }

  const fields: CrudField[] = [
    { name: "name", label: "Nom", type: "text", required: true },
    { name: "level", label: "Niveau", type: "number", required: true },
    { name: "dndClassId", label: "Classe", type: "select", required: true, hideOnEdit: true, options: classes.map((item) => ({ value: item.id, label: item.name })) },
    { name: "dndSubclassId", label: "Sous-classe", type: "select", options: subclasses.map((item) => ({ value: item.id, label: item.name })) },
    { name: "sourceBookId", label: "Source", type: "select", required: true, hideOnEdit: true, options: sourceBooks.map((item) => ({ value: item.id, label: item.code })) },
    { name: "description", label: "Description", type: "textarea", required: true },
  ];

  return (
    <CompendiumCrudTable
      title="Aptitudes de classe"
      rows={classFeatures.map((feature) => ({
        id: feature.id,
        name: feature.name,
        level: feature.level,
        class: feature.dndClass.name,
        subclass: feature.dndSubclass?.name ?? "-",
        description: feature.description,
        dndClassId: feature.dndClassId,
        dndSubclassId: feature.dndSubclassId ?? "",
        sourceBookId: feature.sourceBookId ?? "",
      }))}
      columns={["name", "level", "class", "subclass", "description"]}
      filters={[{ field: "class", label: "Classe" }]}
      fields={fields}
      onCreate={create}
      onUpdate={update}
      onDelete={remove}
    />
  );
}


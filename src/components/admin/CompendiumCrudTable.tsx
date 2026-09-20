"use client";

import { Fragment, useMemo, useState, useTransition } from "react";

export type CrudFieldType = "text" | "number" | "textarea" | "select" | "checkbox";

export type CrudField = {
  name: string;
  label: string;
  type: CrudFieldType;
  options?: Array<{ value: string; label: string }>;
  required?: boolean;
  step?: string;
  hideOnEdit?: boolean;
  hideOnCreate?: boolean;
};

export type CrudFilter = {
  field: string;
  label: string;
};

function fieldValue(row: Record<string, unknown>, field: CrudField): string {
  const raw = row[field.name];
  if (raw === null || raw === undefined) return "";
  if (field.type === "checkbox") return raw ? "true" : "";
  if (Array.isArray(raw)) return raw.join(", ");
  return String(raw);
}

function FieldInput({ field, defaultValue }: { field: CrudField; defaultValue: string }) {
  const common = "w-full border border-stone-300 px-3 py-2";
  if (field.type === "select") {
    return (
      <select name={field.name} defaultValue={defaultValue} required={field.required} className={common}>
        {!field.required && <option value="">—</option>}
        {field.options?.map((option) => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
    );
  }
  if (field.type === "textarea") {
    return <textarea name={field.name} defaultValue={defaultValue} required={field.required} rows={3} className={common} />;
  }
  if (field.type === "checkbox") {
    return <input type="checkbox" name={field.name} defaultChecked={defaultValue === "true"} className="h-5 w-5" />;
  }
  return <input type={field.type} step={field.step} name={field.name} defaultValue={defaultValue} required={field.required} className={common} />;
}

function EntityForm({ fields, row, legend, onSubmit, submitLabel }: { fields: CrudField[]; row: Record<string, unknown>; legend: string; onSubmit: (formData: FormData) => void; submitLabel: string }) {
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit(new FormData(event.currentTarget));
      }}
      className="grid gap-3 border border-stone-200 bg-white p-5 md:grid-cols-2"
    >
      <h2 className="text-xl font-semibold md:col-span-2">{legend}</h2>
      {fields.map((field) => (
        <div key={field.name} className={field.type === "textarea" ? "md:col-span-2" : ""}>
          <label className="mb-1 block text-sm font-medium text-stone-700">{field.label}</label>
          <FieldInput field={field} defaultValue={fieldValue(row, field)} />
        </div>
      ))}
      <button className="w-fit bg-amber-700 px-4 py-2 font-semibold text-white md:col-span-2">{submitLabel}</button>
    </form>
  );
}

export function CompendiumCrudTable({
  title,
  rows,
  columns,
  fields,
  filters,
  onCreate,
  onUpdate,
  onDelete,
}: {
  title: string;
  rows: Array<Record<string, unknown>>;
  columns: string[];
  fields: CrudField[];
  filters?: CrudFilter[];
  onCreate: (formData: FormData) => Promise<void>;
  onUpdate: (id: string, formData: FormData) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  const [query, setQuery] = useState("");
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [pending, startTransition] = useTransition();

  const filterOptions = useMemo(() => {
    const map: Record<string, string[]> = {};
    for (const filter of filters ?? []) {
      const values = new Set<string>();
      for (const row of rows) {
        const value = row[filter.field];
        if (value !== null && value !== undefined && value !== "") values.add(String(value));
      }
      map[filter.field] = Array.from(values).sort();
    }
    return map;
  }, [filters, rows]);

  const filtered = rows.filter((row) => {
    const matchesQuery = JSON.stringify(row).toLowerCase().includes(query.toLowerCase());
    const matchesFilters = Object.entries(activeFilters).every(([field, value]) => !value || String(row[field] ?? "") === value);
    return matchesQuery && matchesFilters;
  });

  const createFields = fields.filter((field) => !field.hideOnCreate);
  const editFields = fields.filter((field) => !field.hideOnEdit);

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h1 className="text-3xl font-semibold text-stone-900">{title}</h1>
        <div className="flex flex-wrap items-end gap-3">
          {(filters ?? []).map((filter) => (
            <label key={filter.field} className="text-sm text-stone-600">
              {filter.label}
              <select
                value={activeFilters[filter.field] ?? ""}
                onChange={(event) => setActiveFilters((prev) => ({ ...prev, [filter.field]: event.target.value }))}
                className="ml-2 border border-stone-300 px-2 py-1"
              >
                <option value="">Tous</option>
                {filterOptions[filter.field]?.map((value) => (
                  <option key={value} value={value}>{value}</option>
                ))}
              </select>
            </label>
          ))}
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Rechercher" className="border border-stone-300 px-3 py-2" />
          <button
            type="button"
            onClick={() => {
              setCreating((value) => !value);
              setEditingId(null);
            }}
            className="bg-amber-700 px-4 py-2 font-semibold text-white"
          >
            {creating ? "Annuler" : "Nouveau"}
          </button>
        </div>
      </div>

      {creating && (
        <EntityForm
          fields={createFields}
          row={{}}
          legend="Nouvel élément"
          submitLabel="Créer"
          onSubmit={(formData) => startTransition(() => onCreate(formData).then(() => setCreating(false)))}
        />
      )}

      <div className="overflow-x-auto border border-stone-200 bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-stone-100">
            <tr>
              {columns.map((column) => (
                <th key={column} className="px-4 py-3 font-semibold">{column}</th>
              ))}
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((row) => {
              const id = String(row.id);
              const isEditing = editingId === id;
              return (
                <Fragment key={id}>
                  <tr className="border-t border-stone-200">
                    <td className="px-4 py-3">{String(row.name ?? row.title ?? row.slug ?? row.id)}</td>
                    {columns.slice(1).map((column) => (
                      <td key={column} className="px-4 py-3">{String(row[column] ?? "-")}</td>
                    ))}
                    <td className="space-x-3 px-4 py-3">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingId(isEditing ? null : id);
                          setCreating(false);
                        }}
                        className="text-amber-800"
                      >
                        {isEditing ? "Fermer" : "Modifier"}
                      </button>
                      <button
                        type="button"
                        disabled={pending}
                        onClick={() => {
                          if (window.confirm("Supprimer cette entrée ?")) startTransition(() => onDelete(id));
                        }}
                        className="text-red-700 disabled:opacity-40"
                      >
                        Supprimer
                      </button>
                    </td>
                  </tr>
                  {isEditing && (
                    <tr className="border-t border-stone-200 bg-stone-50">
                      <td colSpan={columns.length + 1} className="px-4 py-4">
                        <EntityForm
                          fields={editFields}
                          row={row}
                          legend="Modifier l'élément"
                          submitLabel="Enregistrer"
                          onSubmit={(formData) => startTransition(() => onUpdate(id, formData).then(() => setEditingId(null)))}
                        />
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

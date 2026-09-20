"use client";

import { useState } from "react";

type FoundryDropzoneProps = {
  action: (formData: FormData) => void | Promise<void>;
};

export function FoundryDropzone({ action }: FoundryDropzoneProps) {
  const [rawJson, setRawJson] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const readFile = async (file: File) => {
    setError(null);
    try {
      const content = await file.text();
      const parsed = JSON.parse(content) as unknown;
      setRawJson(JSON.stringify(parsed));
      setFileName(file.name);
    } catch {
      setRawJson(null);
      setFileName(null);
      setError("Le fichier doit contenir un JSON Foundry valide.");
    }
  };

  return (
    <section className="border border-dashed border-stone-300 bg-stone-50 p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-semibold text-stone-900">Importer depuis Foundry VTT</h2>
          <p className="text-sm text-stone-500">Déposez un export d’acteur JSON v12+.</p>
        </div>
        <label className="inline-flex cursor-pointer items-center justify-center bg-stone-900 px-4 py-2 text-sm font-medium text-white hover:bg-stone-700">
          Choisir un fichier
          <input
            type="file"
            accept=".json,application/json"
            className="sr-only"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void readFile(file);
            }}
          />
        </label>
      </div>
      {error && <p className="mt-4 text-sm text-red-700">{error}</p>}
      {rawJson && (
        <form action={action} className="mt-5 space-y-4">
          <input type="hidden" name="rawJson" value={rawJson} />
          <div className="overflow-auto border border-stone-200 bg-white p-3 text-xs text-stone-600">
            <p className="mb-2 font-medium text-stone-900">Aperçu: {fileName}</p>
            <pre className="max-h-40 whitespace-pre-wrap">{rawJson}</pre>
          </div>
          <button type="submit" className="bg-amber-700 px-4 py-2 text-sm font-medium text-white hover:bg-amber-800">
            Confirmer l’import
          </button>
        </form>
      )}
    </section>
  );
}

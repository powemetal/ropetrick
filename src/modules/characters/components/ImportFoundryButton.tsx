"use client";

import { useRef, useTransition } from "react";
import { importFoundryCharacterAction } from "@/modules/characters/server/foundry-action";

export function ImportFoundryButton() {
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <form ref={formRef} action={importFoundryCharacterAction} className="inline-flex items-center">
      <label
        htmlFor="foundryFile"
        className={`cursor-pointer inline-flex items-center justify-center border border-stone-300 bg-white px-4 py-2.5 text-sm font-medium text-stone-700 transition-colors hover:bg-stone-50 focus:outline-none focus:ring-2 focus:ring-stone-900 focus:ring-offset-2 ${
          isPending ? "opacity-50 cursor-wait" : ""
        }`}
      >
        {isPending ? "Importation en cours..." : "Importer Foundry (.json)"}
      </label>
      <input
        id="foundryFile"
        name="foundryFile"
        type="file"
        accept=".json"
        className="hidden"
        disabled={isPending}
        onChange={(e) => {
          if (e.target.files?.length) {
            startTransition(() => {
              formRef.current?.requestSubmit();
            });
          }
        }}
      />
    </form>
  );
}
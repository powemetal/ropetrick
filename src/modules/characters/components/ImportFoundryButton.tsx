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
        className={`inline-flex items-center justify-center gap-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 px-5 py-2.5 text-sm font-bold text-stone-800 dark:text-stone-100 shadow-md transition-all hover:bg-stone-50 dark:hover:bg-stone-800 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-stone-900 dark:focus:ring-amber-500 focus:ring-offset-2 dark:focus:ring-offset-stone-950 cursor-pointer ${
          isPending ? "opacity-50 cursor-wait pointer-events-none" : ""
        }`}
      >
        {isPending ? (
          <>
            <svg className="animate-spin h-4 w-4 text-amber-600 dark:text-amber-500" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Importation en cours...</span>
          </>
        ) : (
          <>
            <svg className="h-4 w-4 text-stone-500 dark:text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            <span>Importer (Foundry)</span>
          </>
        )}
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
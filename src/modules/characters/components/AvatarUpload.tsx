"use client";

import { useTransition, useRef } from "react";
import { toast } from "sonner";

type AvatarUploadProps = {
  characterId: string;
  avatarUrl?: string | null;
  characterName: string;
  accentSoft: string;
  surfaceBg: string;
  accentColor: string;
  action: (formData: FormData) => Promise<void>;
};

export function AvatarUpload({
  characterId,
  avatarUrl,
  characterName,
  accentSoft,
  surfaceBg,
  accentColor,
  action,
}: AvatarUploadProps) {
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Vérification de taille basique côté client (max 5 Mo)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("L'image ne doit pas dépasser 5 Mo.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    const formData = new FormData();
    formData.append("avatar", file);
    formData.append("characterId", characterId);

    startTransition(async () => {
      try {
        await action(formData);
        toast.success("Avatar mis à jour avec succès !");
      } catch (err) {
        toast.error(
          err instanceof Error
            ? err.message
            : "Impossible de téléverser l'avatar."
        );
      } finally {
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    });
  };

  return (
    <div className="relative group shrink-0">
      <label
        htmlFor={`avatar-upload-${characterId}`}
        className={`cursor-pointer block relative select-none ${
          isPending ? "pointer-events-none cursor-wait" : ""
        }`}
      >
        {avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={avatarUrl}
            alt={characterName}
            className={`h-24 w-24 rounded-2xl object-cover shadow-lg border transition-opacity ${
              isPending ? "opacity-40" : "group-hover:opacity-75"
            }`}
            style={{ borderColor: accentSoft }}
          />
        ) : (
          <div
            className={`flex h-24 w-24 items-center justify-center rounded-2xl text-4xl font-black shadow-lg border transition-opacity ${
              isPending ? "opacity-40" : "group-hover:opacity-75"
            }`}
            style={{
              backgroundColor: surfaceBg,
              color: accentColor,
              borderColor: accentSoft,
            }}
          >
            {characterName.charAt(0).toUpperCase()}
          </div>
        )}

        {/* Overlay Hover ou Spinner de chargement */}
        <div
          className={`absolute inset-0 flex flex-col items-center justify-center rounded-2xl transition-opacity text-white text-xs font-bold ${
            isPending
              ? "bg-black/60 opacity-100"
              : "bg-black/40 opacity-0 group-hover:opacity-100"
          }`}
        >
          {isPending ? (
            <>
              <svg
                className="animate-spin h-5 w-5 text-white mb-1"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <span className="text-[10px]">Envoi...</span>
            </>
          ) : (
            <span>Modifier</span>
          )}
        </div>
      </label>

      <input
        ref={fileInputRef}
        id={`avatar-upload-${characterId}`}
        name="avatar"
        type="file"
        accept="image/*"
        className="hidden"
        disabled={isPending}
        onChange={handleFileChange}
      />
    </div>
  );
}
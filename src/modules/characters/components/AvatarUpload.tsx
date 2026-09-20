"use client";

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
  return (
    <form action={action} className="relative group shrink-0">
      <label htmlFor="avatar-upload" className="cursor-pointer block relative">
        {avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={avatarUrl}
            alt=""
            className="h-24 w-24 rounded-2xl object-cover shadow-lg border transition-opacity group-hover:opacity-75"
            style={{ borderColor: accentSoft }}
          />
        ) : (
          <div
            className="flex h-24 w-24 items-center justify-center rounded-2xl text-4xl font-black shadow-lg border transition-opacity group-hover:opacity-75"
            style={{
              backgroundColor: surfaceBg,
              color: accentColor,
              borderColor: accentSoft,
            }}
          >
            {characterName.charAt(0).toUpperCase()}
          </div>
        )}
        <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity text-white text-xs font-bold">
          Modifier
        </div>
      </label>
      <input
        id="avatar-upload"
        name="avatar"
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.length) {
            e.target.form?.requestSubmit();
          }
        }}
      />
    </form>
  );
}
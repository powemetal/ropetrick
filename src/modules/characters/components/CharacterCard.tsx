import Link from "next/link";
import type { Prisma } from "@prisma/client";

type CharacterCardProps = {
  character: {
    id: string;
    name: string;
    avatarUrl: string | null;
    class: string | null;
    level: number;
    stats: Prisma.JsonValue;
    campaignLinks?: { campaign: { id: string; title: string } }[];
  };
};

const getNumber = (value: Prisma.JsonValue, ...keys: string[]) => {
  let current: Prisma.JsonValue = value;
  for (const key of keys) {
    if (typeof current !== "object" || current === null || Array.isArray(current)) return null;
    current = current[key] ?? null;
  }
  return typeof current === "number" ? current : null;
};

export function CharacterCard({ character }: CharacterCardProps) {
  const hitPoints = getNumber(character.stats, "hitPoints", "current");
  const maxHitPoints = getNumber(character.stats, "hitPoints", "max");
  const armorClass = getNumber(character.stats, "armorClass");

  return (
    <Link href={`/characters/${character.id}`} className="group flex min-h-44 flex-col justify-between border border-stone-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-amber-700 hover:shadow-md">
      <div className="flex items-start gap-4">
        {character.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={character.avatarUrl} alt="" className="h-14 w-14 rounded-full object-cover" />
        ) : (
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-stone-900 text-xl text-amber-200">{character.name.charAt(0).toUpperCase()}</div>
        )}
        <div>
          <h2 className="text-xl font-semibold text-stone-900 group-hover:text-amber-800">{character.name}</h2>
          <p className="text-sm text-stone-500">
            {character.class ?? "Classe non définie"} · Niveau {character.level}
          </p>
        </div>
      </div>
      <dl className="mt-6 grid grid-cols-2 gap-3 text-sm">
        <div>
          <dt className="text-stone-500">PV</dt>
          <dd className="font-medium text-stone-900">
            {hitPoints ?? "-"}
            {maxHitPoints !== null ? ` / ${maxHitPoints}` : ""}
          </dd>
        </div>
        <div>
          <dt className="text-stone-500">CA</dt>
          <dd className="font-medium text-stone-900">{armorClass ?? "-"}</dd>
        </div>
      </dl>
      {character.campaignLinks && character.campaignLinks.length > 0 && <p className="mt-4 text-xs text-stone-500">Campagnes: {character.campaignLinks.map((link) => link.campaign.title).join(", ")}</p>}
    </Link>
  );
}

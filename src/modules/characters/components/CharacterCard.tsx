import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { getAvatarSignedUrl } from "@/lib/storage";

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

function ClassEmblemSvg({ className }: { className: string | null }) {
  const c = className?.toLowerCase() ?? "";

  if (c.includes("barbarian") || c.includes("barbare")) {
    return (
      <svg className="h-5 w-5 text-red-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.5 4h3L19 7M9.5 4h-3L5 7m4.5-3v16m5-16v16M5 11l4 2m5-2l4 2" />
      </svg>
    );
  }
  if (c.includes("bard") || c.includes("barde")) {
    return (
      <svg className="h-5 w-5 text-pink-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
      </svg>
    );
  }
  if (c.includes("cleric") || c.includes("clerc")) {
    return (
      <svg className="h-5 w-5 text-emerald-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v18m-9-9h18m-15-6l12 12m0-12L3 21" />
      </svg>
    );
  }
  if (c.includes("druid") || c.includes("druide")) {
    return (
      <svg className="h-5 w-5 text-green-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v8m-3-5l3-3 3 3" />
      </svg>
    );
  }
  if (c.includes("fighter") || c.includes("guerrier")) {
    return (
      <svg className="h-5 w-5 text-amber-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.5 17.5L3 6V3h3l11.5 11.5m-3 3l2.5 2.5L21 21l-1-2.5-2.5-2.5m-3 3l3-3M6.5 9.5l5 5" />
      </svg>
    );
  }
  if (c.includes("monk") || c.includes("moine")) {
    return (
      <svg className="h-5 w-5 text-orange-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
      </svg>
    );
  }
  if (c.includes("paladin")) {
    return (
      <svg className="h-5 w-5 text-yellow-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    );
  }
  if (c.includes("ranger") || c.includes("rôdeur") || c.includes("rodeur")) {
    return (
      <svg className="h-5 w-5 text-lime-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
      </svg>
    );
  }
  if (c.includes("rogue") || c.includes("roublard") || c.includes("voleur")) {
    return (
      <svg className="h-5 w-5 text-purple-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 3l-6 6m0 0l-4 4m4-4L9 15l-6 6h6l6-6m-3-6l3-3" />
      </svg>
    );
  }
  if (c.includes("sorcerer") || c.includes("ensorceleur")) {
    return (
      <svg className="h-5 w-5 text-rose-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    );
  }
  if (c.includes("warlock") || c.includes("occultiste")) {
    return (
      <svg className="h-5 w-5 text-violet-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      </svg>
    );
  }
  if (c.includes("wizard") || c.includes("magicien")) {
    return (
      <svg className="h-5 w-5 text-blue-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.5 9h5m-5 3h3" />
      </svg>
    );
  }
  if (c.includes("artificer") || c.includes("artificier")) {
    return (
      <svg className="h-5 w-5 text-cyan-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    );
  }

  return (
    <svg className="h-5 w-5 text-stone-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 2l9 5v10l-9 5-9-5V7l9-5z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 2v10m9 5l-9-3m-9 3l9-3" />
    </svg>
  );
}

function getClassTheme(className: string | null) {
  const c = className?.toLowerCase() ?? "";
  if (c.includes("wizard") || c.includes("magicien")) {
    return {
      cardBg: "bg-gradient-to-br from-blue-950 via-slate-900 to-indigo-950 text-blue-100",
      border: "border-blue-500/60 shadow-blue-950/60 hover:border-blue-400",
      badge: "bg-blue-600 text-white font-semibold",
      glow: "group-hover:shadow-[0_0_25px_rgba(59,130,246,0.3)]",
    };
  }
  if (c.includes("sorcerer") || c.includes("ensorceleur")) {
    return {
      cardBg: "bg-gradient-to-br from-rose-950 via-slate-900 to-pink-950 text-rose-100",
      border: "border-rose-500/60 shadow-rose-950/60 hover:border-rose-400",
      badge: "bg-rose-600 text-white font-semibold",
      glow: "group-hover:shadow-[0_0_25px_rgba(244,63,94,0.3)]",
    };
  }
  if (c.includes("barbarian") || c.includes("barbare")) {
    return {
      cardBg: "bg-gradient-to-br from-red-950 via-stone-950 to-orange-950 text-red-100",
      border: "border-red-500/60 shadow-red-950/60 hover:border-red-400",
      badge: "bg-red-600 text-white font-semibold",
      glow: "group-hover:shadow-[0_0_25px_rgba(239,68,68,0.3)]",
    };
  }
  if (c.includes("fighter") || c.includes("guerrier")) {
    return {
      cardBg: "bg-gradient-to-br from-amber-950 via-stone-950 to-yellow-950 text-amber-100",
      border: "border-amber-500/60 shadow-amber-950/60 hover:border-amber-400",
      badge: "bg-amber-600 text-white font-semibold",
      glow: "group-hover:shadow-[0_0_25px_rgba(245,158,11,0.3)]",
    };
  }
  if (c.includes("cleric") || c.includes("clerc")) {
    return {
      cardBg: "bg-gradient-to-br from-emerald-950 via-slate-950 to-teal-950 text-emerald-100",
      border: "border-emerald-500/60 shadow-emerald-950/60 hover:border-emerald-400",
      badge: "bg-emerald-600 text-white font-semibold",
      glow: "group-hover:shadow-[0_0_25px_rgba(16,185,129,0.3)]",
    };
  }
  if (c.includes("rogue") || c.includes("roublard") || c.includes("voleur")) {
    return {
      cardBg: "bg-gradient-to-br from-purple-950 via-slate-950 to-fuchsia-950 text-purple-100",
      border: "border-purple-500/60 shadow-purple-950/60 hover:border-purple-400",
      badge: "bg-purple-600 text-white font-semibold",
      glow: "group-hover:shadow-[0_0_25px_rgba(168,85,247,0.3)]",
    };
  }
  return {
    cardBg: "bg-gradient-to-br from-stone-900 via-stone-950 to-zinc-900 text-stone-100",
    border: "border-stone-700 shadow-stone-950/60 hover:border-stone-500",
    badge: "bg-stone-700 text-stone-200 font-semibold",
    glow: "group-hover:shadow-[0_0_25px_rgba(120,113,108,0.3)]",
  };
}

export async function CharacterCard({ character }: CharacterCardProps) {
  const hitPoints = getNumber(character.stats, "hitPoints", "current");
  const maxHitPoints = getNumber(character.stats, "hitPoints", "max");
  const armorClass = getNumber(character.stats, "armorClass");
  
  // Génération de l'URL signée asynchrone pour la carte
  const avatarSignedUrl = await getAvatarSignedUrl(character.avatarUrl);

  const theme = getClassTheme(character.class);
  const activeCampaign = character.campaignLinks?.[0]?.campaign;

  return (
    <Link 
      href={`/characters/${character.id}`} 
      className={`group relative flex min-h-52 flex-col justify-between rounded-2xl border-2 ${theme.border} ${theme.cardBg} p-6 shadow-xl transition-all duration-300 hover:-translate-y-1.5 ${theme.glow}`}
    >
      <div>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3.5 min-w-0 flex-1">
            <div className="relative shrink-0">
              {avatarSignedUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={avatarSignedUrl} alt="" className="h-16 w-16 rounded-2xl object-cover border-2 border-white/20 shadow-lg" />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-stone-800 text-2xl font-black text-amber-400 border-2 border-white/20 shadow-lg">
                  {character.name.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="absolute -bottom-2 -right-2 flex h-8 w-8 items-center justify-center rounded-xl bg-stone-900/90 border border-white/30 shadow-md backdrop-blur-sm">
                <ClassEmblemSvg className={character.class} />
              </div>
            </div>

            <div className="min-w-0 flex-1">
              <h2 className="truncate text-xl font-black tracking-wide text-white group-hover:text-amber-300 transition-colors" title={character.name}>
                {character.name}
              </h2>
              <p className="truncate text-sm font-medium text-stone-300" title={character.class ?? "Aventurier"}>
                {character.class ?? "Aventurier"}
              </p>
            </div>
          </div>

          <span className={`shrink-0 inline-flex items-center px-3 py-1 text-xs uppercase tracking-wider rounded-xl shadow-md ${theme.badge}`}>
            Niv. {character.level}
          </span>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3 border-t border-white/10 pt-4 text-sm">
          <div className="rounded-xl bg-black/30 p-2.5 border border-white/10 text-center backdrop-blur-sm">
            <span className="block text-[10px] uppercase tracking-wider text-stone-400 font-bold">Points de vie</span>
            <span className="text-base font-extrabold text-white">
              {hitPoints ?? "-"} {maxHitPoints !== null ? <span className="text-xs text-stone-400 font-normal">/ {maxHitPoints}</span> : ""}
            </span>
          </div>
          <div className="rounded-xl bg-black/30 p-2.5 border border-white/10 text-center backdrop-blur-sm">
            <span className="block text-[10px] uppercase tracking-wider text-stone-400 font-bold">Classe d'armure</span>
            <span className="text-base font-extrabold text-white">{armorClass ?? "-"}</span>
          </div>
        </div>
      </div>

      <div className="mt-5 border-t border-white/10 pt-3 text-xs">
        {activeCampaign ? (
          <div className="flex items-center gap-2 text-stone-300">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-amber-400 animate-pulse shadow-[0_0_8px_#f59e0b] shrink-0"></span>
            <span className="truncate">
              Campagne : <strong className="font-semibold text-white">{activeCampaign.title}</strong>
            </span>
          </div>
        ) : (
          <span className="text-stone-400 italic">Libre de toute campagne</span>
        )}
      </div>
    </Link>
  );
}
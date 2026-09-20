import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getCharactersByUser } from "@/modules/characters/server/character-service";
import { getCampaignsByUser } from "@/modules/campaigns/server/campaign-service";
import { getCampaignSchedule } from "@/modules/scheduling/server/scheduling-service";
import {
  DashboardCalendar,
  type CalendarEventItem,
} from "./components/DashboardCalendar";

// Palette franche et contrastée (visible sur parchemin ET sur thème sombre)
const CAMPAIGN_PALETTE = [
  "#dc2626", // Rouge vif
  "#2563eb", // Bleu royal
  "#16a34a", // Vert forêt
  "#d97706", // Ambre / Bronze
  "#7c3aed", // Violet
  "#db2777", // Rose framboise
  "#0891b2", // Cyan profond
  "#ea580c", // Orange
];

const getCampaignColor = (campaignId: string, customColor?: string | null) => {
  if (customColor && customColor.startsWith("#")) {
    return customColor;
  }
  let hash = 0;
  for (let i = 0; i < campaignId.length; i++) {
    hash = campaignId.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % CAMPAIGN_PALETTE.length;
  return CAMPAIGN_PALETTE[index];
};

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const [characters, campaigns] = await Promise.all([
    getCharactersByUser(userId),
    getCampaignsByUser(userId),
  ]);

  // Attribution d'une couleur nette par campagne
  const campaignColorMap = new Map<string, string>();
  campaigns.forEach((c: any) => {
    campaignColorMap.set(c.id, getCampaignColor(c.id, c.color ?? c.themeKey));
  });

  // Récupération des sessions avec transmission explicite du statut
  const schedules: CalendarEventItem[] = (
    await Promise.all(
      campaigns.map(async (campaign: any) => {
        const games = await getCampaignSchedule(campaign.id, userId);
        return (games ?? []).map((game: any) => ({
          id: game.id,
          title: game.title,
          dateTime: new Date(game.dateTime).toISOString(),
          status: game.status, // <--- TRANSmet LE STATUT ICI (indispensable pour les sessions annulées)
          campaignId: campaign.id,
          campaignTitle: campaign.title,
          campaignColor: campaignColorMap.get(campaign.id) ?? "#2563eb",
        }));
      }),
    )
  ).flat();

  return (
    <main
      className="mx-auto min-h-screen max-w-7xl space-y-10 px-6 py-12"
      style={{
        color: "var(--dnd-ink)",
        backgroundColor: "var(--dnd-background)",
      }}
    >
      {/* En-tête */}
      <header
        className="rounded-2xl border p-6 shadow-sm backdrop-blur-sm"
        style={{
          borderColor: "var(--dnd-accent-soft)",
          background: "var(--dnd-surface)",
        }}
      >
        <p
          className="text-xs font-bold uppercase tracking-[0.24em]"
          style={{ color: "var(--dnd-accent)" }}
        >
          Tableau de bord
        </p>
        <h1
          className="mt-2 text-3xl font-black"
          style={{ color: "var(--dnd-ink)" }}
        >
          Votre espace de jeu
        </h1>
        <p
          className="mt-2 max-w-2xl text-xs font-medium"
          style={{ color: "var(--dnd-muted)" }}
        >
          Retrouvez vos personnages, vos campagnes actives et votre calendrier d'aventures synchronisé.
        </p>
      </header>

      {/* Mes personnages */}
      <section>
        <h2
          className="text-xl font-bold"
          style={{ color: "var(--dnd-ink)" }}
        >
          Mes personnages
        </h2>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {characters.length === 0 ? (
            <p
              className="text-sm italic"
              style={{ color: "var(--dnd-muted)" }}
            >
              Aucun personnage créé.
            </p>
          ) : (
            characters.map((character: any) => (
              <Link
                key={character.id}
                href={`/characters/${character.id}`}
                className="group rounded-xl border p-5 transition-all hover:scale-[1.01]"
                style={{
                  borderColor: "var(--dnd-accent-soft)",
                  background: "var(--dnd-surface)",
                }}
              >
                <h3
                  className="font-bold transition-colors group-hover:opacity-80"
                  style={{ color: "var(--dnd-ink)" }}
                >
                  {character.name}
                </h3>
                <p
                  className="mt-1 text-xs"
                  style={{ color: "var(--dnd-muted)" }}
                >
                  Niveau {character.level} · {character.className ?? character.class ?? "Classe non assignée"}
                </p>
              </Link>
            ))
          )}
        </div>
      </section>

      {/* Mes campagnes avec bande de couleur */}
      <section>
        <h2
          className="text-xl font-bold"
          style={{ color: "var(--dnd-ink)" }}
        >
          Mes campagnes
        </h2>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {campaigns.length === 0 ? (
            <p
              className="text-sm italic"
              style={{ color: "var(--dnd-muted)" }}
            >
              Aucune campagne créée ou rejointe.
            </p>
          ) : (
            campaigns.map((campaign: any) => {
              const campColor = campaignColorMap.get(campaign.id) ?? "#2563eb";

              return (
                <Link
                  key={campaign.id}
                  href={`/campaigns/${campaign.id}`}
                  className="group relative overflow-hidden rounded-xl border p-5 transition-all hover:scale-[1.01]"
                  style={{
                    borderColor: "var(--dnd-accent-soft)",
                    background: "var(--dnd-surface)",
                  }}
                >
                  <div
                    className="absolute left-0 top-0 bottom-0 w-2"
                    style={{ backgroundColor: campColor }}
                  />
                  <div className="flex items-center gap-2 pl-1">
                    <span
                      className="h-3 w-3 shrink-0 rounded-full shadow-xs"
                      style={{ backgroundColor: campColor }}
                    />
                    <h3
                      className="font-bold transition-colors group-hover:opacity-80"
                      style={{ color: "var(--dnd-ink)" }}
                    >
                      {campaign.title}
                    </h3>
                  </div>
                  <p
                    className="mt-2 text-xs pl-1"
                    style={{ color: "var(--dnd-muted)" }}
                  >
                    {campaign._count?.members ?? 0} membres · {campaign._count?.characters ?? 0} personnages
                  </p>
                </Link>
              );
            })
          )}
        </div>
      </section>

      {/* Calendrier synchronisé */}
      <DashboardCalendar events={schedules} />
    </main>
  );
}
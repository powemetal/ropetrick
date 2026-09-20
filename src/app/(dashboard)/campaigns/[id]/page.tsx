import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";
import { CampaignRoster } from "@/modules/campaigns/components/CampaignRoster";
import { getCampaignDetails } from "@/modules/campaigns/server/campaign-service";

type CampaignDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function CampaignDetailPage({ params }: CampaignDetailPageProps) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const { id } = await params;

  let campaign;
  try {
    campaign = await getCampaignDetails(id, userId);
  } catch {
    notFound();
  }

  return (
    <main className="mx-auto min-h-screen max-w-6xl space-y-10 px-6 py-12">
      <Link href="/campaigns" className="text-sm font-medium text-amber-700 hover:text-amber-900">
        ← Retour aux campagnes
      </Link>

      <header className="flex flex-col gap-5 border-b border-stone-200 pb-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-amber-700">Table de jeu</p>
          <h1 className="mt-2 text-4xl font-semibold text-stone-900">{campaign.title}</h1>
          <p className="mt-2 max-w-2xl text-stone-600">{campaign.description}</p>
        </div>
        <div className="border border-stone-200 bg-white px-4 py-3">
          <p className="text-xs uppercase tracking-wide text-stone-500">Code d’invitation</p>
          <p className="mt-1 font-mono text-lg font-semibold text-stone-900">{campaign.inviteCode}</p>
        </div>
      </header>

      <CampaignRoster members={campaign.members} characters={campaign.characters} />

      <nav className="flex flex-wrap gap-3 border-y border-stone-200 py-5" aria-label="Outils de campagne">
        <Link href={`/campaigns/${campaign.id}/notes`} className="bg-stone-900 px-4 py-2 text-sm font-medium text-white">
          Notes de campagne
        </Link>
        <Link href={`/campaigns/${campaign.id}/schedule`} className="bg-stone-900 px-4 py-2 text-sm font-medium text-white">
          Calendrier
        </Link>
        <Link href={`/campaigns/${campaign.id}/sessions`} className="bg-stone-900 px-4 py-2 text-sm font-medium text-white">
          Journaux de session
        </Link>
      </nav>

      <section className="border-t border-stone-200 pt-8">
        <h2 className="text-2xl font-semibold text-stone-900">Monde de la campagne</h2>
        <p className="mt-2 text-stone-600">Lieux, PNJ, marchés et objets de votre aventure.</p>
        <Link href={`/campaigns/${campaign.id}/lore`} className="mt-4 inline-flex bg-stone-900 px-4 py-2 text-sm font-medium text-white hover:bg-stone-700">
          Ouvrir le compendium
        </Link>
      </section>
    </main>
  );
}
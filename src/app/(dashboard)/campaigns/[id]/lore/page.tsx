import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";
import { LoreDirectory } from "@/modules/lore/components/LoreDirectory";
import { getLoreDirectory } from "@/modules/lore/server/lore-service";

type CampaignLorePageProps = {
  params: Promise<{ id: string }>;
};

export default async function CampaignLorePage({ params }: CampaignLorePageProps) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");
  const { id } = await params;
  let lore;
  try {
    lore = await getLoreDirectory(id, userId);
  } catch {
    notFound();
  }

  return (
    <main className="mx-auto min-h-screen max-w-6xl space-y-8 px-6 py-12">
      <Link href={`/campaigns/${id}`} className="text-sm font-medium text-amber-700 hover:text-amber-900">
        ← Retour à la campagne
      </Link>
      <header className="border-b border-stone-200 pb-8">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-amber-700">Compendium</p>
        <h1 className="mt-2 text-4xl font-semibold text-stone-900">Lore de la campagne</h1>
        <p className="mt-2 text-stone-600">Explorez les lieux, les figures importantes et les commerces du monde.</p>
      </header>
      <LoreDirectory locations={lore.locations} npcs={lore.npcs} shops={lore.shops} />
    </main>
  );
}

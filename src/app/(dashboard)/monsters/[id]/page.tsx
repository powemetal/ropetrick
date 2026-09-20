import Link from "next/link";
import { notFound } from "next/navigation";
import { MonsterStatBlock } from "@/modules/monsters/components/MonsterStatBlock";
import { getMonster } from "@/modules/monsters/server/monster-service";

export default async function MonsterDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const monster = await getMonster(id);
  if (!monster) notFound();
  return (
    <main className="mx-auto min-h-screen max-w-4xl px-6 py-12">
      <Link href="/monsters" className="text-sm text-[var(--theme-accent)]">
        ← Atelier des monstres
      </Link>
      <div className="mt-8 max-w-2xl">
        <MonsterStatBlock monster={monster} />
      </div>
    </main>
  );
}

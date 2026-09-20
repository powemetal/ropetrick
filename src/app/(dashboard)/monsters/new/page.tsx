import Link from "next/link";
import { redirect } from "next/navigation";
import { MonsterWorkshop } from "@/modules/monsters/components/MonsterWorkshop";
import { createMonster } from "@/modules/monsters/server/monster-service";

async function createMonsterAction(data: Record<string, unknown>) {
  "use server";
  const monster = await createMonster(data);
  redirect(`/monsters/${monster.id}`);
}

export default function NewMonsterPage() {
  return (
    <main className="mx-auto min-h-screen max-w-6xl px-6 py-12">
      <Link href="/monsters" className="text-sm text-[var(--theme-accent)]">
        ← Monstres
      </Link>
      <div className="mt-8">
        <MonsterWorkshop onCreate={createMonsterAction} />
      </div>
    </main>
  );
}

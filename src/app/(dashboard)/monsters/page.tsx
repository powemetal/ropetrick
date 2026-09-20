import Link from "next/link";
import { getMonsters } from "@/modules/monsters/server/monster-service";
import { cloneAndScaleMonster } from "@/modules/monsters/server/monster-service";
import { CloneMonsterButton } from "@/modules/monsters/components/CloneMonsterButton";

export default async function MonstersPage() {
  const monsters = await getMonsters();
  return (
    <main className="mx-auto min-h-screen max-w-6xl space-y-8 px-6 py-12">
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-[var(--theme-accent-soft)] pb-8">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-[var(--theme-accent)]">Atelier du maître</p>
          <h1 className="mt-2 font-[var(--font-heading)] text-4xl">Monstres & boss</h1>
          <p className="mt-2 text-[var(--theme-muted)]">Créez, clonez et calibrez les créatures de vos donjons.</p>
        </div>
        <Link href="/monsters/new" className="rounded bg-[var(--theme-accent)] px-4 py-3 font-semibold text-white">
          Créer un monstre
        </Link>
      </header>
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {monsters.map((monster) => (
          <article key={monster.id} className="border border-[var(--theme-accent-soft)] bg-[var(--theme-surface)] p-5 transition hover:border-[var(--theme-accent)]">
            <Link href={`/monsters/${monster.id}`}>
              <p className="text-xs uppercase tracking-wider text-[var(--theme-accent)]">FP {monster.challengeRating}</p>
              <h2 className="mt-2 font-[var(--font-heading)] text-xl">{monster.name}</h2>
              <p className="mt-2 text-sm text-[var(--theme-muted)]">
                {monster.creatureType} · CA {monster.armorClass} · {monster.hitPoints} PV
              </p>
              {monster.isLegendary && <span className="mt-4 inline-block text-xs font-semibold text-[var(--theme-accent)]">Légendaire</span>}
            </Link>
            <div className="flex gap-2">
              <CloneMonsterButton action={cloneAndScaleMonster.bind(null, monster.id)} direction="up" />
              <CloneMonsterButton action={cloneAndScaleMonster.bind(null, monster.id)} direction="down" />
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}

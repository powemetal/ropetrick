type MonsterStatBlockProps = { monster: { name: string; creatureType: string; challengeRating: string; armorClass: number; hitPoints: number; hitDice: string | null; speed: unknown; traits: unknown; actions: unknown; legendaryResistances: number; legendaryActions: unknown; lairActions: unknown; isLegendary: boolean } };

const list = (value: unknown) => (Array.isArray(value) ? (value as { name: string; description: string }[]) : []);

export function MonsterStatBlock({ monster }: MonsterStatBlockProps) {
  return (
    <article className="border-2 border-amber-800/50 bg-[#fffaf0] p-6 text-stone-900 shadow-xl">
      <header className="border-b-4 border-amber-800/60 pb-3">
        <h2 className="font-[var(--font-heading)] text-3xl font-bold text-amber-950">{monster.name}</h2>
        <p className="italic text-stone-600">
          {monster.creatureType} · FP {monster.challengeRating}
        </p>
      </header>
      <div className="mt-3 border-y border-amber-800/40 py-2 text-sm">
        <p>
          <strong>CA</strong> {monster.armorClass}
        </p>
        <p>
          <strong>PV</strong> {monster.hitPoints} {monster.hitDice ? `(${monster.hitDice})` : ""}
        </p>
        <p>
          <strong>Vitesse</strong> {JSON.stringify(monster.speed)}
        </p>
      </div>
      {list(monster.traits).map((item) => (
        <section key={item.name} className="mt-4">
          <h3 className="font-semibold italic">{item.name}</h3>
          <p className="text-sm leading-6">{item.description}</p>
        </section>
      ))}
      <h3 className="mt-5 border-b border-amber-800/40 pb-1 font-[var(--font-heading)] text-xl font-semibold">Actions</h3>
      {list(monster.actions).map((item) => (
        <section key={item.name} className="mt-3">
          <h4 className="font-semibold italic">{item.name}.</h4>
          <p className="text-sm leading-6">{item.description}</p>
        </section>
      ))}
      {monster.isLegendary && (
        <>
          <h3 className="mt-5 border-b border-amber-800/40 pb-1 font-[var(--font-heading)] text-xl font-semibold">Actions légendaires</h3>
          <p className="mt-2 text-sm">Résistances légendaires: {monster.legendaryResistances}/jour.</p>
          {list(monster.legendaryActions).map((item) => (
            <section key={item.name} className="mt-3">
              <h4 className="font-semibold italic">{item.name}.</h4>
              <p className="text-sm leading-6">{item.description}</p>
            </section>
          ))}
        </>
      )}
      {list(monster.lairActions).length > 0 && (
        <>
          <h3 className="mt-5 border-b border-amber-800/40 pb-1 font-[var(--font-heading)] text-xl font-semibold">Actions de repaire</h3>
          {list(monster.lairActions).map((item) => (
            <section key={item.name} className="mt-3">
              <h4 className="font-semibold italic">Initiative 20 · {item.name}.</h4>
              <p className="text-sm leading-6">{item.description}</p>
            </section>
          ))}
        </>
      )}
    </article>
  );
}

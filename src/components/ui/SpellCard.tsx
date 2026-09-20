import type { ReactNode } from "react";

export type SpellCardData = {
  name: string;
  level: number;
  school: string;
  ritual?: boolean;
  castingTime: string;
  range: string;
  components: unknown;
  duration: string;
  concentration?: boolean;
  description: string;
  higherLevels?: string;
};

export function SpellCard({ spell, children }: { spell: SpellCardData; children?: ReactNode }) {
  const components = Array.isArray(spell.components) ? spell.components.join(", ") : String(spell.components ?? "-");
  return (
    <article className="rounded-lg border p-4 text-left" style={{ borderColor: "var(--dnd-accent-soft)", background: "var(--dnd-surface)", color: "var(--dnd-ink)" }}>
      <header className="border-b pb-3" style={{ borderColor: "var(--dnd-accent-soft)" }}>
        <p className="text-xs font-semibold uppercase tracking-[0.14em]" style={{ color: "var(--dnd-accent)" }}>
          {spell.level === 0 ? "Tour de magie" : `Sort de niveau ${spell.level}`} · {spell.school}
          {spell.ritual ? " · Rituel" : ""}
        </p>
        <h3 className="mt-1 text-xl font-semibold">{spell.name}</h3>
      </header>
      <dl className="grid gap-x-4 gap-y-2 py-3 text-sm sm:grid-cols-2">
        <div>
          <dt className="font-semibold">Temps d&apos;incantation</dt>
          <dd>{spell.castingTime}</dd>
        </div>
        <div>
          <dt className="font-semibold">Portée</dt>
          <dd>{spell.range}</dd>
        </div>
        <div>
          <dt className="font-semibold">Composantes</dt>
          <dd>{components}</dd>
        </div>
        <div>
          <dt className="font-semibold">Durée</dt>
          <dd>
            {spell.duration}
            {spell.concentration ? " · Concentration" : ""}
          </dd>
        </div>
      </dl>
      <p className="text-sm leading-6">{spell.description}</p>
      {spell.higherLevels && (
        <section className="mt-4 border-t pt-3" style={{ borderColor: "var(--dnd-accent-soft)" }}>
          <h4 className="font-semibold">Aux niveaux supérieurs</h4>
          <p className="mt-1 text-sm leading-6">{spell.higherLevels}</p>
        </section>
      )}
      {children}
    </article>
  );
}

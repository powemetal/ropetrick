import Link from "next/link";

const features = [
  {
    number: "01",
    title: "Secrets du MJ",
    description: "Gardez vos intrigues, notes privées et révélations à portée de main, sans jamais les exposer à votre table.",
  },
  {
    number: "02",
    title: "Feuilles de personnage",
    description: "Importez vos personnages Foundry VTT v12+ et retrouvez une fiche claire, vivante et prête pour la prochaine partie.",
  },
  {
    number: "03",
    title: "Planification fluide",
    description: "Coordonnez les disponibilités, les messages et les journaux de session au même endroit.",
  },
];

export default function HomePage() {
  return (
    <main className="overflow-hidden">
      <section className="relative border-b border-zinc-800/80">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_20%,rgba(217,161,53,0.12),transparent_32%),linear-gradient(135deg,#18181b_0%,#09090b_55%,#111827_100%)]" />
        <div className="relative mx-auto grid max-w-7xl gap-14 px-5 py-24 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:px-8 lg:py-32">
          <div>
            <p className="mb-6 text-sm font-semibold uppercase tracking-[0.24em] text-amber-300">Votre table, sans friction</p>
            <h1 className="max-w-3xl text-5xl font-semibold leading-[1.05] tracking-tight text-zinc-50 sm:text-6xl lg:text-7xl">Donnez de la profondeur à chaque aventure.</h1>
            <p className="mt-7 max-w-xl text-lg leading-8 text-zinc-400">Rope Trick rassemble la gestion de vos tables, l&apos;import Foundry VTT v12+ et les journaux de session dans un espace pensé pour les maîtres de jeu et leurs aventuriers.</p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link href="/campaigns" className="rounded-md bg-amber-300 px-5 py-3 text-sm font-semibold text-zinc-950 transition-colors hover:bg-amber-200">
                Accéder à mes campagnes
              </Link>
              <Link href="/characters" className="rounded-md border border-zinc-700 bg-zinc-900/60 px-5 py-3 text-sm font-semibold text-zinc-100 transition-colors hover:border-zinc-500 hover:bg-zinc-800">
                Mes personnages
              </Link>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-md lg:justify-self-end">
            <div className="absolute -inset-5 rounded-3xl border border-amber-300/10 bg-amber-300/[0.03]" />
            <div className="relative rounded-2xl border border-zinc-700/80 bg-zinc-900/90 p-6 shadow-2xl shadow-black/30">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-5">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Prochaine session</p>
                  <p className="mt-2 font-medium text-zinc-100">Les Brumes de Valombre</p>
                </div>
                <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2.5 py-1 text-xs font-medium text-emerald-300">En préparation</span>
              </div>
              <div className="grid grid-cols-2 gap-3 py-5">
                <div className="rounded-lg bg-zinc-800/70 p-4">
                  <p className="text-xs text-zinc-500">Joueurs</p>
                  <p className="mt-2 text-2xl font-semibold text-zinc-100">04 / 05</p>
                </div>
                <div className="rounded-lg bg-zinc-800/70 p-4">
                  <p className="text-xs text-zinc-500">Journal</p>
                  <p className="mt-2 text-2xl font-semibold text-zinc-100">12</p>
                </div>
              </div>
              <div className="rounded-lg border border-zinc-800 p-4">
                <p className="text-xs uppercase tracking-wider text-zinc-500">Dernière note du MJ</p>
                <p className="mt-2 text-sm leading-6 text-zinc-300">La cloche sonnera trois fois avant l&apos;ouverture du sanctuaire.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8 lg:py-24">
        <div className="mb-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-300">Tout pour la campagne</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-100">Un espace qui suit votre imagination.</h2>
          </div>
          <p className="max-w-sm text-sm leading-6 text-zinc-500">Des outils discrets pour que l&apos;histoire reste au centre de la table.</p>
        </div>
        <div className="grid gap-px overflow-hidden rounded-xl border border-zinc-800 bg-zinc-800 md:grid-cols-3">
          {features.map((feature) => (
            <article key={feature.number} className="bg-zinc-950 p-7 transition-colors hover:bg-zinc-900">
              <p className="text-sm font-medium text-amber-300">{feature.number}</p>
              <h3 className="mt-12 text-xl font-semibold text-zinc-100">{feature.title}</h3>
              <p className="mt-4 text-sm leading-7 text-zinc-400">{feature.description}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

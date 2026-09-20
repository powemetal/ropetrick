import Link from "next/link";

type SessionLogCardProps = {
  campaignId: string;
  session: {
    id: string;
    sessionNumber: number;
    title: string;
    playedAt: Date | string;
    summary: string;
    attendees: Array<{ user: { name: string }; character: { name: string } | null }>;
    visitedLocations: Array<{ location: { name: string } }>;
    metNpcs: Array<{ npc: { name: string } }>;
  };
};

export function SessionLogCard({ campaignId, session }: SessionLogCardProps) {
  return (
    <article className="border border-stone-200 bg-white p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-amber-700">Session {session.sessionNumber}</p>
          <h2 className="mt-1 text-xl font-semibold text-stone-900">{session.title}</h2>
          <p className="mt-1 text-sm text-stone-500">{new Date(session.playedAt).toLocaleDateString("fr-FR", { dateStyle: "long" })}</p>
        </div>
        <Link href={`/campaigns/${campaignId}/sessions/${session.id}`} className="text-sm font-medium text-amber-700 hover:text-amber-900">
          Détails →
        </Link>
      </div>
      <p className="mt-4 line-clamp-3 text-sm leading-6 text-stone-600">{session.summary}</p>
      <div className="mt-5 flex flex-wrap gap-2 text-xs text-stone-600">
        <span className="bg-stone-100 px-2 py-1">{session.attendees.length} participant(s)</span>
        {session.visitedLocations.map((entry) => (
          <span key={entry.location.name} className="bg-emerald-50 px-2 py-1 text-emerald-800">
            Lieu · {entry.location.name}
          </span>
        ))}
        {session.metNpcs.map((entry) => (
          <span key={entry.npc.name} className="bg-sky-50 px-2 py-1 text-sky-800">
            PNJ · {entry.npc.name}
          </span>
        ))}
      </div>
    </article>
  );
}

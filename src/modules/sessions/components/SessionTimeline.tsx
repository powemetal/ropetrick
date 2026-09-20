import { SessionLogCard } from "@/modules/sessions/components/SessionLogCard";

type SessionTimelineProps = {
  campaignId: string;
  sessions: React.ComponentProps<typeof SessionLogCard>["session"][];
};

export function SessionTimeline({ campaignId, sessions }: SessionTimelineProps) {
  if (sessions.length === 0) return <p className="border border-stone-200 bg-white p-6 text-stone-600">Aucun compte-rendu de session.</p>;
  return (
    <div className="relative space-y-5 border-l border-stone-200 pl-5">
      {sessions.map((session) => (
        <SessionLogCard key={session.id} campaignId={campaignId} session={session} />
      ))}
    </div>
  );
}

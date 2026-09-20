import { CharacterCard } from "@/modules/characters/components/CharacterCard";

type CampaignRosterProps = {
  members: Array<{ id: string; role: string; user: { id: string; name: string; nickname: string; avatarUrl: string | null } }>;
  characters: Array<{
    id: string;
    character: { id: string; name: string; avatarUrl: string | null; class: string | null; level: number; stats: Parameters<typeof CharacterCard>[0]["character"]["stats"] };
    player: { id: string; name: string; nickname: string };
  }>;
};

export function CampaignRoster({ members, characters }: CampaignRosterProps) {
  return (
    <section className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold text-stone-900">Roster</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {members.map((member) => (
            <div key={member.id} className="flex items-center gap-3 border border-stone-200 bg-white p-4">
              {member.user.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={member.user.avatarUrl} alt="" className="h-10 w-10 rounded-full object-cover" />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-stone-900 text-amber-200">{member.user.name.charAt(0)}</div>
              )}
              <div>
                <p className="font-medium text-stone-900">{member.user.name}</p>
                <p className="text-sm text-stone-500">{member.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div>
        <h2 className="text-2xl font-semibold text-stone-900">Personnages rattachés</h2>
        {characters.length === 0 ? (
          <p className="mt-4 text-sm text-stone-500">Aucun PJ rattaché.</p>
        ) : (
          <div className="mt-4 grid gap-5 md:grid-cols-2">
            {characters.map((entry) => (
              <div key={entry.id}>
                <p className="mb-2 text-sm text-stone-500">Joué par {entry.player.name}</p>
                <CharacterCard character={entry.character} />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

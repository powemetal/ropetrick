import Link from "next/link";

type CampaignCardProps = {
  campaign: {
    id: string;
    title: string;
    description: string;
    inviteCode: string;
    _count: { members: number; characters: number };
  };
};

export function CampaignCard({ campaign }: CampaignCardProps) {
  return (
    <Link href={`/campaigns/${campaign.id}`} className="group block border border-stone-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-amber-700 hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <h2 className="text-xl font-semibold text-stone-900 group-hover:text-amber-800">{campaign.title}</h2>
        <span className="bg-stone-100 px-2 py-1 text-xs font-medium text-stone-600">{campaign.inviteCode}</span>
      </div>
      <p className="mt-3 line-clamp-2 text-sm leading-6 text-stone-600">{campaign.description}</p>
      <p className="mt-5 text-sm text-stone-500">
        {campaign._count.members} membres · {campaign._count.characters} PJ rattachés
      </p>
    </Link>
  );
}

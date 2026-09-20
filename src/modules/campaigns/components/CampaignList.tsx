import { CampaignCard } from "@/modules/campaigns/components/CampaignCard";

type CampaignListProps = {
  campaigns: React.ComponentProps<typeof CampaignCard>["campaign"][];
};

export function CampaignList({ campaigns }: CampaignListProps) {
  if (campaigns.length === 0) {
    return <p className="border border-stone-200 bg-white p-6 text-stone-600">Aucune campagne pour le moment.</p>;
  }

  return (
    <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
      {campaigns.map((campaign) => (
        <CampaignCard key={campaign.id} campaign={campaign} />
      ))}
    </div>
  );
}

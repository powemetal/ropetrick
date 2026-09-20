import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { CampaignList } from "@/modules/campaigns/components/CampaignList";
import { JoinCampaignModal } from "@/modules/campaigns/components/JoinCampaignModal";
import { createCampaign, getCampaignsByUser, joinCampaignByCode } from "@/modules/campaigns/server/campaign-service";
import { getOrCreateCurrentUser, UnauthorizedError } from "@/modules/users/server/user-sync";

const formValue = (formData: FormData, key: string) => {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
};

async function createCampaignAction(formData: FormData) {
  "use server";
  let user;
  try {
    user = await getOrCreateCurrentUser();
  } catch (error) {
    if (error instanceof UnauthorizedError) redirect("/sign-in");
    throw error;
  }
  await createCampaign(user.id, { title: formValue(formData, "title"), description: formValue(formData, "description") });
  revalidatePath("/campaigns");
}

async function joinCampaignAction(formData: FormData) {
  "use server";
  let user;
  try {
    user = await getOrCreateCurrentUser();
  } catch (error) {
    if (error instanceof UnauthorizedError) redirect("/sign-in");
    throw error;
  }
  await joinCampaignByCode(user.id, formValue(formData, "inviteCode"));
  revalidatePath("/campaigns");
}

export default async function CampaignsPage() {
  let user;
  try {
    user = await getOrCreateCurrentUser();
  } catch (error) {
    if (error instanceof UnauthorizedError) redirect("/sign-in");
    throw error;
  }
  const campaigns = await getCampaignsByUser(user.id);

  return (
    <main className="mx-auto min-h-screen max-w-6xl space-y-10 px-6 py-12">
      <header className="flex flex-col gap-5 border-b border-stone-200 pb-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-amber-700">Rope Trick</p>
          <h1 className="mt-2 text-4xl font-semibold text-stone-900">Mes campagnes</h1>
          <p className="mt-2 text-stone-600">Retrouvez vos tables, vos joueurs et vos mondes.</p>
        </div>
        <JoinCampaignModal action={joinCampaignAction} />
      </header>

      <section>
        <CampaignList campaigns={campaigns} />
      </section>

      <section id="create-campaign" className="max-w-xl border-t border-stone-200 pt-8">
        <h2 className="text-2xl font-semibold text-stone-900">Créer une campagne</h2>
        <form action={createCampaignAction} className="mt-5 grid gap-4 border border-stone-200 bg-white p-5">
          <label className="grid gap-1 text-sm text-stone-700">
            Titre
            <input required name="title" className="border border-stone-300 px-3 py-2" />
          </label>
          <label className="grid gap-1 text-sm text-stone-700">
            Description
            <textarea required name="description" rows={4} className="border border-stone-300 px-3 py-2" />
          </label>
          <button type="submit" className="w-fit bg-amber-700 px-4 py-2 text-sm font-medium text-white hover:bg-amber-800">
            Créer la campagne
          </button>
        </form>
      </section>
    </main>
  );
}

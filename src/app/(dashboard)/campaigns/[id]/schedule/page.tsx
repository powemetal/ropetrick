import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCampaignMemberRole } from "@/modules/campaigns/server/campaign-service";
import { ScheduleManager } from "@/modules/scheduling/components/ScheduleManager";
import {
  createScheduleRule,
  generateUpcomingGames,
  getCampaignSchedule,
  updateAttendance,
} from "@/modules/scheduling/server/scheduling-service";

type SchedulePageProps = { params: Promise<{ id: string }> };

const value = (formData: FormData, key: string) => {
  const item = formData.get(key);
  return typeof item === "string" ? item : "";
};

export default async function CampaignSchedulePage({ params }: SchedulePageProps) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const { id } = await params;
  const role = await getCampaignMemberRole(id, userId);
  if (!role) redirect("/campaigns");

  const games = await getCampaignSchedule(id, userId);

  async function attendanceAction(
    previousState: { ok: boolean; message: string },
    formData: FormData
  ) {
    "use server";
    const { userId: currentUserId } = await auth();
    if (!currentUserId) redirect("/sign-in");

    await updateAttendance(
      value(formData, "gameId"),
      currentUserId,
      value(formData, "status") as "ATTENDING" | "NOT_ATTENDING" | "TENTATIVE",
      value(formData, "comment")
    );
    revalidatePath(`/campaigns/${id}/schedule`);
    return { ok: true, message: "Votre présence a été enregistrée." };
  }

  async function createRuleAction(formData: FormData) {
    "use server";
    const { userId: currentUserId } = await auth();
    if (!currentUserId) redirect("/sign-in");

    await createScheduleRule(id, currentUserId, {
      frequency: value(formData, "frequency"),
      dayOfWeek: Number(value(formData, "dayOfWeek")),
      startTime: value(formData, "startTime"),
      durationMinutes: Number(value(formData, "durationMinutes")),
    });
    await generateUpcomingGames(id, currentUserId, 6);
    revalidatePath(`/campaigns/${id}/schedule`);
  }

  return (
    <main className="mx-auto min-h-screen max-w-5xl space-y-8 px-6 py-12">
      <Link href={`/campaigns/${id}`} className="text-sm font-medium text-amber-700 hover:text-amber-900">
        ← Retour à la campagne
      </Link>

      <header className="border-b border-stone-200 pb-8">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-amber-700">Calendrier</p>
        <h1 className="mt-2 text-4xl font-semibold text-stone-900">Prochaines parties</h1>
      </header>

      {/* Le composant qui affiche chaque partie avec le X rouge si annulée */}
      <ScheduleManager games={games} currentUserId={userId} attendanceAction={attendanceAction} />

      {(role === "DM" || role === "CO_DM") && (
        <section className="border-t border-stone-200 pt-8">
          <h2 className="text-2xl font-semibold text-stone-900">Règle de récurrence</h2>
          <form
            action={createRuleAction}
            className="mt-4 grid gap-4 border border-stone-200 bg-white p-5 sm:grid-cols-2"
          >
            <label className="grid gap-1 text-sm text-stone-700">
              Fréquence
              <select name="frequency" defaultValue="WEEKLY" className="border border-stone-300 px-3 py-2">
                <option value="WEEKLY">Chaque semaine</option>
                <option value="BIWEEKLY">Toutes les deux semaines</option>
                <option value="MONTHLY">Mensuelle</option>
              </select>
            </label>

            <label className="grid gap-1 text-sm text-stone-700">
              Jour
              <select name="dayOfWeek" defaultValue="5" className="border border-stone-300 px-3 py-2">
                {["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"].map(
                  (day, index) => (
                    <option key={day} value={index}>
                      {day}
                    </option>
                  )
                )}
              </select>
            </label>

            <label className="grid gap-1 text-sm text-stone-700">
              Heure
              <input
                required
                type="time"
                name="startTime"
                defaultValue="19:00"
                className="border border-stone-300 px-3 py-2"
              />
            </label>

            <label className="grid gap-1 text-sm text-stone-700">
              Durée (minutes)
              <input
                required
                type="number"
                min="1"
                name="durationMinutes"
                defaultValue="180"
                className="border border-stone-300 px-3 py-2"
              />
            </label>

            <button type="submit" className="w-fit bg-amber-700 px-4 py-2 text-sm font-medium text-white hover:bg-amber-800 transition-colors">
              Générer les prochaines dates
            </button>
          </form>
        </section>
      )}
    </main>
  );
}
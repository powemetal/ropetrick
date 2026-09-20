import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { ReportQueueTable } from "@/components/admin/ReportQueueTable";
import type { AdminActionState } from "@/components/admin/ModerationActionDialog";
import { getReports, resolveReport } from "@/modules/users/server/admin-service";
import type { ModerationAction, ReportStatus } from "@/modules/users/server/admin-types";

type ReportsPageProps = { searchParams: Promise<{ status?: string }> };
const validStatuses: ReportStatus[] = ["PENDING", "RESOLVED", "DISMISSED"];

export default async function AdminReportsPage({ searchParams }: ReportsPageProps) {
  const params = await searchParams;
  const status = validStatuses.includes(params.status as ReportStatus) ? (params.status as ReportStatus) : "PENDING";
  const reports = await getReports(status);

  async function moderationAction(previousState: AdminActionState, formData: FormData): Promise<AdminActionState> {
    "use server";
    try {
      const action = formData.get("action");
      const reportId = formData.get("reportId");
      const reason = formData.get("reason");
      if (action !== "DISMISS" && action !== "DELETE_CONTENT" && action !== "SUSPEND_USER") return { ok: false, message: "Action de modération invalide." };
      if (typeof reportId !== "string" || typeof reason !== "string" || !reason.trim()) return { ok: false, message: "Un motif est obligatoire." };
      const { userId } = await auth();
      if (!userId) return { ok: false, message: "Session expirée." };
      await resolveReport(reportId, action as ModerationAction, userId, reason);
      revalidatePath("/admin/reports");
      return { ok: true, message: "Signalement traité. Rechargez la file pour voir le résultat." };
    } catch (error) {
      return { ok: false, message: error instanceof Error ? error.message : "Impossible de traiter le signalement." };
    }
  }

  return (
    <section className="space-y-8 p-6 md:p-10">
      <header className="border-b border-stone-200 pb-6">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-amber-700">Modération</p>
        <h1 className="mt-2 text-3xl font-semibold text-stone-900">File des signalements</h1>
        <p className="mt-2 text-stone-600">Examinez le contenu signalé et tracez chaque décision.</p>
      </header>
      <ReportQueueTable reports={reports} status={status} actionHandler={moderationAction} />
    </section>
  );
}

import { AuditLogViewer } from "@/components/admin/AuditLogViewer";
import { getAdminAuditLogs } from "@/modules/users/server/admin-service";

export default async function AdminAuditPage() {
  const logs = await getAdminAuditLogs(100);
  return (
    <section className="space-y-8 p-6 md:p-10">
      <header className="border-b border-stone-200 pb-6">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-amber-700">Traçabilité</p>
        <h1 className="mt-2 text-3xl font-semibold text-stone-900">Logs d’audit</h1>
        <p className="mt-2 text-stone-600">Historique des actions administratives et des motifs associés.</p>
      </header>
      <AuditLogViewer logs={logs} />
    </section>
  );
}

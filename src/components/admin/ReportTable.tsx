import { ModerationActionDialog, type AdminActionState } from "@/components/admin/ModerationActionDialog";

type Report = { id: string; reason: string; status: string; createdAt: Date; reporter: { name: string; nickname: string }; message: { content: string; isDeleted: boolean; sender: { name: string; nickname: string }; conversation: { title: string | null; isGroup: boolean } } };
type ReportTableProps = { reports: Report[]; actionHandler: (previousState: AdminActionState, formData: FormData) => Promise<AdminActionState> };

export function ReportTable({ reports, actionHandler }: ReportTableProps) {
  if (!reports.length) return <p className="border border-stone-200 bg-white p-6 text-sm text-stone-600">Aucun signalement en attente.</p>;
  return (
    <div className="overflow-x-auto border border-stone-200 bg-white">
      <table className="w-full min-w-[56rem] text-left text-sm">
        <thead className="border-b border-stone-200 bg-stone-50 text-xs uppercase tracking-wide text-stone-500">
          <tr>
            <th className="p-4">Signalement</th>
            <th className="p-4">Message</th>
            <th className="p-4">Contexte</th>
            <th className="p-4">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-stone-100">
          {reports.map((report) => (
            <tr key={report.id} className="align-top">
              <td className="p-4">
                <p className="font-medium text-stone-900">{report.reason}</p>
                <p className="mt-1 text-xs text-stone-500">par {report.reporter.name}</p>
                <p className="mt-1 text-xs text-stone-400">{new Date(report.createdAt).toLocaleString("fr-FR")}</p>
                <span className="mt-2 inline-block bg-amber-100 px-2 py-1 text-xs font-medium text-amber-800">{report.status}</span>
              </td>
              <td className="max-w-sm p-4">
                <p className="text-stone-700">{report.message.isDeleted ? "Message déjà supprimé" : report.message.content}</p>
                <p className="mt-2 text-xs text-stone-500">Auteur: {report.message.sender.name}</p>
              </td>
              <td className="p-4 text-stone-600">{report.message.conversation.title ?? (report.message.conversation.isGroup ? "Groupe" : "Conversation privée")}</td>
              <td className="p-4">
                <div className="flex flex-col items-start divide-y divide-stone-100 border border-stone-200">
                  <ModerationActionDialog reportId={report.id} action="DISMISS" label="Rejeter" actionHandler={actionHandler} />
                  <ModerationActionDialog reportId={report.id} action="DELETE_CONTENT" label="Supprimer le message" actionHandler={actionHandler} />
                  <ModerationActionDialog reportId={report.id} action="SUSPEND_USER" label="Suspendre l’auteur" actionHandler={actionHandler} />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

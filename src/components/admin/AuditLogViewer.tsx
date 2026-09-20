type AuditLog = { id: string; action: string; reason: string; createdAt: Date; admin: { name: string; nickname: string }; targetUser: { name: string; nickname: string } | null; reportId: string | null; messageId: string | null };

export function AuditLogViewer({ logs }: { logs: AuditLog[] }) {
  if (!logs.length) return <p className="border border-stone-200 bg-white p-6 text-sm text-stone-600">Aucune action d’administration enregistrée.</p>;
  return (
    <div className="overflow-x-auto border border-stone-200 bg-white">
      <table className="w-full min-w-[56rem] text-left text-sm">
        <thead className="border-b border-stone-200 bg-stone-50 text-xs uppercase tracking-wide text-stone-500">
          <tr>
            <th className="p-4">Date</th>
            <th className="p-4">Administrateur</th>
            <th className="p-4">Action</th>
            <th className="p-4">Cible</th>
            <th className="p-4">Motif</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-stone-100">
          {logs.map((log) => (
            <tr key={log.id}>
              <td className="p-4 text-xs text-stone-500">{new Date(log.createdAt).toLocaleString("fr-FR")}</td>
              <td className="p-4 font-medium text-stone-900">{log.admin.name}</td>
              <td className="p-4">
                <span className="bg-stone-100 px-2 py-1 text-xs font-medium text-stone-700">{log.action}</span>
              </td>
              <td className="p-4 text-stone-600">{log.targetUser?.name ?? (log.messageId ? "Message" : log.reportId ? "Signalement" : "-")}</td>
              <td className="max-w-sm p-4 text-stone-600">{log.reason}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

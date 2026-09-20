import { UserStatusForm } from "@/components/admin/UserStatusForm";
import type { AdminActionState } from "@/components/admin/ModerationActionDialog";

type ManagedUser = { id: string; email: string; name: string; nickname: string; role: string; status: string; createdAt: Date };
type UserTableProps = { users: ManagedUser[]; currentAdminId: string; actionHandler: (previousState: AdminActionState, formData: FormData) => Promise<AdminActionState> };

export function UserTable({ users, currentAdminId, actionHandler }: UserTableProps) {
  if (!users.length) return <p className="border border-stone-200 bg-white p-6 text-sm text-stone-600">Aucun utilisateur trouvé.</p>;
  return (
    <div className="overflow-x-auto border border-stone-200 bg-white">
      <table className="w-full min-w-[60rem] text-left text-sm">
        <thead className="border-b border-stone-200 bg-stone-50 text-xs uppercase tracking-wide text-stone-500">
          <tr>
            <th className="p-4">Utilisateur</th>
            <th className="p-4">Rôle</th>
            <th className="p-4">Statut</th>
            <th className="p-4">Inscription</th>
            <th className="p-4">Gestion</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-stone-100">
          {users.map((user) => (
            <tr key={user.id} className="align-top">
              <td className="p-4">
                <p className="font-medium text-stone-900">{user.name}</p>
                <p className="text-xs text-stone-500">@{user.nickname}</p>
                <p className="text-xs text-stone-400">{user.email}</p>
              </td>
              <td className="p-4">
                <span className={user.role === "ADMIN" ? "bg-stone-900 px-2 py-1 text-xs text-white" : "bg-stone-100 px-2 py-1 text-xs text-stone-600"}>{user.role}</span>
              </td>
              <td className="p-4">
                <span className={`px-2 py-1 text-xs font-medium ${user.status === "ACTIVE" ? "bg-emerald-100 text-emerald-800" : user.status === "SUSPENDED" ? "bg-amber-100 text-amber-800" : "bg-red-100 text-red-800"}`}>{user.status}</span>
              </td>
              <td className="p-4 text-xs text-stone-500">{new Date(user.createdAt).toLocaleDateString("fr-FR")}</td>
              <td className="p-4">
                <UserStatusForm userId={user.id} currentStatus={user.status} currentAdminId={currentAdminId} actionHandler={actionHandler} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

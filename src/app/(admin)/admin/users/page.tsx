import { auth } from "@clerk/nextjs/server";
import { UserStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { UserTable } from "@/components/admin/UserTable";
import type { AdminActionState } from "@/components/admin/ModerationActionDialog";
import { getUserManagementList, updateUserStatus } from "@/modules/users/server/admin-service";

type UsersPageProps = { searchParams: Promise<{ query?: string; page?: string }> };

export default async function AdminUsersPage({ searchParams }: UsersPageProps) {
  const params = await searchParams;
  const query = params.query ?? "";
  const page = Number(params.page) || 1;
  const { userId } = await auth();
  if (!userId) throw new Error("Session expired");
  const result = await getUserManagementList(query, page);

  async function statusAction(previousState: AdminActionState, formData: FormData): Promise<AdminActionState> {
    "use server";
    try {
      const targetUserId = formData.get("userId");
      const status = formData.get("status");
      const reason = formData.get("reason");
      if (typeof targetUserId !== "string" || typeof status !== "string" || typeof reason !== "string") return { ok: false, message: "Données de statut invalides." };
      if (!Object.values(UserStatus).includes(status as UserStatus)) return { ok: false, message: "Statut invalide." };
      await updateUserStatus(targetUserId, status as UserStatus, reason);
      revalidatePath("/admin/users");
      return { ok: true, message: "Statut mis à jour." };
    } catch (error) {
      return { ok: false, message: error instanceof Error ? error.message : "Impossible de modifier le statut." };
    }
  }

  return (
    <section className="space-y-8 p-6 md:p-10">
      <header className="border-b border-stone-200 pb-6">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-amber-700">Administration</p>
        <h1 className="mt-2 text-3xl font-semibold text-stone-900">Utilisateurs</h1>
        <p className="mt-2 text-stone-600">Recherchez les comptes et gérez leur statut d’accès.</p>
      </header>
      <form method="get" className="flex max-w-xl gap-2">
        <label className="sr-only" htmlFor="user-query">
          Rechercher un utilisateur
        </label>
        <input id="user-query" name="query" defaultValue={query} placeholder="Nom, email, nickname ou Clerk ID" className="min-w-0 flex-1 border border-stone-300 bg-white px-3 py-2 text-sm" />
        <button type="submit" className="bg-stone-900 px-4 py-2 text-sm font-medium text-white">
          Rechercher
        </button>
      </form>
      <UserTable users={result.users} currentAdminId={userId} actionHandler={statusAction} />
      <p className="text-sm text-stone-500">
        {result.total} utilisateur(s) · Page {result.page} / {Math.max(result.pageCount, 1)}
      </p>
    </section>
  );
}

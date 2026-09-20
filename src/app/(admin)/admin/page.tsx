import Link from "next/link";
import { getReports, getUserManagementList } from "@/modules/users/server/admin-service";

export default async function AdminOverviewPage() {
  const [pendingReports, users] = await Promise.all([getReports("PENDING", undefined, 1), getUserManagementList(undefined, 1)]);
  return <section className="space-y-8 p-6 md:p-10"><header className="border-b border-stone-200 pb-6"><p className="text-sm font-medium uppercase tracking-[0.2em] text-amber-700">Administration</p><h1 className="mt-2 text-3xl font-semibold text-stone-900">Vue d’ensemble</h1><p className="mt-2 text-stone-600">Pilotage de la modération et des comptes.</p></header><div className="grid gap-5 sm:grid-cols-2"><Link href="/admin/reports" className="border border-stone-200 bg-white p-6 hover:border-amber-700"><p className="text-sm text-stone-500">Signalements en attente</p><p className="mt-2 text-3xl font-semibold text-stone-900">{pendingReports.length}</p></Link><Link href="/admin/users" className="border border-stone-200 bg-white p-6 hover:border-amber-700"><p className="text-sm text-stone-500">Utilisateurs recensés</p><p className="mt-2 text-3xl font-semibold text-stone-900">{users.total}</p></Link></div></section>;
}

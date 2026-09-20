import Link from "next/link";

export function AdminSidebar() {
  return (
    <aside className="border-r border-stone-800 bg-stone-950 text-stone-200">
      <div className="border-b border-stone-800 p-6">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-amber-400">Rope Trick</p>
        <h1 className="mt-2 text-xl font-semibold text-white">Administration</h1>
      </div>
      <nav className="space-y-1 p-4" aria-label="Administration">
        <Link href="/admin/reports" className="block px-3 py-2 text-sm hover:bg-stone-800 hover:text-white">
          Signalements
        </Link>
        <Link href="/admin/users" className="block px-3 py-2 text-sm hover:bg-stone-800 hover:text-white">
          Utilisateurs
        </Link>
        <Link href="/admin/audit" className="block px-3 py-2 text-sm hover:bg-stone-800 hover:text-white">
          Logs d’audit
        </Link>
        <Link href="/admin/spells" className="block px-3 py-2 text-sm hover:bg-stone-800 hover:text-white">Sorts</Link>
        <Link href="/admin/items" className="block px-3 py-2 text-sm hover:bg-stone-800 hover:text-white">Équipement</Link>
        <Link href="/admin/feats" className="block px-3 py-2 text-sm hover:bg-stone-800 hover:text-white">Dons</Link>
        <Link href="/admin/monsters" className="block px-3 py-2 text-sm hover:bg-stone-800 hover:text-white">Bestiaire</Link>
        <Link href="/admin/class-features" className="block px-3 py-2 text-sm hover:bg-stone-800 hover:text-white">Aptitudes de classe</Link>
        <Link href="/admin" className="block px-3 py-2 text-sm hover:bg-stone-800 hover:text-white">
          Vue d’ensemble
        </Link>
        <Link href="/" className="mt-4 block border-t border-stone-800 px-3 pt-4 text-sm text-stone-400 hover:text-white">
          Retour à l’application
        </Link>
      </nav>
    </aside>
  );
}

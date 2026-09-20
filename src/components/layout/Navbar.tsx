import Link from "next/link";
import { Show, UserButton } from "@clerk/nextjs";
import { ThemeSwitcher } from "@/components/layout/ThemeSwitcher";

const navigation = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Campagnes", href: "/campaigns" },
  { label: "Personnages", href: "/characters" },
  { label: "Messagerie", href: "/messages" },
  { label: "Administration", href: "/admin" },
];

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-[var(--theme-accent-soft)] bg-[var(--theme-background)]/95 backdrop-blur-xl">
      <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-3 px-5 lg:px-8">
        <Link href="/" className="group flex shrink-0 items-center gap-3">
          <span className="flex size-9 items-center justify-center rounded-lg border border-amber-300/30 bg-amber-300/10 text-lg text-amber-200 transition-colors group-hover:bg-amber-300/20">◈</span>
          <span className="font-[var(--font-display)] font-semibold tracking-tight text-[var(--theme-ink)]">Rope Trick</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Navigation principale">
          {navigation.map((item) => (
            <Link key={item.href} href={item.href} className="rounded-md px-3 py-2 text-sm text-[var(--theme-muted)] transition-colors hover:bg-[var(--theme-accent-soft)] hover:text-[var(--theme-ink)]">
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-3">
          <ThemeSwitcher />
          <Show when="signed-out">
            <Link href="/sign-in" className="hidden text-sm font-medium text-zinc-300 transition-colors hover:text-white sm:inline">
              Connexion
            </Link>
            <Link href="/sign-up" className="rounded-md bg-amber-300 px-3.5 py-2 text-sm font-semibold text-zinc-950 transition-colors hover:bg-amber-200">
              Inscription
            </Link>
          </Show>
          <Show when="signed-in">
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "size-9",
                },
              }}
            />
          </Show>
        </div>
      </div>
    </header>
  );
}

import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { ConversationList } from "@/modules/chat/components/ConversationList";
import { getUserConversations } from "@/modules/chat/server/chat-service";

export default async function MessagesPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");
  const conversations = await getUserConversations(userId);
  return (
    <main className="mx-auto min-h-screen max-w-6xl px-6 py-12">
      <header className="border-b border-stone-200 pb-8">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-amber-700">Rope Trick</p>
        <h1 className="mt-2 text-4xl font-semibold text-stone-900">Messagerie</h1>
        <p className="mt-2 text-stone-600">Vos conversations privées et de groupe.</p>
      </header>
      <div className="mt-8 grid min-h-[60vh] border border-stone-200 md:grid-cols-[minmax(18rem,25rem)_1fr]">
        <ConversationList conversations={conversations} currentUserId={userId} />
        <section className="hidden items-center justify-center bg-stone-50 p-8 text-center md:flex">
          <div>
            <p className="text-lg font-medium text-stone-900">Sélectionnez une discussion</p>
            <p className="mt-2 text-sm text-stone-500">Choisissez une conversation dans le volet gauche.</p>
            <Link href="/campaigns" className="mt-5 inline-flex bg-stone-900 px-4 py-2 text-sm font-medium text-white">
              Retour aux campagnes
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}

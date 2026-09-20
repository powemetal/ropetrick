import Link from "next/link";
import { revalidatePath } from "next/cache";
import { notFound, redirect } from "next/navigation";
import { ChatWindow } from "@/modules/chat/components/ChatWindow";
import { ConversationList } from "@/modules/chat/components/ConversationList";
import { MessageInput } from "@/modules/chat/components/MessageInput";
import { getMessages, getUserConversations, sendMessage, softDeleteMessage } from "@/modules/chat/server/chat-service";
import { reportMessage } from "@/modules/users/server/safety-service";
import { getOrCreateCurrentUser, UnauthorizedError } from "@/modules/users/server/user-sync";

type ConversationPageProps = { params: Promise<{ conversationId: string }> };
const value = (formData: FormData, key: string) => {
  const item = formData.get(key);
  return typeof item === "string" ? item : "";
};

export default async function ConversationPage({ params }: ConversationPageProps) {
  let user;
  try {
    user = await getOrCreateCurrentUser();
  } catch (error) {
    if (error instanceof UnauthorizedError) redirect("/sign-in");
    throw error;
  }
  const userId = user.id;
  const { conversationId } = await params;
  const conversations = await getUserConversations(userId);
  const conversation = conversations.find((item) => item.id === conversationId);
  if (!conversation) notFound();
  const messages = await getMessages(conversationId, userId);
  const currentParticipant = conversation.participants.find((participant) => participant.userId === userId);
  const other = conversation.participants.find((participant) => participant.userId !== userId)?.user;
  const label = conversation.isGroup ? (conversation.title ?? "Groupe sans titre") : (other?.name ?? "Conversation");

  async function sendAction(previousState: { ok: boolean; message: string }, formData: FormData) {
    "use server";
    let currentUser;
    try {
      currentUser = await getOrCreateCurrentUser();
    } catch (error) {
      if (error instanceof UnauthorizedError) redirect("/sign-in");
      throw error;
    }
    const attachmentUrl = value(formData, "attachmentUrl");
    await sendMessage(conversationId, currentUser.id, value(formData, "content"), attachmentUrl ? [attachmentUrl] : []);
    revalidatePath(`/messages/${conversationId}`);
    return { ok: true, message: "Message envoyé." };
  }
  async function deleteAction(formData: FormData) {
    "use server";
    let currentUser;
    try {
      currentUser = await getOrCreateCurrentUser();
    } catch (error) {
      if (error instanceof UnauthorizedError) redirect("/sign-in");
      throw error;
    }
    await softDeleteMessage(value(formData, "messageId"), currentUser.id);
    revalidatePath(`/messages/${conversationId}`);
  }
  async function reportAction(formData: FormData) {
    "use server";
    let currentUser;
    try {
      currentUser = await getOrCreateCurrentUser();
    } catch (error) {
      if (error instanceof UnauthorizedError) redirect("/sign-in");
      throw error;
    }
    await reportMessage(currentUser.id, value(formData, "messageId"), value(formData, "reason"));
    revalidatePath(`/messages/${conversationId}`);
  }

  return (
    <main className="mx-auto min-h-screen max-w-6xl px-6 py-12">
      <header className="flex items-center justify-between border-b border-stone-200 pb-8">
        <div>
          <Link href="/messages" className="text-sm font-medium text-amber-700">
            ← Toutes les discussions
          </Link>
          <h1 className="mt-3 text-3xl font-semibold text-stone-900">{label}</h1>
          <p className="mt-1 text-sm text-stone-500">{conversation.participants.length} participant(s)</p>
        </div>
      </header>
      <div className="mt-8 grid min-h-[65vh] border border-stone-200 md:grid-cols-[minmax(18rem,25rem)_1fr]">
        <ConversationList conversations={conversations} currentUserId={userId} activeId={conversationId} />
        <section className="flex min-w-0 flex-col">
          <ChatWindow messages={messages} currentUserId={userId} isAdmin={currentParticipant?.isAdmin ?? false} deleteAction={deleteAction} reportAction={reportAction} />
          <MessageInput action={sendAction} />
        </section>
      </div>
    </main>
  );
}

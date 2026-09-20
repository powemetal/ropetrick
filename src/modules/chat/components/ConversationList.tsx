import Link from "next/link";

type ConversationListProps = { conversations: Array<{ id: string; isGroup: boolean; title: string | null; participants: Array<{ userId: string; user: { name: string; nickname: string; avatarUrl: string | null } }>; messages: Array<{ content: string; isDeleted: boolean; createdAt: Date }> }>; currentUserId: string; activeId?: string };

export function ConversationList({ conversations, currentUserId, activeId }: ConversationListProps) {
  return (
    <aside className="border-r border-stone-200 bg-stone-50">
      <div className="border-b border-stone-200 p-5">
        <h2 className="font-semibold text-stone-900">Discussions</h2>
      </div>
      <nav>
        {conversations.map((conversation) => {
          const other = conversation.participants.find((participant) => participant.userId !== currentUserId)?.user;
          const label = conversation.isGroup ? (conversation.title ?? "Groupe sans titre") : (other?.name ?? other?.nickname ?? "Conversation");
          const preview = conversation.messages[0];
          return (
            <Link key={conversation.id} href={`/messages/${conversation.id}`} className={`flex items-center gap-3 border-b border-stone-200 p-4 hover:bg-white ${activeId === conversation.id ? "bg-white" : ""}`}>
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-stone-900 text-amber-200">{conversation.isGroup ? "#" : label.charAt(0).toUpperCase()}</div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="truncate font-medium text-stone-900">{label}</p>
                  {conversation.isGroup && <span className="bg-stone-200 px-1.5 py-0.5 text-[10px] text-stone-600">Groupe</span>}
                </div>
                <p className="truncate text-sm text-stone-500">{preview?.isDeleted ? "Message supprimé" : (preview?.content ?? "Aucun message")}</p>
              </div>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

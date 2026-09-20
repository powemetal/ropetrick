/* eslint-disable @next/next/no-img-element */
import { MessageActionMenu } from "@/modules/chat/components/MessageActionMenu";

type ChatMessage = { id: string; senderId: string; content: string; isDeleted: boolean; createdAt: Date; sender: { name: string; nickname: string }; attachments: Array<{ id: string; fileUrl: string; fileType: string }> };
type ChatWindowProps = { messages: ChatMessage[]; currentUserId: string; isAdmin: boolean; deleteAction: (formData: FormData) => void | Promise<void>; reportAction: (formData: FormData) => void | Promise<void> };

export function ChatWindow({ messages, currentUserId, isAdmin, deleteAction, reportAction }: ChatWindowProps) {
  return (
    <section className="flex min-h-[55vh] flex-col justify-end overflow-y-auto bg-stone-50 p-5">
      <div className="space-y-4">
        {[...messages].reverse().map((message) => {
          const own = message.senderId === currentUserId;
          return (
            <div key={message.id} className={`flex items-end gap-2 ${own ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[80%] ${own ? "items-end" : "items-start"}`}>
                <div className={`flex items-center gap-2 ${own ? "justify-end" : ""}`}>
                  <span className="text-xs text-stone-500">{own ? "Vous" : message.sender.name}</span>
                  <span className="text-[11px] text-stone-400">{new Date(message.createdAt).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" })}</span>
                  {!message.isDeleted && <MessageActionMenu canDelete={own || isAdmin} deleteAction={deleteAction} reportAction={reportAction} messageId={message.id} />}
                </div>
                <div className={`mt-1 px-4 py-3 text-sm leading-6 ${message.isDeleted ? "border border-stone-200 bg-stone-100 italic text-stone-500" : own ? "bg-stone-900 text-white" : "border border-stone-200 bg-white text-stone-800"}`}>
                  {message.isDeleted ? (
                    "Message supprimé"
                  ) : (
                    <>
                      {message.content}
                      {message.attachments.length > 0 && (
                        <div className="mt-3 space-y-2">
                          {message.attachments.map((attachment) => (
                            <img key={attachment.id} src={attachment.fileUrl} alt="Pièce jointe" className="max-h-56 max-w-full object-contain" />
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

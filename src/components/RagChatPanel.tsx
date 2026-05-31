import { Bot, BotMessageSquare, Loader2, Send, X } from "lucide-react";
import { FormEvent, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { api } from "@/services/api";
import type { ChatMessage, QuestionAnswer } from "@/types";

type RagChatPanelProps = {
  processId: string;
  questions: QuestionAnswer[];
  disabled?: boolean;
};

function createMessage(role: ChatMessage["role"], content: string): ChatMessage {
  return {
    id: crypto.randomUUID(),
    role,
    content,
    createdAt: new Date().toISOString()
  };
}

export function RagChatPanel({
  processId,
  questions,
  disabled = false
}: RagChatPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    createMessage(
      "assistant",
      "Ask a question about this Excel process and I will answer from the workbook context."
    )
  ]);
  const [draft, setDraft] = useState("");
  const [isSending, setIsSending] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const canSend = useMemo(
    () => Boolean(processId && draft.trim() && !disabled && !isSending),
    [disabled, draft, isSending, processId]
  );

  async function sendMessage(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    if (!canSend) return;

    const userMessage = createMessage("user", draft.trim());

    setMessages((current) => [...current, userMessage]);
    setDraft("");
    setIsSending(true);

    try {
      const response = await api.ragChat({
        processId,
        message: userMessage.content,
        history: messages.map(({ role, content }) => ({ role, content })),
        context: {
          questions
        }
      });

      setMessages((current) => [
        ...current,
        createMessage("assistant", response.answer)
      ]);
    } catch (caught) {
      toast.error(caught instanceof Error ? caught.message : "Chat request failed");
      setMessages((current) => current.filter((message) => message.id !== userMessage.id));
      setDraft(userMessage.content);
    } finally {
      setIsSending(false);
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {isOpen && (
        <Card className="w-[calc(100vw-3rem)] max-w-[26rem] overflow-hidden shadow-2xl">
          <CardHeader className="border-b p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
                  <BotMessageSquare className="h-4 w-4" />
                </span>
                <div>
                  <CardTitle>RAG chat</CardTitle>
                  <CardDescription>Workbook-aware agent</CardDescription>
                </div>
              </div>
              <Button
                variant="ghost"
                className="h-9 w-9 px-0"
                aria-label="Close chat"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="flex h-[34rem] max-h-[calc(100vh-9rem)] flex-col p-0">
            <div className="flex-1 space-y-4 overflow-y-auto p-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex gap-3",
                    message.role === "user" && "justify-end"
                  )}
                >
                  {message.role === "assistant" && (
                    <span className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-secondary">
                      <Bot className="h-4 w-4" />
                    </span>
                  )}
                  <div
                    className={cn(
                      "max-w-[82%] rounded-lg px-3 py-2 text-sm leading-6",
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-secondary-foreground"
                    )}
                  >
                    {message.content}
                  </div>
                </div>
              ))}
              {isSending && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Searching workbook context
                </div>
              )}
            </div>

            <form ref={formRef} className="border-t p-4" onSubmit={sendMessage}>
              <Textarea
                value={draft}
                disabled={disabled || !processId}
                placeholder={
                  processId ? "Ask about this workbook" : "Chat available after upload"
                }
                className="min-h-24"
                onChange={(event) => setDraft(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    formRef.current?.requestSubmit();
                  }
                }}
              />
              <Button className="mt-3 w-full" type="submit" disabled={!canSend}>
                {isSending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                Send
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      <Button
        className="h-14 w-14 rounded-full p-0 shadow-lg"
        aria-label={isOpen ? "Close RAG chat agent" : "Open RAG chat agent"}
        onClick={() => setIsOpen((current) => !current)}
      >
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <BotMessageSquare className="h-6 w-6" />
        )}
      </Button>
    </div>
  );
}

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { AIChatBox, Message } from "@/components/AIChatBox";
import { MessageCircle, X } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { cn } from "@/lib/utils";

/**
 * Floating chatbot widget that appears on all pages
 * Allows users to ask questions about Oak Scholars services
 */
export function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "system",
      content: "You are a helpful assistant for Oak Scholars.",
    },
    {
      role: "assistant",
      content:
        "Hi! 👋 I'm here to help answer any questions about Oak Scholars tutoring. What would you like to know?",
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // tRPC mutation for AI chat
  const chatMutation = trpc.ai.chat.useMutation({
    onSuccess: (response) => {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: response.message,
        },
      ]);
      setIsLoading(false);
    },
    onError: (error) => {
      console.error("Chat error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Sorry, I encountered an error. Please try again or contact us at /contact.",
        },
      ]);
      setIsLoading(false);
    },
  });

  // Handle sending messages
  const handleSendMessage = (content: string) => {
    // Add user message
    const userMessage: Message = { role: "user", content };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    // Prepare messages for API (exclude system message)
    const apiMessages = messages
      .filter((m) => m.role !== "system")
      .concat(userMessage);

    // Call the AI chat endpoint
    chatMutation.mutate({
      messages: apiMessages.map((m) => ({
        role: m.role as "user" | "assistant" | "system",
        content: m.content,
      })),
    });
  };

  // Close chatbot when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        // Don't close if clicking on the toggle button
        const target = event.target as HTMLElement;
        if (!target.closest("[data-chatbot-toggle]")) {
          // Allow closing by clicking outside, but keep it open for better UX
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="fixed bottom-4 right-4 z-50">
      {/* Chat Box */}
      {isOpen && (
        <div
          className="mb-4 w-96 max-w-[calc(100vw-2rem)] rounded-lg shadow-2xl border border-border animate-in fade-in slide-in-from-bottom-4 duration-300"
          style={{ maxHeight: "600px" }}
        >
          <AIChatBox
            messages={messages}
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
            placeholder="Ask me anything about Oak Scholars..."
            height="600px"
            emptyStateMessage="Welcome to Oak Scholars support!"
            suggestedPrompts={[
              "What subjects do you cover?",
              "How much do sessions cost?",
              "How does the booking process work?",
              "Do you offer wellbeing support?",
            ]}
          />
        </div>
      )}

      {/* Toggle Button */}
      <Button
        data-chatbot-toggle
        onClick={() => setIsOpen(!isOpen)}
        size="lg"
        className={cn(
          "rounded-full shadow-lg h-14 w-14 p-0 transition-all duration-300",
          isOpen
            ? "bg-destructive hover:bg-destructive/90"
            : "bg-primary hover:bg-primary/90"
        )}
        title={isOpen ? "Close chat" : "Open chat"}
      >
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <MessageCircle className="h-6 w-6" />
        )}
      </Button>
    </div>
  );
}

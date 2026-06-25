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
  const [showPrompt, setShowPrompt] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "system",
      content: "You are a helpful assistant for Oak Scholars. If a user expresses interest in speaking with a team member or 'an Oak Scholar', encourage them to leave their details or direct them to the contact page."
    },
    {
      role: "assistant",
      content:
        "Hi! 👋 I'm here to help answer any questions about Oak Scholars. If you'd like to connect directly with one of our Oak Scholars (a member of our team), just let me know!",
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
          role: "assistant" as const,
          content: String(response.message),
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

  // Show "Need some help?" prompt after 30 seconds or 50% scroll
  useEffect(() => {
    if (isOpen) {
      setShowPrompt(false);
      return;
    }

    const timer = setTimeout(() => {
      setShowPrompt(true);
    }, 30000); // 30 seconds

    const handleScroll = () => {
      const scrollPercent = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
      if (scrollPercent > 50) {
        setShowPrompt(true);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [isOpen]);

  return (
    <div ref={containerRef} className="fixed bottom-4 right-4 z-50">
      {/* Chat Box */}
      {isOpen && (
        <div
          className="mb-4 w-96 max-w-[calc(100vw-2rem)] rounded-xl shadow-2xl border border-border animate-in fade-in slide-in-from-bottom-4 duration-300 overflow-hidden relative"
          style={{ maxHeight: "600px" }}
        >
          {/* Close button - softer styling, top-right */}
          <div className="absolute top-3 right-3 z-10">
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-full bg-gray-100/80 hover:bg-gray-200 text-gray-500 hover:text-gray-700 transition-all duration-200 ease-out hover:scale-110 backdrop-blur-sm"
              title="Close chat"
              aria-label="Close chat"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
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
              "Connect me with a team member",
            ]}
          />
        </div>
      )}

      {/* Help Prompt Popup */}
      {!isOpen && showPrompt && (
        <div 
          className="absolute bottom-16 right-0 mb-2 w-48 bg-white p-4 rounded-2xl shadow-xl border border-amber/20 animate-in fade-in slide-in-from-bottom-2 duration-500 cursor-pointer group"
          onClick={() => setIsOpen(true)}
        >
          <div className="absolute -bottom-2 right-6 w-4 h-4 bg-white border-r border-b border-amber/20 rotate-45" />
          <p className="text-navy-deep font-semibold text-sm flex items-center gap-2">
            Need some help? <span className="group-hover:translate-x-1 transition-transform">👋</span>
          </p>
          <p className="text-muted-brand text-xs mt-1">I'm here to answer any questions!</p>
          <button 
            className="absolute -top-2 -left-2 bg-gray-100 hover:bg-gray-200 rounded-full p-1 shadow-sm transition-all duration-200 ease-out hover:scale-110"
            onClick={(e) => {
              e.stopPropagation();
              setShowPrompt(false);
            }}
          >
            <X className="h-3 w-3 text-gray-500" />
          </button>
        </div>
      )}

      {/* Toggle Button */}
      <Button
        data-chatbot-toggle
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) setShowPrompt(false);
        }}
        size="lg"
        className={cn(
          "rounded-full shadow-lg h-14 w-14 p-0 transition-all duration-300 ease-out hover:scale-110",
          isOpen
            ? "bg-destructive hover:bg-destructive/90"
            : "bg-primary hover:bg-primary/90"
        )}
        style={!isOpen ? { backgroundColor: "#E8A838", color: "#281A39" } : {}}
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

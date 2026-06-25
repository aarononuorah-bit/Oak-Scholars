import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { AIChatBox, Message } from "@/components/AIChatBox";
import { MessageCircle, X, UserCheck } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { cn } from "@/lib/utils";
import { Link } from "wouter";

/**
 * Floating chatbot widget that appears on all pages.
 * Supports a [CONNECT_TO_AGENT] marker in AI responses to surface a
 * "Connect to our team" CTA button when the AI cannot help.
 */
export function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const [showConnectAgent, setShowConnectAgent] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hi! 👋 I'm here to help answer any questions about Oak Scholars. Ask me about pricing, subjects, how to book a session, or how to become an Oak Scholar!",
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // tRPC mutation for AI chat
  const chatMutation = trpc.ai.chat.useMutation({
    onSuccess: (response) => {
      const raw = String(response.message);
      // Detect connect-to-agent marker
      const hasAgentMarker = raw.includes("[CONNECT_TO_AGENT]");
      const cleanedMessage = raw.replace("[CONNECT_TO_AGENT]", "").trim();

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant" as const,
          content: cleanedMessage,
        },
      ]);
      if (hasAgentMarker) setShowConnectAgent(true);
      setIsLoading(false);
    },
    onError: (error) => {
      console.error("Chat error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Sorry, I ran into an issue. You can reach our team directly at [/contact](/contact).",
        },
      ]);
      setShowConnectAgent(true);
      setIsLoading(false);
    },
  });

  // Explicit user-triggered connect to agent (independent of AI marker)
  const handleConnectToAgent = () => {
    setShowConnectAgent(true);
    setMessages((prev) => [
      ...prev,
      {
        role: "assistant" as const,
        content:
          "I've flagged this for our team. Please visit our [contact page](/contact) and a member of the Oak Scholars team will get back to you shortly.",
      },
    ]);
  };

  // Handle sending messages
  const handleSendMessage = (content: string) => {
    setShowConnectAgent(false); // reset agent CTA on new message
    const userMessage: Message = { role: "user", content };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    const apiMessages = messages
      .filter((m) => m.role !== "system")
      .concat(userMessage);

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
        const target = event.target as HTMLElement;
        if (!target.closest("[data-chatbot-toggle]")) {
          // intentionally left empty — keep open on outside click for UX
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
    const timer = setTimeout(() => setShowPrompt(true), 30000);
    const handleScroll = () => {
      const scrollPercent =
        (window.scrollY /
          (document.documentElement.scrollHeight - window.innerHeight)) *
        100;
      if (scrollPercent > 50) setShowPrompt(true);
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
          className="mb-4 w-96 max-w-[calc(100vw-2rem)] rounded-xl shadow-2xl border border-[#E8A838]/20 animate-in fade-in slide-in-from-bottom-4 duration-300 overflow-hidden relative"
          style={{ maxHeight: "620px", background: "#FDFAF5" }}
        >
          <AIChatBox
            messages={messages}
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
            placeholder="Ask me anything about Oak Scholars..."
            height="540px"
            emptyStateMessage="Welcome to Oak Scholars support!"
            suggestedPrompts={[
              "What subjects do you cover?",
              "How much do sessions cost?",
              "How does the booking process work?",
              "How do I become an Oak Scholar?",
              "Do you offer wellbeing support?",
            ]}
          />

          {/* Connect to Agent CTA — shown when AI triggers [CONNECT_TO_AGENT] */}
          {showConnectAgent && (
            <div className="px-4 pb-3 pt-1 border-t border-[#E8A838]/20 bg-[#FDFAF5]">
              <Link href="/contact">
                <Button
                  className="w-full gap-2 font-semibold text-sm transition-all duration-200 ease-out hover:scale-[1.02] hover:shadow-md"
                  style={{ backgroundColor: "#281A39", color: "#E8A838" }}
                  onClick={() => setIsOpen(false)}
                >
                  <UserCheck className="h-4 w-4" />
                  Connect to our team
                </Button>
              </Link>
            </div>
          )}

          {/* Always-visible talk-to-human option */}
          {!showConnectAgent && (
            <div className="flex justify-start px-4 pb-1 pt-0 bg-[#FDFAF5]">
              <button
                onClick={handleConnectToAgent}
                className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full transition-all duration-200 ease-out hover:scale-105"
                style={{ color: "#281A39", background: "rgba(40,26,57,0.06)", border: "1px solid rgba(40,26,57,0.15)" }}
              >
                <UserCheck className="h-3 w-3" />
                Talk to a human
              </button>
            </div>
          )}

          {/* Close button — bottom-right, brand colours */}
          <div className="flex justify-end px-4 pb-3 pt-1 bg-[#FDFAF5]">
            <button
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full transition-all duration-200 ease-out hover:scale-105"
              style={{ color: "#281A39", background: "rgba(232,168,56,0.12)", border: "1px solid rgba(40,26,57,0.15)" }}
              title="Close chat"
              aria-label="Close chat"
            >
              <X className="h-3 w-3" />
              Close
            </button>
          </div>
        </div>
      )}

      {/* Help Prompt Popup */}
      {!isOpen && showPrompt && (
        <div
          className="absolute bottom-16 right-0 mb-2 w-48 bg-white p-4 rounded-2xl shadow-xl border border-[#E8A838]/30 animate-in fade-in slide-in-from-bottom-2 duration-500 cursor-pointer group"
          onClick={() => setIsOpen(true)}
        >
          <div className="absolute -bottom-2 right-6 w-4 h-4 bg-white border-r border-b border-[#E8A838]/30 rotate-45" />
          <p className="text-[#281A39] font-semibold text-sm flex items-center gap-2">
            Need some help?{" "}
            <span className="group-hover:translate-x-1 transition-transform">
              👋
            </span>
          </p>
          <p className="text-gray-500 text-xs mt-1">
            I'm here to answer any questions!
          </p>
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
            ? "hover:opacity-90"
            : "hover:opacity-90"
        )}
        style={
          isOpen
            ? { backgroundColor: "#281A39", color: "#E8A838" }
            : { backgroundColor: "#E8A838", color: "#281A39" }
        }
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

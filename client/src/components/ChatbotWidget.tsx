import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { AIChatBox, Message } from "@/components/AIChatBox";
import { MessageCircle, X, UserCheck, Sparkles } from "lucide-react";
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
  const [promptDismissed, setPromptDismissed] = useState(false);
  const [showConnectAgent, setShowConnectAgent] = useState(false);
  const [hasEntered, setHasEntered] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hi! 👋 I'm here to help answer any questions about Oak Scholars. Ask me about pricing, subjects, how to book a session, or how to become an Oak Scholar!",
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Entrance animation delay
  useEffect(() => {
    const t = setTimeout(() => setHasEntered(true), 1200);
    return () => clearTimeout(t);
  }, []);

  // tRPC mutation for AI chat
  const chatMutation = trpc.ai.chat.useMutation({
    onSuccess: (response) => {
      const raw = String(response.message);
      const hasAgentMarker = raw.includes("[CONNECT_TO_AGENT]");
      const cleanedMessage = raw.replace("[CONNECT_TO_AGENT]", "").trim();
      setMessages((prev) => [...prev, { role: "assistant" as const, content: cleanedMessage }]);
      if (hasAgentMarker) setShowConnectAgent(true);
      setIsLoading(false);
    },
    onError: () => {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I ran into an issue. You can reach our team directly at [/contact](/contact).",
        },
      ]);
      setShowConnectAgent(true);
      setIsLoading(false);
    },
  });

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

  const handleSendMessage = (content: string) => {
    setShowConnectAgent(false);
    const userMessage: Message = { role: "user", content };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    const apiMessages = messages.filter((m) => m.role !== "system").concat(userMessage);
    chatMutation.mutate({
      messages: apiMessages.map((m) => ({
        role: m.role as "user" | "assistant" | "system",
        content: m.content,
      })),
    });
  };

  // Show help prompt after 25s or 50% scroll — only once
  useEffect(() => {
    if (isOpen || promptDismissed) return;
    const timer = setTimeout(() => setShowPrompt(true), 25000);
    const handleScroll = () => {
      const pct = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
      if (pct > 50) setShowPrompt(true);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      clearTimeout(timer);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [isOpen, promptDismissed]);

  const dismissPrompt = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowPrompt(false);
    setPromptDismissed(true);
  };

  return (
    <div ref={containerRef} className="fixed bottom-4 right-4 z-[55] flex flex-col items-end">
      {/* Chat Box */}
      {isOpen && (
        <div
          className="mb-3 w-[380px] max-w-[calc(100vw-2rem)] rounded-2xl shadow-2xl border border-amber/20 overflow-hidden"
          style={{
            maxHeight: "600px",
            background: "#FDFAF5",
            animation: "chatSlideUp 280ms cubic-bezier(0.23, 1, 0.32, 1) both",
          }}
        >
          {/* Chat header */}
          <div
            className="flex items-center justify-between px-4 py-3 border-b border-amber/15"
            style={{ background: "#281A39" }}
          >
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-amber/20 flex items-center justify-center">
                <Sparkles size={14} className="text-amber" />
              </div>
              <div>
                <p className="text-white text-sm font-semibold">Oak Scholars AI</p>
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-white/50 text-xs">Online · typically instant</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/50 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition-all duration-200"
              aria-label="Close chat"
            >
              <X size={16} />
            </button>
          </div>

          <AIChatBox
            messages={messages}
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
            placeholder="Ask me anything about Oak Scholars..."
            height="440px"
            emptyStateMessage="Welcome to Oak Scholars support!"
            suggestedPrompts={[
              "What subjects do you cover?",
              "How much do sessions cost?",
              "How does the booking process work?",
              "How do I become an Oak Scholar?",
              "Do you offer wellbeing support?",
            ]}
          />

          {/* Footer actions */}
          <div className="px-4 pb-4 pt-2 bg-[#FDFAF5] border-t border-amber/10 flex flex-col items-center gap-2">
            {showConnectAgent ? (
              <Link href="/contact" className="w-full">
                <Button
                  className="w-full gap-2 font-semibold text-sm transition-all duration-200 hover:scale-[1.02] hover:shadow-md"
                  style={{ backgroundColor: "#281A39", color: "#E8A838" }}
                  onClick={() => setIsOpen(false)}
                >
                  <UserCheck size={14} />
                  Connect to our team
                </Button>
              </Link>
            ) : (
              <button
                onClick={handleConnectToAgent}
                className="w-full flex items-center justify-center gap-2 text-xs font-bold py-2.5 rounded-xl transition-all duration-200 hover:bg-navy-deep/5 active:scale-[0.98]"
                style={{ color: "#281A39", border: "1px dashed rgba(40,26,57,0.2)" }}
              >
                <UserCheck size={14} />
                Talk to a human
              </button>
            )}
          </div>
        </div>
      )}

      {/* Help Prompt Popup */}
      {!isOpen && showPrompt && !promptDismissed && (
        <div
          role="button"
          tabIndex={0}
          className="mb-3 w-52 bg-white p-4 rounded-2xl shadow-xl border border-amber/30 cursor-pointer group"
          style={{ animation: "chatSlideUp 300ms cubic-bezier(0.23, 1, 0.32, 1) both" }}
          onClick={() => { setIsOpen(true); setShowPrompt(false); }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setIsOpen(true);
              setShowPrompt(false);
            }
          }}
        >
          {/* Speech bubble tail */}
          <div className="absolute -bottom-2 right-6 w-4 h-4 bg-white border-r border-b border-amber/30 rotate-45" />
          <p className="text-navy font-semibold text-sm flex items-center gap-2">
            Need some help?{" "}
            <span className="group-hover:translate-x-0.5 transition-transform inline-block">👋</span>
          </p>
          <p className="text-gray-500 text-xs mt-1 leading-relaxed">
            I'm here to answer any questions!
          </p>
          <button
            className="absolute -top-2 -left-2 bg-gray-100 hover:bg-gray-200 rounded-full p-1 shadow-sm transition-all duration-200 hover:scale-110"
            onClick={dismissPrompt}
            aria-label="Dismiss"
          >
            <X size={10} className="text-gray-500" />
          </button>
        </div>
      )}

      {/* Toggle Button — with entrance animation */}
      <button
        data-chatbot-toggle
        onClick={() => {
          setIsOpen((v) => !v);
          setShowPrompt(false);
        }}
        className={cn(
          "rounded-full shadow-lg h-14 w-14 flex items-center justify-center transition-all duration-300 ease-out focus-visible:outline-2 focus-visible:outline-amber",
          hasEntered ? "chatbot-entrance" : "opacity-0 pointer-events-none",
          isOpen ? "hover:scale-105" : "hover:scale-110 hover:shadow-amber/30 hover:shadow-xl"
        )}
        style={
          isOpen
            ? { backgroundColor: "#281A39", color: "#E8A838" }
            : { backgroundColor: "#E8A838", color: "#281A39" }
        }
        title={isOpen ? "Close chat" : "Open chat"}
        aria-label={isOpen ? "Close chat" : "Open chat"}
        aria-expanded={isOpen}
      >
        <span className="relative block w-6 h-6">
          <MessageCircle
            size={24}
            className={`absolute inset-0 transition-all duration-300 ${isOpen ? "opacity-0 rotate-90 scale-75" : "opacity-100 rotate-0 scale-100"}`}
          />
          <X
            size={24}
            className={`absolute inset-0 transition-all duration-300 ${isOpen ? "opacity-100 rotate-0 scale-100" : "opacity-0 -rotate-90 scale-75"}`}
          />
        </span>
      </button>

      <style>{`
        @keyframes chatSlideUp {
          from { opacity: 0; transform: translateY(16px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}

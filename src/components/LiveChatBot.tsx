"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Bot, User, ChevronDown, Headphones } from "lucide-react";
import { ChatMessage } from "@/types";
import Link from "next/link";

// The assistant answers ONLY through the live /api/assistant/ service.
// There are intentionally no canned knowledge replies here: the widget must
// never invent platform facts (fees, leverage, timings, contacts) offline.
const ASSISTANT_UNAVAILABLE =
  "The live assistant is unavailable right now. Please try again shortly or visit the Help Center for platform guidance.";

async function getBotResponse(userMsg: string): Promise<string> {
  try {
    const res = await fetch("/api/assistant/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ message: userMsg }),
    });
    if (!res.ok) return ASSISTANT_UNAVAILABLE;
    const data = await res.json();
    return typeof data.reply === "string" && data.reply.trim()
      ? data.reply
      : ASSISTANT_UNAVAILABLE;
  } catch {
    return ASSISTANT_UNAVAILABLE;
  }
}

const quickReplies = [
  "How do I deposit?",
  "How do I withdraw?",
  "What platforms do you offer?",
  "What is leverage?",
  "How do I open an account?",
  "Contact support",
];

export default function LiveChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: "1", sender: "bot", text: "Hello! I'm your Axi assistant. How can I help you today?", timestamp: new Date() },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userText = input;
    const userMsg: ChatMessage = { id: Date.now().toString(), sender: "user", text: userText, timestamp: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);
    const replyText = await getBotResponse(userText);
    const botMsg: ChatMessage = { id: (Date.now() + 1).toString(), sender: "bot", text: replyText, timestamp: new Date() };
    setMessages((prev) => [...prev, botMsg]);
    setIsTyping(false);
  };

  const handleQuickReply = async (text: string) => {
    const userMsg: ChatMessage = { id: Date.now().toString(), sender: "user", text, timestamp: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);
    const replyText = await getBotResponse(text);
    const botMsg: ChatMessage = { id: (Date.now() + 1).toString(), sender: "bot", text: replyText, timestamp: new Date() };
    setMessages((prev) => [...prev, botMsg]);
    setIsTyping(false);
  };

  return (
    <>
      {/* Chat Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-[100] w-14 h-14 rounded-full bg-[#D31C2B] text-white shadow-2xl flex items-center justify-center hover:bg-[#B91623] transition-colors"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-24 right-6 z-[100] w-[380px] max-w-[calc(100vw-48px)] h-[520px] max-h-[calc(100vh-120px)] bg-white rounded-2xl shadow-2xl border border-[#D9D3CB] flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-[#1A1A1A] px-5 py-4 flex items-center gap-3 shrink-0">
              <div className="w-10 h-10 rounded-full bg-[#D31C2B] flex items-center justify-center">
                <Bot size={20} className="text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-white font-bold text-sm">Axi Assistant</h3>
                <p className="text-white/50 text-xs flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-[#F5C842]" /> Automated replies
                </p>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-white/50 hover:text-white transition-colors">
                <ChevronDown size={20} />
              </button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-hide">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex gap-2 ${msg.sender === "user" ? "flex-row-reverse" : ""}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.sender === "bot" ? "bg-[#D31C2B]" : "bg-[#1A1A1A]"}`}>
                    {msg.sender === "bot" ? <Bot size={14} className="text-white" /> : <User size={14} className="text-white" />}
                  </div>
                  <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${msg.sender === "bot" ? "bg-[#F5F2ED] text-[#1A1A1A] rounded-tl-sm" : "bg-[#D31C2B] text-white rounded-tr-sm"}`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#D31C2B] flex items-center justify-center shrink-0">
                    <Bot size={14} className="text-white" />
                  </div>
                  <div className="bg-[#F5F2ED] rounded-2xl rounded-tl-sm px-4 py-3">
                    <div className="flex gap-1">
                      <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0 }} className="w-2 h-2 rounded-full bg-[#9B9590]" />
                      <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} className="w-2 h-2 rounded-full bg-[#9B9590]" />
                      <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} className="w-2 h-2 rounded-full bg-[#9B9590]" />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Replies */}
            <div className="px-4 py-2 border-t border-[#F5F2ED] shrink-0">
              <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
                {quickReplies.map((reply) => (
                  <button
                    key={reply}
                    onClick={() => handleQuickReply(reply)}
                    className="px-3 py-1.5 bg-[#F5F2ED] rounded-full text-xs text-[#1A1A1A] font-medium whitespace-nowrap hover:bg-[#D31C2B] hover:text-white transition-colors"
                  >
                    {reply}
                  </button>
                ))}
              </div>
            </div>

            {/* Input */}
            <div className="px-4 py-3 border-t border-[#D9D3CB] flex gap-2 shrink-0">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Type your message..."
                className="flex-1 px-4 py-2.5 bg-[#F5F2ED] rounded-xl text-sm text-[#1A1A1A] outline-none focus:ring-2 focus:ring-[#D31C2B]/20"
              />
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleSend}
                disabled={!input.trim()}
                className="w-10 h-10 rounded-xl bg-[#D31C2B] text-white flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Send size={16} />
              </motion.button>
            </div>

            {/* Footer */}
            <div className="px-4 py-2 bg-[#F5F2ED] text-center shrink-0">
              <p className="text-[10px] text-[#9B9590]">
                Need more help?{" "}
                <Link href="/helpcenter/" className="text-[#D31C2B] font-bold">
                  Visit the Help Center
                </Link>
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

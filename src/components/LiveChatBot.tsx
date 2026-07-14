"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Bot, User, ChevronDown, Headphones } from "lucide-react";
import { ChatMessage } from "@/types";

const botResponses: Record<string, string[]> = {
  greeting: [
    "Hello! Welcome to Axi. How can I assist you today?",
    "Hi there! I'm your Axi support assistant. What can I help you with?",
  ],
  deposit: [
    "You can deposit funds via Bank Transfer, Credit/Debit Card, Crypto Wallet, or Skrill. All methods are fee-free. Go to your Dashboard and click 'Deposit' to get started.",
    "We support multiple deposit methods: Bank Transfer (1-3 days), Card (Instant), Crypto (up to 15 mins), and Skrill (Instant). Which would you prefer?",
  ],
  withdraw: [
    "To withdraw, go to Dashboard → Withdraw, select your method, enter the amount, and submit. Withdrawals are processed within 24-48 hours.",
    "Withdrawals can be made to your Bank Account, Crypto Wallet, or e-wallet. Processing time is 24-48 hours for verified accounts.",
  ],
  account: [
    "To open an account, click 'Open Account' on our homepage, fill in your details, verify your identity, and fund your account. It takes just a few minutes!",
    "Account opening is simple: Register → Verify ID → Deposit → Trade. You can start with as little as $0 on a Standard account.",
  ],
  leverage: [
    "Axi offers up to 500:1 leverage on forex and indices, 200:1 on crypto, and 20:1 on shares. Leverage varies by instrument and account type.",
    "Leverage allows you to control larger positions with less capital. We offer up to 500:1 on major forex pairs. Use responsibly!",
  ],
  platform: [
    "We offer MetaTrader 4, MetaTrader 5, and our proprietary Axi Trading Platform. All are available on web, desktop, and mobile.",
    "You can trade on MT4, MT5, or our Axi platform. MT4 is the industry standard, MT5 has more features, and our platform is designed for modern traders.",
  ],
  support: [
    "Our support team is available 24/5 via live chat, email (support@axi.com), and phone. Average response time is under 2 minutes.",
    "You can reach us via live chat (fastest), email at support@axi.com, or phone. We're here to help 24/5!",
  ],
  default: [
    "I understand. Could you provide more details so I can better assist you?",
    "I'm here to help! Could you clarify your question or check our Help Center for more information?",
    "That's a great question. Let me connect you with a human agent who can provide more detailed assistance.",
  ],
};

function getBotResponse(userMsg: string): string {
  const lower = userMsg.toLowerCase();
  if (lower.includes("deposit") || lower.includes("fund") || lower.includes("add money")) return botResponses.deposit[Math.floor(Math.random() * botResponses.deposit.length)];
  if (lower.includes("withdraw") || lower.includes("payout") || lower.includes("take out")) return botResponses.withdraw[Math.floor(Math.random() * botResponses.withdraw.length)];
  if (lower.includes("account") || lower.includes("register") || lower.includes("sign up") || lower.includes("open")) return botResponses.account[Math.floor(Math.random() * botResponses.account.length)];
  if (lower.includes("leverage") || lower.includes("margin")) return botResponses.leverage[Math.floor(Math.random() * botResponses.leverage.length)];
  if (lower.includes("platform") || lower.includes("mt4") || lower.includes("mt5") || lower.includes("app")) return botResponses.platform[Math.floor(Math.random() * botResponses.platform.length)];
  if (lower.includes("support") || lower.includes("help") || lower.includes("contact") || lower.includes("agent")) return botResponses.support[Math.floor(Math.random() * botResponses.support.length)];
  return botResponses.default[Math.floor(Math.random() * botResponses.default.length)];
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

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg: ChatMessage = { id: Date.now().toString(), sender: "user", text: input, timestamp: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);
    setTimeout(() => {
      const botMsg: ChatMessage = { id: (Date.now() + 1).toString(), sender: "bot", text: getBotResponse(input), timestamp: new Date() };
      setMessages((prev) => [...prev, botMsg]);
      setIsTyping(false);
    }, 1500);
  };

  const handleQuickReply = (text: string) => {
    const userMsg: ChatMessage = { id: Date.now().toString(), sender: "user", text, timestamp: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);
    setTimeout(() => {
      const botMsg: ChatMessage = { id: (Date.now() + 1).toString(), sender: "bot", text: getBotResponse(text), timestamp: new Date() };
      setMessages((prev) => [...prev, botMsg]);
      setIsTyping(false);
    }, 1200);
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
                <h3 className="text-white font-bold text-sm">Axi Live Support</h3>
                <p className="text-white/50 text-xs flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-[#22A958]" /> Online
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
                Need human support? <a href="mailto:support@axi.com" className="text-[#D31C2B] font-bold">Email us</a> or call <span className="font-bold">+1-800-AXI-TRADE</span>
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

import { useState, useRef, useEffect, useCallback, type KeyboardEvent } from 'react';
import {
  MessageCircle,
  X,
  Send,
  Headphones,
  User,
  ShoppingBag,
  HelpCircle,
  Phone,
} from 'lucide-react';

type MessageType = 'text' | 'quick_reply' | 'product_recommendation';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'agent';
  timestamp: Date;
  type?: MessageType;
  options?: string[];
}

const createId = () =>
  `${Date.now()}-${Math.random().toString(36).slice(2)}`;

const pick = (items: string[]) =>
  items[Math.floor(Math.random() * items.length)];

const formatTime = (date: Date) =>
  new Intl.DateTimeFormat('en-GB', {
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);

const initialMessage: Message = {
  id: createId(),
  text: 'Hi, welcome to Vendr. I can help with products, orders, sizing, returns, or support. What do you need?',
  sender: 'agent',
  timestamp: new Date(),
  type: 'quick_reply',
  options: ['Browse Products', 'Track Order', 'Customer Support', 'Size Guide'],
};

export function SupportChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([initialMessage]);
  const [inputValue, setInputValue] = useState('');
  const [showNotification, setShowNotification] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const notificationTimeoutRef = useRef<number | null>(null);
  const responseTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    const showTimer = window.setTimeout(() => {
      setShowNotification(true);
      notificationTimeoutRef.current = window.setTimeout(() => {
        setShowNotification(false);
      }, 5000);
    }, 3000);

    return () => {
      window.clearTimeout(showTimer);
      if (notificationTimeoutRef.current) window.clearTimeout(notificationTimeoutRef.current);
      if (responseTimeoutRef.current) window.clearTimeout(responseTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  useEffect(() => {
    if (!isOpen) return;
    inputRef.current?.focus();
    const onKeyDown = (e: globalThis.KeyboardEvent) => { if (e.key === 'Escape') setIsOpen(false); };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen]);

  const generateResponse = useCallback((userMessage: string): Message => {
    const msg = userMessage.toLowerCase();

    if (msg.includes("recommend") || msg.includes("suggest") || msg.includes("looking for") || msg.includes("browse") || msg.includes("products")) {
      return {
        id: createId(),
        text: pick([
          "Here are a few items people usually go for. Tell me if you want something more specific.",
          "A few popular options are below. I can narrow them down if you have a style or budget in mind.",
          "These are some common picks. I can make better suggestions if you tell me what you're looking for.",
        ]),
        sender: "agent",
        timestamp: new Date(),
        type: "product_recommendation",
      };
    } else if (msg.includes("order") || msg.includes("track") || msg.includes("status")) {
      return {
        id: createId(),
        text: pick([
          "Sure, I can check that. Send me your order number.",
          "No problem, I can look that up. What's your order number?",
          "Let's check that. Do you have your order number?",
        ]),
        sender: "agent",
        timestamp: new Date(),
        type: "quick_reply",
        options: ["I have an order number", "How do I find my order number?"],
      };
    } else if (msg.includes("help") || msg.includes("support") || msg.includes("problem") || msg.includes("contact")) {
      return {
        id: createId(),
        text: pick([
          "Okay, what seems to be the issue?",
          "Sure, what do you need help with?",
          "I can help with that. What happened?",
        ]),
        sender: "agent",
        timestamp: new Date(),
        type: "quick_reply",
        options: ["Return/Exchange", "Payment Issues", "Shipping Info", "Speak to Human"],
      };
    } else if (msg.includes("speak to human") || msg.includes("human") || msg.includes("agent") || msg.includes("representative")) {
      return {
        id: createId(),
        text: pick([
          "Of course — email support@vendr.com or call +1 (312) 555-0148 and a real person will take it from here.",
          "No problem, here's a direct line to the team: support@vendr.com or +1 (312) 555-0148.",
          "Sure thing. Reach a person directly at support@vendr.com or +1 (312) 555-0148, Mon–Fri 9am–6pm GMT.",
        ]),
        sender: "agent",
        timestamp: new Date(),
        type: "quick_reply",
        options: ["Track Order", "Return/Exchange", "Browse Products"],
      };
    } else if (msg.includes("size") || msg.includes("fit") || msg.includes("measurement")) {
      return {
        id: createId(),
        text: pick([
          "Sizing can vary a bit. Do you want a size chart or help choosing?",
          "Sure. I can show the size guide or help you pick based on your measurements.",
          "I can help with sizing. Are you looking for a chart or a recommendation?",
        ]),
        sender: "agent",
        timestamp: new Date(),
        type: "quick_reply",
        options: ["Show me the size guide", "How to measure", "Size recommendations"],
      };
    } else if (msg.includes("shipping") || msg.includes("delivery") || msg.includes("when")) {
      return {
        id: createId(),
        text: pick([
          "Standard delivery takes 3–5 days. Express is usually 1–2 days.",
          "Most orders arrive in 3–5 business days. Express delivery is usually faster.",
          "Shipping depends on the option you choose. Standard is usually 3–5 days.",
        ]),
        sender: "agent",
        timestamp: new Date(),
        type: "quick_reply",
        options: ["Calculate shipping", "International rates", "Express options"],
      };
    } else if (msg.includes("return") || msg.includes("exchange") || msg.includes("refund")) {
      return {
        id: createId(),
        text: pick([
          "You can return items within 30 days if they're unused. What do you want to do?",
          "Returns are accepted within 30 days for unused items with tags. Do you want to start one?",
          "I can help with that. Is this for a return, exchange, or refund?",
        ]),
        sender: "agent",
        timestamp: new Date(),
        type: "quick_reply",
        options: ["Start return process", "Return policy details", "Return shipping"],
      };
    }

    return {
      id: createId(),
      text: pick([
        "I'm not fully sure what you mean yet. Can you tell me a bit more?",
        "I can help with that, but I need a little more detail.",
        "Could you give me a bit more information so I can point you in the right direction?",
      ]),
      sender: "agent",
      timestamp: new Date(),
      type: "quick_reply",
      options: ["Browse Products", "Track Order", "Customer Support"],
    };
  }, []);

  const handleSendMessage = useCallback(
    (text?: string) => {
      const messageText = (text ?? inputValue).trim();
      if (!messageText || isTyping) return;

      const userMessage: Message = {
        id: createId(),
        text: messageText,
        sender: 'user',
        timestamp: new Date(),
        type: 'text',
      };

      setMessages(prev => [...prev, userMessage]);
      setInputValue('');
      setIsTyping(true);

      if (responseTimeoutRef.current) window.clearTimeout(responseTimeoutRef.current);

      responseTimeoutRef.current = window.setTimeout(() => {
        setMessages(prev => [...prev, generateResponse(messageText)]);
        setIsTyping(false);
      }, 700 + Math.random() * 600);
    },
    [inputValue, isTyping, generateResponse]
  );

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {showNotification && !isOpen && (
        <div className="fixed bottom-24 right-6 bg-card rounded-xl shadow-lift border border-border p-4 max-w-xs z-40 animate-fade-in">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center shrink-0">
              <Headphones className="w-5 h-5 text-primary-foreground" aria-hidden="true" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-foreground font-medium mb-1">Need help?</p>
              <p className="text-xs text-muted-foreground">
                You can ask about orders, products, or returns.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowNotification(false)}
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Dismiss notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={() => { setShowNotification(false); setIsOpen(true); }}
              className="flex-1 bg-primary text-primary-foreground text-xs px-3 py-2 rounded-lg hover:bg-primary-hover transition-colors"
            >
              Open chat
            </button>
            <button
              type="button"
              onClick={() => setShowNotification(false)}
              className="text-xs text-muted-foreground hover:text-foreground px-3 py-2 transition-colors"
            >
              Not now
            </button>
          </div>
        </div>
      )}

      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 bg-primary text-primary-foreground p-3.5 rounded-full shadow-lift hover:bg-primary-hover transition-colors z-50"
          aria-label="Open chat"
        >
          <MessageCircle className="w-5 h-5" />
        </button>
      )}

      {isOpen && (
        <div
          role="dialog"
          aria-label="Support chat"
          className="fixed bottom-6 right-6 w-[calc(100vw-3rem)] max-w-96 h-[min(600px,calc(100vh-3rem))] bg-card rounded-xl shadow-lift border border-border z-50 flex flex-col overflow-hidden"
        >
          <div className="bg-primary text-primary-foreground p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center">
                <Headphones className="w-5 h-5" aria-hidden="true" />
              </div>
              <div>
                <h3 className="font-bold text-sm">Support</h3>
                <p className="text-xs text-primary-foreground/60">Available</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-primary-foreground/60 hover:text-primary-foreground transition-colors"
              aria-label="Close chat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div
            role="log"
            aria-live="polite"
            aria-label="Chat messages"
            className="flex-1 overflow-y-auto p-4 space-y-4 bg-surface"
          >
            {messages.map(message => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    message.sender === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-card text-foreground border border-border'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    {message.sender === 'agent' ? (
                      <Headphones className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
                    ) : (
                      <User className="w-4 h-4 text-primary-foreground/60" aria-hidden="true" />
                    )}
                    <span className={`text-xs ${message.sender === 'user' ? 'text-primary-foreground/50' : 'text-muted-foreground'}`}>
                      {formatTime(message.timestamp)}
                    </span>
                  </div>

                  <p className="text-sm leading-relaxed">{message.text}</p>

                  {message.type === 'quick_reply' && message.options && (
                    <div className="mt-3 space-y-2">
                      {message.options.map(option => (
                        <button
                          type="button"
                          key={option}
                          onClick={() => handleSendMessage(option)}
                          disabled={isTyping}
                          className="block w-full text-left bg-secondary hover:bg-border disabled:opacity-50 text-foreground text-xs px-3 py-2 rounded-lg transition-colors"
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  )}

                  {message.type === 'product_recommendation' && (
                    <div className="mt-3 bg-secondary rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <ShoppingBag className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
                        <span className="text-xs font-semibold text-foreground">Recommended items</span>
                      </div>
                      <div className="space-y-1 text-xs">
                        {[
                          ['Premium Leather Wallet', '$89.99'],
                          ['Designer Sunglasses',    '$149.99'],
                          ['Luxury Watch',           '$299.99'],
                        ].map(([name, price]) => (
                          <div key={name} className="flex justify-between gap-4">
                            <span className="text-muted-foreground">{name}</span>
                            <span className="font-semibold text-foreground">{price}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-card border border-border rounded-2xl px-4 py-3 max-w-[80%]" aria-label="Support is typing" role="status">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 border-t border-border bg-card">
            <div className="flex gap-2">
              <label htmlFor="support-chat-input" className="sr-only">Type a message</label>
              <input
                id="support-chat-input"
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a message"
                className="flex-1 px-4 py-2 bg-surface border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
              />
              <button
                type="button"
                onClick={() => handleSendMessage()}
                disabled={!inputValue.trim() || isTyping}
                className="bg-primary text-primary-foreground p-2 rounded-xl hover:bg-primary-hover disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                aria-label="Send message"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>

            <div className="flex gap-2 mt-3">
              <button
                type="button"
                onClick={() => handleSendMessage('Help with order')}
                disabled={isTyping}
                className="flex-1 bg-surface border border-border text-muted-foreground px-3 py-2 rounded-lg text-xs hover:bg-surface-strong disabled:opacity-50 transition-colors"
              >
                <HelpCircle className="w-3 h-3 inline mr-1" aria-hidden="true" />
                Order
              </button>
              <button
                type="button"
                onClick={() => handleSendMessage('Size guide')}
                disabled={isTyping}
                className="flex-1 bg-surface border border-border text-muted-foreground px-3 py-2 rounded-lg text-xs hover:bg-surface-strong disabled:opacity-50 transition-colors"
              >
                <ShoppingBag className="w-3 h-3 inline mr-1" aria-hidden="true" />
                Size
              </button>
              <button
                type="button"
                onClick={() => handleSendMessage('Contact support')}
                disabled={isTyping}
                className="flex-1 bg-surface border border-border text-muted-foreground px-3 py-2 rounded-lg text-xs hover:bg-surface-strong disabled:opacity-50 transition-colors"
              >
                <Phone className="w-3 h-3 inline mr-1" aria-hidden="true" />
                Support
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

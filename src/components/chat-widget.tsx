'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { MessageCircle, X, Send, Bot, Loader2, ChevronDown } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  streaming?: boolean;
  toolHint?: string; // shown while a tool call is running
}

interface ChatWidgetProps {
  restaurantId: string;
  restaurantName: string;
  accentColor?: string; // hex, defaults to var(--color-action-primary)
}

// ─── SSE parser helpers ───────────────────────────────────────────────────────

type SSEEvent =
  | { type: 'token'; content: string }
  | { type: 'tool_start'; tool: string }
  | { type: 'done' }
  | { type: 'error'; content: string };

const TOOL_HINTS: Record<string, string> = {
  get_catalog: 'Consultando cardápio…',
  get_restaurant_info: 'Buscando informações do restaurante…',
  get_business_hours: 'Verificando horários…',
  get_order_status: 'Consultando pedido…',
};

// ─── ChatWidget ───────────────────────────────────────────────────────────────

export default function ChatWidget({ restaurantId, restaurantName, accentColor }: ChatWidgetProps) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `Olá! 👋 Sou o Appé, assistente virtual do **${restaurantName}**. Como posso ajudar?`,
    },
  ]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when drawer opens
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 150);
  }, [open]);

  const history = messages
    .filter((m) => !m.streaming && m.content.trim())
    .map((m) => ({ role: m.role, content: m.content }));

  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || streaming) return;

    setInput('');
    setStreaming(true);

    const userMsg: Message = { id: crypto.randomUUID(), role: 'user', content: text };
    const assistantId = crypto.randomUUID();
    const assistantMsg: Message = {
      id: assistantId,
      role: 'assistant',
      content: '',
      streaming: true,
    };

    setMessages((prev) => [...prev, userMsg, assistantMsg]);

    try {
      const controller = new AbortController();
      abortRef.current = controller;

      const res = await fetch(`/api/ai-chat/${restaurantId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, history }),
        signal: controller.signal,
      });

      if (!res.ok || !res.body) {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? {
                  ...m,
                  content: 'Desculpe, não consegui processar sua mensagem. Tente novamente.',
                  streaming: false,
                }
              : m,
          ),
        );
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let finalContent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const raw = line.slice(6).trim();
          if (!raw) continue;

          let evt: SSEEvent;
          try {
            evt = JSON.parse(raw);
          } catch {
            continue;
          }

          if (evt.type === 'token') {
            finalContent += evt.content;
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantId ? { ...m, content: finalContent, toolHint: undefined } : m,
              ),
            );
          } else if (evt.type === 'tool_start') {
            const hint = TOOL_HINTS[evt.tool] ?? 'Consultando…';
            setMessages((prev) =>
              prev.map((m) => (m.id === assistantId ? { ...m, toolHint: hint } : m)),
            );
          } else if (evt.type === 'done' || evt.type === 'error') {
            if (evt.type === 'error') {
              finalContent = finalContent || 'Ocorreu um erro. Tente novamente.';
            }
            break;
          }
        }
      }

      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId
            ? {
                ...m,
                content: finalContent || 'Desculpe, não consegui responder.',
                streaming: false,
                toolHint: undefined,
              }
            : m,
        ),
      );
    } catch (err) {
      if ((err as Error).name === 'AbortError') return;
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId
            ? { ...m, content: 'Erro de conexão. Tente novamente.', streaming: false }
            : m,
        ),
      );
    } finally {
      setStreaming(false);
      abortRef.current = null;
    }
  }, [input, streaming, restaurantId, history]);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  // Simple markdown bold renderer
  function renderContent(text: string) {
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) =>
      part.startsWith('**') && part.endsWith('**') ? (
        <strong key={i}>{part.slice(2, -2)}</strong>
      ) : (
        <span key={i}>{part}</span>
      ),
    );
  }

  const bubbleStyle = accentColor ? { backgroundColor: accentColor } : undefined;
  const fabStyle = accentColor ? { backgroundColor: accentColor } : undefined;

  return (
    <>
      {/* ── Floating Action Button ───────────────────────────── */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-24 right-4 z-40 h-14 w-14 rounded-full bg-action-primary text-white shadow-lg flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
        style={fabStyle}
        aria-label="Abrir chat de atendimento"
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
        {!open && messages.length > 1 && (
          <span className="absolute -top-1 -right-1 h-4 w-4 bg-status-error rounded-full text-[10px] font-bold flex items-center justify-center">
            {Math.min(messages.filter((m) => m.role === 'assistant').length - 1, 9)}
          </span>
        )}
      </button>

      {/* ── Chat Drawer ──────────────────────────────────────── */}
      <div
        className={`fixed bottom-0 right-0 md:right-4 md:bottom-4 z-50 w-full md:w-[380px] flex flex-col bg-surface-card md:rounded-radius-2xl shadow-lg border border-border-subtle overflow-hidden transition-all duration-300 ${open ? 'h-[520px] md:h-[500px] opacity-100 pointer-events-auto' : 'h-0 opacity-0 pointer-events-none'}`}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-4 py-3 text-white shrink-0"
          style={bubbleStyle ?? { backgroundColor: 'var(--color-action-primary)' }}
        >
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center">
              <Bot className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-bold leading-none">Appé</p>
              <p className="text-[11px] opacity-80 mt-0.5">{restaurantName}</p>
            </div>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="text-white/70 hover:text-white transition"
          >
            <ChevronDown className="h-5 w-5" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'assistant' && (
                <div className="h-6 w-6 rounded-full bg-action-primary/10 flex items-center justify-center mr-2 mt-0.5 shrink-0">
                  <Bot className="h-3 w-3 text-action-primary" />
                </div>
              )}
              <div
                className={`max-w-[80%] rounded-radius-xl px-3 py-2 text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'text-white rounded-br-sm'
                    : 'bg-surface-subtle text-text-primary rounded-bl-sm'
                }`}
                style={
                  msg.role === 'user'
                    ? (bubbleStyle ?? { backgroundColor: 'var(--color-action-primary)' })
                    : undefined
                }
              >
                {msg.toolHint ? (
                  <span className="flex items-center gap-2 text-text-muted text-xs">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    {msg.toolHint}
                  </span>
                ) : (
                  <span>
                    {renderContent(msg.content)}
                    {msg.streaming && !msg.content && (
                      <span className="inline-flex items-center gap-1 text-text-muted text-xs ml-1">
                        <Loader2 className="h-3 w-3 animate-spin" />
                      </span>
                    )}
                    {msg.streaming && msg.content && (
                      <span className="inline-block w-0.5 h-3.5 bg-text-primary ml-0.5 animate-pulse align-middle" />
                    )}
                  </span>
                )}
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="px-4 py-3 border-t border-border-subtle shrink-0 flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Digite sua mensagem…"
            disabled={streaming}
            className="flex-1 rounded-full border border-border-default bg-surface-subtle px-4 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-border-focus transition disabled:opacity-60"
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || streaming}
            className="h-9 w-9 rounded-full bg-action-primary text-white flex items-center justify-center hover:bg-action-primary-hover active:scale-90 transition disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
            style={fabStyle}
            aria-label="Enviar"
          >
            {streaming ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>
    </>
  );
}

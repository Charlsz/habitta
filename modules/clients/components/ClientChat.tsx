"use client";

import { useEffect, useRef, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

interface Message {
  id:         string;
  role:       'user' | 'assistant' | 'system';
  content:    string;
  created_at: string;
}

interface Props {
  sessionId:       string;
  initialMessages: Message[];
}

export function ClientChat({ sessionId, initialMessages }: Props) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`chat:${sessionId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'chat_messages', filter: `session_id=eq.${sessionId}` },
        (payload) => setMessages((prev) => [...prev, payload.new as Message])
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [sessionId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const visible = messages.filter((m) => m.role !== 'system');

  if (!visible.length) {
    return <p className="text-sm text-[var(--foreground)]/40">No hay mensajes en este chat todavía.</p>;
  }

  return (
    <div className="flex flex-col gap-2 max-h-80 overflow-y-auto pr-1">
      {visible.map((m) => (
        <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-start' : 'justify-end'}`}>
          <div
            className={`max-w-[75%] px-3 py-2 rounded-2xl text-sm leading-relaxed ${
              m.role === 'user'
                ? 'bg-[var(--surface)] text-[var(--foreground)] rounded-tl-sm'
                : 'text-white rounded-tr-sm'
            }`}
            style={m.role === 'assistant' ? { backgroundColor: '#d4a373' } : undefined}
          >
            <p>{m.content}</p>
            <p className="text-[10px] opacity-50 mt-1 text-right">
              {new Date(m.created_at).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        </div>
      ))}
      <div ref={bottomRef} />
    </div>
  );
}

'use client';

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { sendMessage, getMessages } from "@/actions/chat";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Send, User } from "lucide-react";
import { Database } from "@/types/database.types";
import { MessageBubble } from "@/components/admin/chat/message-bubble";

type Message = Database['public']['Tables']['team_chat']['Row'];

export function TeamUplink() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    // Initial fetch
    getMessages().then(setMessages);

    // Realtime subscription
    const channel = supabase
      .channel('team_chat')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'team_chat',
        },
        (payload) => {
          setMessages((current) => [...current, payload.new as Message]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    // Optimistic update could happen here, but we'll wait for the server action/subscription
    // to keep it simple and consistent.
    await sendMessage(newMessage);
    setNewMessage("");
  };

  return (
    <Card className="flex h-[600px] flex-col border-slate-800 bg-navy-900/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          SECURE UPLINK V1
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto space-y-4 p-4">
        {messages.length === 0 && (
            <div className="flex h-full items-center justify-center text-slate-500">
                <p>Channel secure. No transmission history.</p>
            </div>
        )}
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
        <div ref={messagesEndRef} />
      </CardContent>
      <CardFooter className="p-4 border-t border-slate-800">
        <form onSubmit={handleSend} className="flex w-full gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Enter secure message..."
            className="flex-1 border-slate-700 bg-navy-950"
          />
          <Button type="submit" size="icon" variant="cyber">
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
}

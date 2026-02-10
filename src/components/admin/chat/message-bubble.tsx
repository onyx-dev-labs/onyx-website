import { cn } from "@/lib/utils/cn";
import { Database } from "@/types/database.types";

type Message = Database['public']['Tables']['team_chat']['Row'];

interface MessageBubbleProps {
  message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isAdmin = message.sender_role === 'Admin';
  
  return (
    <div
      className={cn(
        "flex flex-col",
        isAdmin ? "items-end" : "items-start"
      )}
    >
      <div className="flex items-center gap-2 mb-1">
        <span className="text-xs font-mono text-cyan-500">{message.sender_name}</span>
        <span className="text-[10px] text-slate-600">
          {new Date(message.created_at).toLocaleTimeString()}
        </span>
      </div>
      <div
        className={cn(
          "max-w-[80%] rounded-lg px-4 py-2 text-sm",
          isAdmin
            ? "bg-cyan-500/20 text-cyan-100 border border-cyan-500/30"
            : "bg-slate-800 text-slate-200 border border-slate-700"
        )}
      >
        {message.content}
      </div>
    </div>
  );
}

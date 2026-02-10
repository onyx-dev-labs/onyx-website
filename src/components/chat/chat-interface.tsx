'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Conversation, Message, Profile } from '@/types/chat';
import { getConversations, getMessages, sendMessage, createDirectConversation, markAsRead } from '@/actions/chat-system';
import { uploadFile } from '@/lib/storage-client';
import { cn } from '@/lib/utils/cn';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { formatDistanceToNow } from 'date-fns';
import { 
  Search, Plus, MoreVertical, Phone, Video, 
  Paperclip, Mic, Send, Image as ImageIcon,
  Check, CheckCheck, Circle, Settings
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ChatInterfaceProps {
  currentUser: Profile;
  initialConversations: Conversation[];
  allProfiles: Profile[]; // For starting new chats
}

import { ProfileSettingsDialog } from '@/components/chat/profile-settings';

export function ChatInterface({ currentUser, initialConversations, allProfiles }: ChatInterfaceProps) {
  const [conversations, setConversations] = useState<Conversation[]>(initialConversations);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [messageInput, setMessageInput] = useState('');
  const [isNewChatOpen, setIsNewChatOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const [typingUsers, setTypingUsers] = useState<Record<string, NodeJS.Timeout>>({});
  const [profiles, setProfiles] = useState<Profile[]>(allProfiles);
  const profilesRef = useRef(profiles);

  useEffect(() => {
    profilesRef.current = profiles;
  }, [profiles]);
  
  const supabase = createClient();
  const { addToast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const activeConversation = conversations.find(c => c.id === activeConversationId);

  // Subscribe to Profile updates (New users)
  useEffect(() => {
    const channel = supabase.channel('profile_updates')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'profiles' 
      }, (payload) => {
        try {
          if (payload.eventType === 'INSERT') {
            const newProfile = payload.new as Profile;
            setProfiles(prev => {
              if (prev.find(p => p.id === newProfile.id)) return prev;
              return [...prev, newProfile].sort((a, b) => 
                (a.display_name || '').localeCompare(b.display_name || '')
              );
            });
          } else if (payload.eventType === 'UPDATE') {
            const updatedProfile = payload.new as Profile;
            
            setProfiles(prev => prev.map(p => 
              p.id === updatedProfile.id ? updatedProfile : p
            ));
            
            // Update conversations participants to keep avatars/status fresh
            setConversations(prev => prev.map(c => {
               if (c.participants?.some(p => p.id === updatedProfile.id)) {
                 return {
                   ...c,
                   participants: c.participants.map(p => 
                     p.id === updatedProfile.id 
                       ? { ...updatedProfile, last_read_at: p.last_read_at } // Preserve last_read_at
                       : p
                   )
                 };
               }
               return c;
            }));
          }
        } catch (error) {
          console.error('Error handling profile update:', error);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  // Presence & Typing Subscriptions
  useEffect(() => {
    if (!currentUser?.id) return;

    const presenceChannel = supabase.channel('global_presence')
      .on('presence', { event: 'sync' }, () => {
        const state = presenceChannel.presenceState();
        const online = new Set<string>();
        Object.values(state).forEach((presences: any) => {
          presences.forEach((p: any) => {
            if (p.user_id) online.add(p.user_id);
          });
        });
        setOnlineUsers(online);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await presenceChannel.track({ 
            user_id: currentUser.id, 
            online_at: new Date().toISOString() 
          });
        }
      });

    const typingChannel = supabase.channel('chat_typing')
      .on('broadcast', { event: 'typing' }, ({ payload }) => {
        if (payload.conversationId === activeConversationId && payload.userId !== currentUser.id) {
          setTypingUsers(prev => {
            const newState = { ...prev };
            // Clear existing timeout if any
            if (newState[payload.userId]) clearTimeout(newState[payload.userId]);
            
            // Set new timeout to clear typing status after 3s
            newState[payload.userId] = setTimeout(() => {
              setTypingUsers(curr => {
                const updated = { ...curr };
                delete updated[payload.userId];
                return updated;
              });
            }, 3000);
            
            return newState;
          });
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(presenceChannel);
      supabase.removeChannel(typingChannel);
    };
  }, [currentUser.id, activeConversationId, supabase]);

  const handleTyping = async () => {
    if (!activeConversationId) return;
    await supabase.channel('chat_typing').send({
      type: 'broadcast',
      event: 'typing',
      payload: { conversationId: activeConversationId, userId: currentUser.id }
    });
  };

  // Heartbeat for Online Status
  useEffect(() => {
    const updateStatus = async () => {
       await supabase.from('profiles').update({ 
         status: 'online',
         last_seen: new Date().toISOString()
       }).eq('id', currentUser.id);
    };

    // Update on mount
    updateStatus();

    // Update every minute to keep status fresh
    const interval = setInterval(updateStatus, 60000);
    
    // Attempt to set offline on unmount (best effort)
    return () => {
      clearInterval(interval);
      // We use navigator.sendBeacon or similar if possible, but here we just fire and forget
      supabase.from('profiles').update({ 
        status: 'offline',
        last_seen: new Date().toISOString()
      }).eq('id', currentUser.id).then();
    };
  }, [supabase, currentUser.id]);

  // Subscribe to Realtime changes (Messages and Participants)
  useEffect(() => {
    const channel = supabase.channel('chat_updates')
      .on('postgres_changes', {
        event: '*', // Listen to all events (INSERT, UPDATE)
        schema: 'public',
        table: 'messages'
      }, (payload) => {
        try {
          if (payload.eventType === 'INSERT') {
            const newMessage = payload.new as Message;
            // Hydrate sender profile
            newMessage.sender = profilesRef.current.find(p => p.id === newMessage.sender_id);
            
            // Update messages if in active conversation
            if (newMessage.conversation_id === activeConversationId) {
              setMessages(prev => {
                // Remove optimistic message if it matches (simple heuristic)
                const filtered = prev.filter(m => {
                  const isOptimistic = m.id.startsWith('temp-');
                  if (isOptimistic && 
                      m.sender_id === newMessage.sender_id && 
                      m.content === newMessage.content) {
                    return false;
                  }
                  return true;
                });
                
                // Avoid duplicates
                if (filtered.some(m => m.id === newMessage.id)) return filtered;
                
                return [...filtered, newMessage];
              });
              scrollToBottom();
              
              // If I am NOT the sender, mark as read immediately since I'm looking at it
              if (newMessage.sender_id !== currentUser.id) {
                 markAsRead(activeConversationId);
              }
            }

            // Update conversation last_message preview
            setConversations(prev => prev.map(c => {
              if (c.id === newMessage.conversation_id) {
                return {
                  ...c,
                  last_message: newMessage,
                  last_message_at: newMessage.created_at,
                  unread_count: c.id === activeConversationId ? 0 : (c.unread_count || 0) + 1
                };
              }
              return c;
            }).sort((a, b) => new Date(b.last_message_at || 0).getTime() - new Date(a.last_message_at || 0).getTime()));

          } else if (payload.eventType === 'UPDATE') {
            const updatedMessage = payload.new as Message;
            // Update message in current view (e.g. read status)
            if (updatedMessage.conversation_id === activeConversationId) {
               setMessages(prev => prev.map(m => {
                 if (m.id === updatedMessage.id) {
                   return {
                     ...m,
                     ...updatedMessage,
                     // Preserve sender if it was already there, or try to find it
                     sender: m.sender || profilesRef.current.find(p => p.id === updatedMessage.sender_id)
                   };
                 }
                 return m;
               }));
            }
          }
        } catch (error) {
          console.error('Error handling message update:', error);
        }
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'conversation_participants'
      }, (payload) => {
        try {
          if (payload.eventType === 'UPDATE' || payload.eventType === 'INSERT') {
             const newParticipant = payload.new as any;
             
             setConversations(prev => prev.map(c => {
               if (c.id === newParticipant.conversation_id) {
                 // Update the participant in the list
                 const updatedParticipants = c.participants?.map(p => {
                   if (p.id === newParticipant.user_id) {
                     return { ...p, last_read_at: newParticipant.last_read_at };
                   }
                   return p;
                 });
                 
                 // Also update unread count if it's me
                 const unreadUpdate = newParticipant.user_id === currentUser.id 
                   ? { unread_count: newParticipant.unread_count } 
                   : {};
  
                 return { ...c, participants: updatedParticipants, ...unreadUpdate };
               }
               return c;
             }));
          }
        } catch (error) {
          console.error('Error handling participant update:', error);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeConversationId, supabase, currentUser.id]);

  // Fetch messages when active conversation changes
  useEffect(() => {
    if (activeConversationId) {
      setIsLoadingMessages(true);
      markAsRead(activeConversationId); // Mark as read when opening
      getMessages(activeConversationId)
        .then(msgs => {
          setMessages(msgs);
          scrollToBottom();
        })
        .finally(() => setIsLoadingMessages(false));
    }
  }, [activeConversationId]);

  useEffect(() => {
    setTypingUsers({});
  }, [activeConversationId]);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!messageInput.trim() || !activeConversationId) return;

    const content = messageInput;
    setMessageInput(''); // Optimistic clear

    // Optimistic Update
    const optimisticId = `temp-${Date.now()}`;
    const optimisticMessage: Message = {
      id: optimisticId,
      conversation_id: activeConversationId,
      sender_id: currentUser.id,
      content: content,
      type: 'text',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      is_read: false,
      file_url: null,
      is_edited: false,
      reply_to_id: null
    };

    setMessages(prev => [...prev, optimisticMessage]);
    scrollToBottom();

    try {
      await sendMessage(activeConversationId, content);
      // Realtime subscription will handle the UI update (and replace/dedupe ideally)
      // Note: We might want to remove the optimistic message once the real one arrives
      // but for now, let's keep it simple. Realtime usually arrives fast.
    } catch (error) {
      console.error('Failed to send message:', error);
      addToast("Failed to send message", 'error');
      setMessageInput(content); // Restore on failure
      setMessages(prev => prev.filter(m => m.id !== optimisticId)); // Remove optimistic
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeConversationId) return;

    if (file.size > 10 * 1024 * 1024) {
      addToast("File too large. Max 10MB.", "error");
      return;
    }

    setIsUploading(true);
    try {
      const publicUrl = await uploadFile('chat-attachments', file);
      const type = file.type.startsWith('image/') ? 'image' : 'file';
      
      // Send message with attachment
      await sendMessage(activeConversationId, file.name, type, publicUrl);
    } catch (error) {
      console.error('Upload failed:', error);
      addToast("Failed to upload file", "error");
    } finally {
      setIsUploading(false);
      // Reset input
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleCreateChat = async (userId: string) => {
    try {
      // Check if we already have a direct chat with this user
      // Ideally handled by backend, but here for UI responsiveness
      const existing = conversations.find(c => 
        c.type === 'direct' && c.participants?.some(p => p.id === userId)
      );

      if (existing) {
        setActiveConversationId(existing.id);
        setIsNewChatOpen(false);
        return;
      }

      const newConvId = await createDirectConversation(userId);
      // Refresh conversations (or handle optimistically if we had the full conv object)
      const updatedConvs = await getConversations();
      setConversations(updatedConvs);
      setActiveConversationId(newConvId);
      setIsNewChatOpen(false);
    } catch (error) {
      console.error('Error creating chat:', error);
      addToast("Failed to create chat", 'error');
    }
  };

  const getOtherParticipant = (conv: Conversation | null | undefined) => {
    if (!conv?.participants) return undefined;
    return conv.participants.find(p => p.id !== currentUser.id);
  };

  return (
    <div className="flex h-[calc(100vh-120px)] overflow-hidden rounded-xl border border-slate-800 bg-navy-950 shadow-2xl">
      <ProfileSettingsDialog 
        profile={currentUser} 
        open={isProfileOpen} 
        onOpenChange={setIsProfileOpen} 
      />

      {/* Sidebar - Chat List */}
      <div className={cn(
        "w-full md:w-[350px] flex flex-col border-r border-slate-800 bg-navy-900/50",
        activeConversationId ? "hidden md:flex" : "flex"
      )}>
        {/* Sidebar Header */}
        <div className="p-4 bg-navy-900 border-b border-slate-800 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Avatar 
              className="h-10 w-10 border-2 border-cyan-500/30 cursor-pointer hover:border-cyan-500 transition-colors"
              onClick={() => setIsProfileOpen(true)}
            >
              <AvatarImage src={currentUser.avatar_url || ''} />
              <AvatarFallback className="bg-navy-800 text-cyan-500 font-mono">
                {currentUser.display_name?.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span 
              className="font-semibold text-white truncate max-w-[150px] cursor-pointer hover:text-cyan-500 transition-colors"
              onClick={() => setIsProfileOpen(true)}
            >
              {currentUser.display_name}
            </span>
          </div>
          <div className="flex gap-2">
            <Dialog open={isNewChatOpen} onOpenChange={setIsNewChatOpen}>
              <DialogTrigger asChild>
                <Button size="icon" variant="ghost" className="text-slate-400 hover:text-cyan-500">
                  <Plus className="h-5 w-5" />
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-navy-900 border-slate-800 text-white">
                <DialogHeader>
                  <DialogTitle>New Conversation</DialogTitle>
                </DialogHeader>
                <ScrollArea className="h-[300px] mt-4">
                  <div className="space-y-2">
                    {profiles.filter(p => p.id !== currentUser.id).map(profile => (
                      <div 
                        key={profile.id}
                        onClick={() => handleCreateChat(profile.id)}
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800 cursor-pointer transition-colors"
                      >
                        <div className="relative">
                          <Avatar>
                            <AvatarImage src={profile.avatar_url || ''} />
                            <AvatarFallback className="bg-navy-950 text-slate-400">
                              {profile.display_name?.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          {(onlineUsers.has(profile.id) || profile.status === 'online') && (
                            <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-navy-900" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-white">{profile.display_name}</p>
                          <p className="text-xs text-slate-400">{profile.email}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </DialogContent>
            </Dialog>
            <Button 
              size="icon" 
              variant="ghost" 
              className="text-slate-400 hover:text-cyan-500"
              onClick={() => setIsProfileOpen(true)}
            >
              <Settings className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="p-3">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
            <Input 
              placeholder="Search or start new chat" 
              className="pl-9 bg-navy-950 border-slate-800 text-slate-200 focus:border-cyan-500/50"
            />
          </div>
        </div>

        {/* Chat List */}
        <ScrollArea className="flex-1">
          <div className="space-y-1 p-2">
            {conversations.map(conv => {
              const other = getOtherParticipant(conv);
              const isActive = conv.id === activeConversationId;
              
              return (
                <div
                  key={conv.id}
                  onClick={() => setActiveConversationId(conv.id)}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all group",
                    isActive ? "bg-slate-800/80" : "hover:bg-slate-800/40"
                  )}
                >
                  <div className="relative">
                    <Avatar className="h-12 w-12 border border-slate-700">
                      <AvatarImage src={conv.type === 'direct' ? other?.avatar_url || '' : conv.group_image_url || ''} />
                      <AvatarFallback className="bg-navy-950 text-slate-400">
                        {conv.type === 'direct' 
                          ? other?.display_name?.substring(0, 2).toUpperCase() 
                          : conv.name?.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    {conv.type === 'direct' && other && (onlineUsers.has(other.id) || other.status === 'online') && (
                      <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full bg-emerald-500 ring-2 ring-navy-900" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-1">
                      <span className="font-medium text-slate-200 truncate">
                        {conv.type === 'direct' ? other?.display_name : conv.name}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {conv.last_message_at && formatDistanceToNow(new Date(conv.last_message_at), { addSuffix: false })}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="text-sm text-slate-400 truncate max-w-[180px]">
                        {conv.last_message?.content || "No messages yet"}
                      </p>
                      {!!conv.unread_count && conv.unread_count > 0 && (
                        <span className="bg-cyan-500 text-navy-950 text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                          {conv.unread_count}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </div>

      {/* Main Chat Area */}
      {activeConversation ? (
        <div className={cn(
          "flex-1 flex flex-col bg-navy-950 w-full",
          !activeConversationId ? "hidden md:flex" : "flex"
        )}>
          {/* Chat Header */}
          <div className="h-16 px-4 bg-navy-900 border-b border-slate-800 flex items-center justify-between shadow-sm z-10">
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                size="icon" 
                className="md:hidden text-slate-400 mr-1"
                onClick={() => setActiveConversationId(null)}
              >
                <span className="sr-only">Back</span>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M19 12H5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M12 19L5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </Button>
              
              <Avatar className="h-10 w-10 border border-slate-700">
                <AvatarImage src={
                  activeConversation.type === 'direct' 
                    ? getOtherParticipant(activeConversation)?.avatar_url || '' 
                    : activeConversation.group_image_url || ''
                } />
                <AvatarFallback className="bg-navy-950 text-cyan-500">
                  {activeConversation.type === 'direct' 
                    ? getOtherParticipant(activeConversation)?.display_name?.substring(0, 2).toUpperCase() 
                    : activeConversation.name?.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold text-white">
                  {activeConversation.type === 'direct' 
                    ? getOtherParticipant(activeConversation)?.display_name 
                    : activeConversation.name}
                </h3>
                <p className="text-xs text-slate-400 flex items-center gap-1">
                  {activeConversation.type === 'direct' && (
                    onlineUsers.has(getOtherParticipant(activeConversation)?.id || '') || 
                    getOtherParticipant(activeConversation)?.status === 'online'
                  ) ? (
                    <>
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      Online
                    </>
                  ) : (
                    "Offline"
                  )}
                </p>
              </div>
            </div>
            <div className="flex gap-1 text-slate-400">
              <Button size="icon" variant="ghost" className="hover:text-cyan-500 hover:bg-slate-800/50">
                <Search className="h-5 w-5" />
              </Button>
              <Button size="icon" variant="ghost" className="hover:text-cyan-500 hover:bg-slate-800/50">
                <MoreVertical className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Messages Area */}
          <div 
            className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-950/30"
            style={{
              backgroundImage: currentUser.wallpaper_url ? `url(${currentUser.wallpaper_url})` : 'none',
              backgroundSize: 'cover',
              backgroundBlendMode: 'overlay',
            }}
          >
            {/* Overlay for readability if wallpaper is present */}
            {currentUser.wallpaper_url && <div className="absolute inset-0 bg-navy-950/80 pointer-events-none" />}
            
            <div className="relative z-0 space-y-4">
              {messages.map((msg, idx) => {
                const isMe = msg.sender_id === currentUser.id;
                const showAvatar = !isMe && (idx === 0 || messages[idx - 1].sender_id !== msg.sender_id);
                
                // Calculate read status
                let isRead = false;
                if (isMe && activeConversation) {
                   const others = activeConversation.participants?.filter(p => p.id !== currentUser.id) || [];
                   if (others.length > 0) {
                      isRead = others.every(p => p.last_read_at && new Date(p.last_read_at) >= new Date(msg.created_at));
                   }
                }
                
                return (
                  <div 
                    key={msg.id} 
                    className={cn(
                      "flex w-full",
                      isMe ? "justify-end" : "justify-start"
                    )}
                  >
                    <div className={cn("flex max-w-[70%] gap-2", isMe ? "flex-row-reverse" : "flex-row")}>
                      {!isMe && (
                        <div className="w-8 flex-shrink-0">
                          {showAvatar && (
                            <Avatar className="h-8 w-8 mt-1">
                              <AvatarImage src={msg.sender?.avatar_url || ''} loading="lazy" />
                              <AvatarFallback className="bg-slate-800 text-xs text-slate-400">
                                {msg.sender?.display_name?.substring(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                          )}
                        </div>
                      )}
                      
                      <div className={cn(
                        "rounded-2xl px-4 py-2 shadow-sm relative group",
                        isMe 
                          ? "bg-cyan-700/20 border border-cyan-500/30 text-cyan-50 rounded-tr-none" 
                          : "bg-navy-800 border border-slate-700 text-slate-200 rounded-tl-none"
                      )}>
                        {/* Sender Name in Group Chat */}
                        {activeConversation.type === 'group' && !isMe && showAvatar && (
                          <p className="text-[10px] font-bold text-cyan-500 mb-1 opacity-80">
                            {msg.sender?.display_name}
                          </p>
                        )}
                        
                        {msg.type === 'image' && msg.file_url ? (
                          <div className="mb-2">
                            <img 
                              src={msg.file_url} 
                              alt="Attachment" 
                              loading="lazy"
                              className="max-w-[240px] max-h-[240px] rounded-lg border border-slate-700/50 cursor-pointer hover:opacity-90 transition-opacity"
                              onClick={() => window.open(msg.file_url!, '_blank')}
                            />
                          </div>
                        ) : msg.type === 'file' && msg.file_url ? (
                          <div className="mb-2">
                             <a 
                                href={msg.file_url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 p-2 rounded bg-slate-900/50 border border-slate-700 hover:bg-slate-900 transition-colors"
                             >
                                <Paperclip className="h-4 w-4 text-cyan-500" />
                                <span className="text-xs underline text-cyan-400 truncate max-w-[200px]">
                                  {msg.content}
                                </span>
                             </a>
                          </div>
                        ) : (
                          <p className="text-sm whitespace-pre-wrap leading-relaxed">
                            {msg.content}
                          </p>
                        )}
                        
                        <div className={cn(
                          "flex items-center gap-1 mt-1 text-[10px]",
                          isMe ? "text-cyan-200/50 justify-end" : "text-slate-500 justify-start"
                        )}>
                          <span>
                            {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          {isMe && (
                            <span className="ml-0.5 flex items-center" title={isRead ? "Read" : "Delivered"}>
                              <CheckCheck className={cn("h-3 w-3", isRead ? "text-cyan-400" : "text-slate-500")} />
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input Area */}
          <div className="p-3 bg-navy-900 border-t border-slate-800">
            <form onSubmit={handleSendMessage} className="flex items-end gap-2 max-w-5xl mx-auto">
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                onChange={handleFileUpload}
              />
              <Button 
                type="button" 
                size="icon" 
                variant="ghost" 
                className="text-slate-400 hover:text-cyan-500 flex-shrink-0 mb-1"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
              >
                {isUploading ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-cyan-500" /> : <Plus className="h-5 w-5" />}
              </Button>
              
              <div className="flex-1 bg-navy-950 border border-slate-700 rounded-2xl flex items-end px-3 py-2 focus-within:border-cyan-500/50 transition-colors">
                <Input 
                  value={messageInput}
                  onChange={(e) => {
                    setMessageInput(e.target.value);
                    handleTyping();
                  }}
                  placeholder="Type a message..."
                  className="border-0 bg-transparent p-0 h-auto min-h-[24px] max-h-[100px] resize-none focus-visible:ring-0 placeholder:text-slate-600 text-white"
                  autoComplete="off"
                />
              </div>

              {messageInput.trim() ? (
                <Button 
                  type="submit" 
                  size="icon" 
                  className="bg-cyan-600 hover:bg-cyan-500 text-white rounded-full h-10 w-10 flex-shrink-0 mb-0.5 shadow-lg shadow-cyan-900/20 transition-all"
                >
                  <Send className="h-5 w-5 ml-0.5" />
                </Button>
              ) : (
                <Button 
                  type="button" 
                  size="icon" 
                  variant="ghost" 
                  className="text-slate-400 hover:text-cyan-500 flex-shrink-0 mb-1"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <ImageIcon className="h-5 w-5" />
                </Button>
              )}
            </form>
          </div>
        </div>
      ) : (
        <div className="hidden md:flex flex-1 flex-col items-center justify-center bg-navy-950 border-l border-slate-800 text-slate-500">
          <div className="w-24 h-24 rounded-full bg-slate-900/50 flex items-center justify-center mb-6 border border-slate-800">
            <div className="w-16 h-16 text-slate-700">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>
          </div>
          <h2 className="text-xl font-medium text-slate-300 mb-2">Welcome to Team Uplink</h2>
          <p className="max-w-xs text-center text-sm">
            Select a conversation from the sidebar or start a new encrypted channel.
          </p>
          <div className="mt-8 flex gap-2 text-xs text-slate-600 font-mono">
            <span className="flex items-center gap-1">
              <CheckCheck className="h-3 w-3" /> End-to-End Encrypted
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

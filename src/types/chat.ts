import { Database } from './database.types';

type DbProfile = Database['public']['Tables']['profiles']['Row'];
type DbConversation = Database['public']['Tables']['conversations']['Row'];
type DbMessage = Database['public']['Tables']['messages']['Row'];
type DbMessageStatus = Database['public']['Tables']['message_status']['Row'];

export type Profile = Omit<DbProfile, 'status'> & {
  status: 'online' | 'offline' | 'busy' | string | null;
  last_read_at?: string | null;
};

export type Conversation = Omit<DbConversation, 'type'> & {
  type: 'direct' | 'group' | string;
  participants?: Profile[];
  last_message?: Message;
  unread_count?: number;
};

export type Message = Omit<DbMessage, 'type'> & {
  type: 'text' | 'image' | 'file' | 'system' | string | null;
  sender?: Profile;
  status?: string;
  is_read?: boolean;
};

export type MessageStatus = DbMessageStatus;

export type CreateUserParams = {
  email: string;
  name: string;
  role: string;
};

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      projects: {
        Row: {
          id: string
          created_at: string
          title: string
          category: string
          description: string | null
          tech_stack: string[] | null
          image_url: string | null
          live_link: string | null
          github_link: string | null
          featured: boolean
        }
        Insert: {
          id?: string
          created_at?: string
          title: string
          category: string
          description?: string | null
          tech_stack?: string[] | null
          image_url?: string | null
          live_link?: string | null
          github_link?: string | null
          featured?: boolean
        }
        Update: {
          id?: string
          created_at?: string
          title?: string
          category?: string
          description?: string | null
          tech_stack?: string[] | null
          image_url?: string | null
          live_link?: string | null
          github_link?: string | null
          featured?: boolean
        }
        Relationships: []
      }
      team_members: {
        Row: {
          id: string
          created_at: string
          name: string
          role: string
          bio: string | null
          avatar_url: string | null
          social_links: Json | null
          display_order: number | null
          parent_id: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          name: string
          role: string
          bio?: string | null
          avatar_url?: string | null
          social_links?: Json | null
          display_order?: number | null
          parent_id?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          name?: string
          role?: string
          bio?: string | null
          avatar_url?: string | null
          social_links?: Json | null
          display_order?: number | null
          parent_id?: string | null
        }
        Relationships: []
      }
      team_chat: {
        Row: {
          id: string
          created_at: string
          content: string
          sender_name: string
          sender_role: string | null
          sender_id: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          content: string
          sender_name: string
          sender_role?: string | null
          sender_id?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          content?: string
          sender_name?: string
          sender_role?: string | null
          sender_id?: string | null
        }
        Relationships: []
      }
      site_config: {
        Row: {
          id: string
          key: string
          value: Json
          section: string
          description: string | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          id?: string
          key: string
          value: Json
          section: string
          description?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          id?: string
          key?: string
          value?: Json
          section?: string
          description?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          id: string
          email: string
          display_name: string | null
          avatar_url: string | null
          status: string | null
          last_seen: string | null
          about: string | null
          wallpaper_url: string | null
          force_password_change: boolean | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          display_name?: string | null
          avatar_url?: string | null
          status?: string | null
          last_seen?: string | null
          about?: string | null
          wallpaper_url?: string | null
          force_password_change?: boolean | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          display_name?: string | null
          avatar_url?: string | null
          status?: string | null
          last_seen?: string | null
          about?: string | null
          wallpaper_url?: string | null
          force_password_change?: boolean | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      conversations: {
        Row: {
          id: string
          type: string
          name: string | null
          group_image_url: string | null
          created_by: string | null
          created_at: string
          updated_at: string
          last_message_at: string | null
        }
        Insert: {
          id?: string
          type: string
          name?: string | null
          group_image_url?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
          last_message_at?: string | null
        }
        Update: {
          id?: string
          type?: string
          name?: string | null
          group_image_url?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
          last_message_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "conversations_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      conversation_participants: {
        Row: {
          conversation_id: string
          user_id: string
          joined_at: string
          last_read_at: string | null
          unread_count: number | null
        }
        Insert: {
          conversation_id: string
          user_id: string
          joined_at?: string
          last_read_at?: string | null
          unread_count?: number | null
        }
        Update: {
          conversation_id?: string
          user_id?: string
          joined_at?: string
          last_read_at?: string | null
          unread_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "conversation_participants_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversation_participants_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      messages: {
        Row: {
          id: string
          conversation_id: string
          sender_id: string | null
          content: string
          type: string | null
          file_url: string | null
          is_edited: boolean | null
          reply_to_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          conversation_id: string
          sender_id?: string | null
          content: string
          type?: string | null
          file_url?: string | null
          is_edited?: boolean | null
          reply_to_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          conversation_id?: string
          sender_id?: string | null
          content?: string
          type?: string | null
          file_url?: string | null
          is_edited?: boolean | null
          reply_to_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_reply_to_id_fkey"
            columns: ["reply_to_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          }
        ]
      }
      message_status: {
        Row: {
          message_id: string
          user_id: string
          status: string | null
          updated_at: string
        }
        Insert: {
          message_id: string
          user_id: string
          status?: string | null
          updated_at?: string
        }
        Update: {
          message_id?: string
          user_id?: string
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "message_status_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "message_status_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

import { Database } from './database.types';

export type Project = Database['public']['Tables']['projects']['Row'];
export type TeamMember = Database['public']['Tables']['team_members']['Row'];
export type ChatMessage = Database['public']['Tables']['team_chat']['Row'];

export interface ProjectFormData {
  title: string;
  category: string;
  description: string;
  tech_stack: string; // comma separated string for input
  live_link?: string;
  github_link?: string;
}

export interface TeamMemberFormData {
  name: string;
  role: string;
  bio?: string;
  display_order?: number;
}

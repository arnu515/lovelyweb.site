import { SupabaseClient, Session, User } from '@supabase/supabase-js';
import { Database } from './lib/database.types';

type SessionData =
  | { session: null; user: null }
  | {
      session: Session;
      user: User & { name: string; username: string; avatar_url: string };
    };

declare global {
  namespace App {
    interface Locals {
      supabase: SupabaseClient<Database>;
      getSession(): Promise<SessionData>;
      auth: SessionData;
    }
    // interface PageData {}
    // interface Error {}
    // interface Platform {}
  }
}

export {};

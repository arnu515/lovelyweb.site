import { SupabaseClient, Session, User } from '@supabase/supabase-js'
import { Database } from './lib/database.types'

type SessionData = {session: null, user: null} | {session: Session, user: User}

declare global {
  namespace App {
    interface Locals {
      supabase: SupabaseClient<Database>
      getSession(): Promise<SessionData>
      auth: SessionData
    }
    interface PageData {
      auth: SessionData,
      supabase: SupabaseClient<Database>
    }
    // interface Error {}
    // interface Platform {}
  }
}

export {}

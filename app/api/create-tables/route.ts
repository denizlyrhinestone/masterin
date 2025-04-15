import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET() {
  try {
    // Create chat_sessions table if it doesn't exist
    const { error: sessionsError } = await supabase.rpc("create_chat_tables")

    if (sessionsError) {
      // If the RPC doesn't exist, create tables directly
      const { error: createSessionsError } = await supabase.query(`
        CREATE TABLE IF NOT EXISTS chat_sessions (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          user_id TEXT NOT NULL,
          title TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        CREATE TABLE IF NOT EXISTS chat_messages (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          session_id UUID REFERENCES chat_sessions(id) ON DELETE CASCADE,
          sender TEXT NOT NULL CHECK (sender IN ('user', 'ai')),
          content TEXT NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_id ON chat_sessions(user_id);
        CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id ON chat_messages(session_id);
        
        CREATE OR REPLACE FUNCTION update_updated_at_column()
        RETURNS TRIGGER AS $$
        BEGIN
          NEW.updated_at = NOW();
          RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;
        
        DROP TRIGGER IF EXISTS set_updated_at ON chat_sessions;
        CREATE TRIGGER set_updated_at
        BEFORE UPDATE ON chat_sessions
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
      `)

      if (createSessionsError) {
        console.error("Error creating tables:", createSessionsError)
        return NextResponse.json({ error: "Failed to create tables" }, { status: 500 })
      }
    }

    return NextResponse.json({ success: true, message: "Tables created successfully" })
  } catch (error) {
    console.error("Error creating tables:", error)
    return NextResponse.json({ error: "Failed to create tables" }, { status: 500 })
  }
}

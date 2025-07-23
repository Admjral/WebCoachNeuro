import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      console.error("Auth error in messages API:", userError)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get("sessionId")

    if (!sessionId) {
      console.error("No sessionId provided")
      return NextResponse.json({ error: "Session ID required" }, { status: 400 })
    }

    console.log("Fetching messages for session:", sessionId, "user:", user.id)

    // First, ensure the chat session exists and belongs to the user
    let { data: session, error: sessionError } = await supabase
      .from("chat_sessions")
      .select("*")
      .eq("id", sessionId)
      .eq("user_id", user.id)
      .single()

    if (sessionError && sessionError.code === "PGRST116") {
      // Session doesn't exist, create it
      console.log("Creating new chat session:", sessionId)
      const { data: newSession, error: createError } = await supabase
        .from("chat_sessions")
        .insert({
          id: sessionId,
          user_id: user.id,
          title: "Chat Session",
        })
        .select()
        .single()

      if (createError) {
        console.error("Error creating session:", createError)
        return NextResponse.json({ error: createError.message }, { status: 500 })
      }
      session = newSession
    } else if (sessionError) {
      console.error("Error fetching session:", sessionError)
      return NextResponse.json({ error: sessionError.message }, { status: 500 })
    }

    // Now fetch messages for this session
    const { data: messages, error: messagesError } = await supabase
      .from("messages")
      .select("*")
      .eq("session_id", sessionId)
      .order("created_at", { ascending: true })

    if (messagesError) {
      console.error("Error fetching messages:", messagesError)
      return NextResponse.json({ error: messagesError.message }, { status: 500 })
    }

    console.log("Fetched messages:", messages?.length || 0)

    // Always return an array, even if empty
    return NextResponse.json(messages || [])
  } catch (error) {
    console.error("Error in GET /api/messages:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      console.error("Auth error in chat API:", userError)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const openaiKey = request.headers.get("x-openai-key")
    const { sessionId, message } = body

    if (!openaiKey) {
      return NextResponse.json({ error: "OpenAI API key required" }, { status: 400 })
    }

    console.log("Processing chat message for user:", user.id, "session:", sessionId)

    // Create or get chat session
    let { data: session, error: sessionFetchError } = await supabase
      .from("chat_sessions")
      .select("*")
      .eq("id", sessionId)
      .eq("user_id", user.id)
      .single()

    if (sessionFetchError && sessionFetchError.code === "PGRST116") {
      console.log("Creating new chat session:", sessionId)
      const { data: newSession, error: sessionError } = await supabase
        .from("chat_sessions")
        .insert({
          id: sessionId,
          user_id: user.id,
          title: "Chat Session",
        })
        .select()
        .single()

      if (sessionError) {
        console.error("Error creating session:", sessionError)
        return NextResponse.json({ error: sessionError.message }, { status: 500 })
      }
      session = newSession
    } else if (sessionFetchError) {
      console.error("Error fetching session:", sessionFetchError)
      return NextResponse.json({ error: sessionFetchError.message }, { status: 500 })
    }

    // Save user message
    const { error: messageError } = await supabase.from("messages").insert({
      session_id: sessionId,
      content: message,
      sender: "user",
    })

    if (messageError) {
      console.error("Error saving user message:", messageError)
      return NextResponse.json({ error: messageError.message }, { status: 500 })
    }

    // Get recent messages for context
    const { data: recentMessages } = await supabase
      .from("messages")
      .select("*")
      .eq("session_id", sessionId)
      .order("created_at", { ascending: false })
      .limit(10)

    // Get user goals for context
    const { data: goals } = await supabase.from("goals").select("*").eq("user_id", user.id).eq("status", "active")

    // Call OpenAI API
    try {
      const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${openaiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content: `Вы AI коуч, который помогает пользователям достигать их целей. 
              Текущие цели пользователя: ${goals?.map((g) => g.title).join(", ") || "Нет активных целей"}
              Отвечайте на русском языке, будьте поддерживающим и мотивирующим.`,
            },
            ...(recentMessages?.reverse().map((msg) => ({
              role: msg.sender === "user" ? "user" : "assistant",
              content: msg.content,
            })) || []),
            {
              role: "user",
              content: message,
            },
          ],
          max_tokens: 500,
          temperature: 0.7,
        }),
      })

      if (!openaiResponse.ok) {
        throw new Error(`OpenAI API error: ${openaiResponse.status}`)
      }

      const aiResponse = await openaiResponse.json()
      const assistantMessage = aiResponse.choices?.[0]?.message?.content || "Извините, произошла ошибка."

      // Save assistant message
      const { data: savedMessage, error: saveError } = await supabase
        .from("messages")
        .insert({
          session_id: sessionId,
          content: assistantMessage,
          sender: "assistant",
          role: "coach",
        })
        .select()
        .single()

      if (saveError) {
        console.error("Error saving assistant message:", saveError)
      }

      return NextResponse.json({
        message: assistantMessage,
        messageId: savedMessage?.id,
      })
    } catch (openaiError) {
      console.error("OpenAI API error:", openaiError)
      return NextResponse.json({ error: "Ошибка при обращении к AI. Проверьте ваш API ключ." }, { status: 500 })
    }
  } catch (error) {
    console.error("Chat API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

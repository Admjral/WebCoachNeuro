import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      console.error("Auth error in analytics API:", userError)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.log("Fetching analytics for user:", user.id)

    // Get chat sessions count
    const { data: chatSessions, error: sessionsError } = await supabase
      .from("chat_sessions")
      .select("id")
      .eq("user_id", user.id)

    // Get total messages count
    const { data: messages, error: messagesError } = await supabase
      .from("messages")
      .select("id")
      .in("session_id", chatSessions?.map((s) => s.id) || [])

    // Get goals with steps for detailed analytics
    const { data: goals, error: goalsError } = await supabase
      .from("goals")
      .select(`
        *,
        steps (*)
      `)
      .eq("user_id", user.id)

    if (goalsError) {
      console.error("Error fetching goals for analytics:", goalsError)
      return NextResponse.json({ error: goalsError.message }, { status: 500 })
    }

    // Calculate analytics
    const analytics = {
      totalSessions: chatSessions?.length || 0,
      totalMessages: messages?.length || 0,
      totalGoals: goals?.length || 0,
      completedGoals: goals?.filter((g) => g.status === "completed").length || 0,
      activeGoals: goals?.filter((g) => g.status === "active").length || 0,
      totalSteps: goals?.reduce((acc, goal) => acc + (goal.steps?.length || 0), 0) || 0,
      completedSteps:
        goals?.reduce((acc, goal) => acc + (goal.steps?.filter((step: any) => step.completed).length || 0), 0) || 0,
      avgProgress:
        goals?.length > 0 ? Math.round(goals.reduce((acc, goal) => acc + goal.progress, 0) / goals.length) : 0,
      goalsByCategory:
        goals?.reduce((acc: any, goal) => {
          const category = goal.category || "Другое"
          acc[category] = (acc[category] || 0) + 1
          return acc
        }, {}) || {},
      goalsByStatus: {
        active: goals?.filter((g) => g.status === "active").length || 0,
        completed: goals?.filter((g) => g.status === "completed").length || 0,
        paused: goals?.filter((g) => g.status === "paused").length || 0,
      },
      recentActivity:
        goals
          ?.map((goal) => ({
            id: goal.id,
            title: goal.title,
            status: goal.status,
            progress: goal.progress,
            updated_at: goal.updated_at,
            steps_completed: goal.steps?.filter((step: any) => step.completed).length || 0,
            total_steps: goal.steps?.length || 0,
          }))
          .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
          .slice(0, 10) || [],
    }

    console.log("Analytics calculated:", analytics)
    return NextResponse.json(analytics)
  } catch (error) {
    console.error("Error in GET /api/analytics:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

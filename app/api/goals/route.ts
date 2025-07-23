import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      console.error("Auth error in goals API:", userError)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.log("Fetching goals for user:", user.id)

    const { data: goals, error } = await supabase
      .from("goals")
      .select(`
        *,
        steps (*)
      `)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching goals:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log("Fetched goals:", goals?.length || 0)
    return NextResponse.json(goals || [])
  } catch (error) {
    console.error("Error in GET /api/goals:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      console.error("Auth error in goals POST:", userError)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    console.log("Creating goal for user:", user.id, "with data:", body)

    const { data: goal, error } = await supabase
      .from("goals")
      .insert({
        user_id: user.id,
        title: body.title,
        description: body.description || null,
        category: body.category,
        deadline: body.deadline || null,
        status: "active",
        progress: 0,
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating goal:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log("Created goal:", goal)

    // Create some default steps for the goal
    if (goal) {
      const defaultSteps = [
        { title: "Определить план действий", completed: false },
        { title: "Начать изучение основ", completed: false },
        { title: "Практиковать полученные знания", completed: false },
        { title: "Создать первый проект", completed: false },
      ]

      const { error: stepsError } = await supabase.from("steps").insert(
        defaultSteps.map((step) => ({
          goal_id: goal.id,
          title: step.title,
          completed: step.completed,
        })),
      )

      if (stepsError) {
        console.error("Error creating default steps:", stepsError)
      }
    }

    return NextResponse.json(goal)
  } catch (error) {
    console.error("Error in POST /api/goals:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

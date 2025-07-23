import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      console.error("Auth error in steps API:", userError)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const stepId = params.id

    console.log("Updating step:", stepId, "with data:", body)

    const { data: step, error } = await supabase
      .from("steps")
      .update({
        completed: body.completed,
        updated_at: new Date().toISOString(),
      })
      .eq("id", stepId)
      .select()
      .single()

    if (error) {
      console.error("Error updating step:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Update goal progress
    const { data: allSteps } = await supabase.from("steps").select("completed").eq("goal_id", step.goal_id)

    if (allSteps && allSteps.length > 0) {
      const completedSteps = allSteps.filter((s) => s.completed).length
      const progress = Math.round((completedSteps / allSteps.length) * 100)

      const { error: goalUpdateError } = await supabase
        .from("goals")
        .update({
          progress,
          status: progress === 100 ? "completed" : "active",
        })
        .eq("id", step.goal_id)

      if (goalUpdateError) {
        console.error("Error updating goal progress:", goalUpdateError)
      }
    }

    return NextResponse.json(step)
  } catch (error) {
    console.error("Error in PATCH /api/steps/[id]:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

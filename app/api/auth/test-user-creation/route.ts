import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST() {
  try {
    const supabase = await createClient()

    // Test creating a user manually
    const testEmail = `test-${Date.now()}@example.com`
    const testPassword = "test123456"

    console.log("Creating test user:", testEmail)

    // Create user in auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: testEmail,
      password: testPassword,
      email_confirm: true, // Auto-confirm for testing
    })

    if (authError) {
      console.error("Auth creation error:", authError)
      return NextResponse.json({ error: authError.message }, { status: 500 })
    }

    console.log("Auth user created:", authData.user?.id)

    // Wait a moment for trigger to fire
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Check if user was created in public.users
    const { data: publicUser, error: publicError } = await supabase
      .from("users")
      .select("*")
      .eq("id", authData.user.id)
      .single()

    console.log("Public user check:", { publicUser, publicError })

    // If user wasn't created by trigger, create manually
    if (publicError && publicError.code === "PGRST116") {
      console.log("Creating user manually in public.users")

      const { data: manualUser, error: manualError } = await supabase.from("users").insert({
        id: authData.user.id,
        email: authData.user.email!,
        name: authData.user.email!.split("@")[0],
        onboarding_completed: false,
      })

      if (manualError) {
        console.error("Manual creation error:", manualError)
        return NextResponse.json({ error: manualError.message }, { status: 500 })
      }

      console.log("User created manually:", manualUser)
    }

    return NextResponse.json({
      success: true,
      authUser: {
        id: authData.user.id,
        email: authData.user.email,
      },
      publicUser: publicUser || "Created manually",
      triggerWorked: !publicError,
    })
  } catch (error) {
    console.error("Test user creation error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

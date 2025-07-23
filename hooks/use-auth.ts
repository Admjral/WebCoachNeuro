"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import type { Session, User } from "@supabase/supabase-js"

export function useAuth() {
  const supabase = createClient()
  const router = useRouter()
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const initialized = useRef(false)

  useEffect(() => {
    let mounted = true

    const getSession = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession()

        if (error) {
          console.error("Error getting session:", error)
        }

        if (mounted) {
          console.log("Initial session:", session?.user?.email || "No session")
          setSession(session)
          setUser(session?.user || null)
          setLoading(false)
          initialized.current = true
        }
      } catch (error) {
        console.error("Error in getSession:", error)
        if (mounted) {
          setLoading(false)
        }
      }
    }

    getSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return

      console.log("Auth state changed:", event, session?.user?.email || "No user")

      setSession(session)
      setUser(session?.user || null)

      // Only set loading to false after initial session is handled
      if (initialized.current) {
        setLoading(false)
      }

      // Handle navigation only for specific events and avoid loops
      if (event === "SIGNED_IN" && initialized.current) {
        console.log("User signed in, navigating to home")
        // Use replace instead of refresh to avoid loops
        router.replace("/")
      } else if (event === "SIGNED_OUT") {
        console.log("User signed out, navigating to login")
        router.replace("/auth/login")
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [supabase, router])

  const signInWithPassword = async (email: string, password: string) => {
    setLoading(true)
    try {
      console.log("Attempting sign in for:", email)

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      })

      if (error) {
        console.error("Sign in error:", error)

        // Add more specific error handling
        if (error.message === "Invalid login credentials") {
          // Check if user exists but email is not confirmed
          const { data: users } = await supabase.auth.admin.listUsers()
          const userExists = users.users?.find((u) => u.email === email.trim().toLowerCase())

          if (userExists && !userExists.email_confirmed_at) {
            return {
              data,
              error: {
                ...error,
                message: "Email not confirmed. Please check your email and click the confirmation link.",
              },
            }
          }
        }
      } else {
        console.log("Sign in successful for:", data.user?.email)
      }

      return { data, error }
    } catch (error) {
      console.error("Sign in exception:", error)
      return { data: null, error }
    } finally {
      setLoading(false)
    }
  }

  const signUp = async (email: string, password: string) => {
    setLoading(true)
    try {
      console.log("Attempting sign up for:", email)

      const { data, error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            name: email.split("@")[0], // Use email prefix as default name
          },
        },
      })

      console.log("Sign up result:", {
        user: data.user?.email,
        needsConfirmation: !data.user?.email_confirmed_at,
        error: error?.message,
      })

      return { data, error }
    } catch (error) {
      console.error("Sign up exception:", error)
      return { data: null, error }
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    setLoading(true)
    try {
      console.log("Signing out user")
      const { error } = await supabase.auth.signOut()
      if (!error) {
        console.log("Sign out successful")
        // Don't manually navigate here, let the auth state change handle it
      }
      return { error }
    } catch (error) {
      console.error("Sign out exception:", error)
      return { error }
    } finally {
      setLoading(false)
    }
  }

  return { session, user, loading, signInWithPassword, signUp, signOut }
}

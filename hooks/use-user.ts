"use client"

import { useState, useEffect, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import type { Database } from "@/lib/supabase/types"
import { useAuth } from "./use-auth"

export type UserProfile = Database["public"]["Tables"]["users"]["Row"]

export function useUser() {
  const supabase = createClient()
  const { user: authUser, loading: authLoading } = useAuth()
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const fetchingRef = useRef(false)

  useEffect(() => {
    const fetchOrCreateProfile = async () => {
      // Prevent multiple simultaneous requests
      if (fetchingRef.current || authLoading) return

      if (!authUser) {
        setUserProfile(null)
        setLoading(false)
        return
      }

      fetchingRef.current = true

      try {
        console.log("Fetching profile for user:", authUser.id)

        // First try to get existing profile
        const { data: existingProfile, error: fetchError } = await supabase
          .from("users")
          .select("*")
          .eq("id", authUser.id)
          .single()

        if (fetchError) {
          console.log("Fetch error:", fetchError)

          if (fetchError.code === "PGRST116") {
            // No profile found, create one
            console.log("Creating new profile for user:", authUser.id)

            const { data: newProfile, error: insertError } = await supabase
              .from("users")
              .insert({
                id: authUser.id,
                email: authUser.email!,
                name: authUser.email?.split("@")[0] || null,
                onboarding_completed: false,
              })
              .select()
              .single()

            if (insertError) {
              console.error("Error creating profile:", insertError)
              throw insertError
            }

            console.log("Created new profile:", newProfile)
            setUserProfile(newProfile)
          } else {
            throw fetchError
          }
        } else {
          console.log("Found existing profile:", existingProfile)
          setUserProfile(existingProfile)
        }
      } catch (error) {
        console.error("Error in fetchOrCreateProfile:", error)
        setUserProfile(null)
      } finally {
        setLoading(false)
        fetchingRef.current = false
      }
    }

    fetchOrCreateProfile()
  }, [authUser, authLoading]) // Only depend on user ID to prevent loops

  const updateUserProfile = async (updates: Partial<UserProfile>) => {
    if (!userProfile) return { success: false, error: "No user profile" }

    try {
      console.log("Updating profile with:", updates)

      const { data, error } = await supabase.from("users").update(updates).eq("id", userProfile.id).select().single()

      if (error) {
        console.error("Error updating profile:", error)
        throw error
      }

      console.log("Profile updated:", data)
      setUserProfile(data)
      return { success: true, data }
    } catch (error) {
      console.error("Error updating user profile:", error)
      return { success: false, error }
    }
  }

  return { user: userProfile, loading, updateUserProfile }
}

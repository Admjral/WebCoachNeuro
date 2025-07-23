"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/hooks/use-auth"
import { useUser } from "@/hooks/use-user"
import { RefreshCw, Database, User, Shield, TestTube, AlertTriangle } from "lucide-react"

export default function DebugPage() {
  const supabase = createClient()
  const { session, user: authUser } = useAuth()
  const { user: userProfile } = useUser()
  const [debugInfo, setDebugInfo] = useState<any>({})
  const [loading, setLoading] = useState(false)
  const [testResult, setTestResult] = useState<any>(null)

  const fetchDebugInfo = async () => {
    setLoading(true)
    try {
      const info: any = {
        timestamp: new Date().toISOString(),
        session: session
          ? {
              user_id: session.user.id,
              email: session.user.email,
              email_confirmed_at: session.user.email_confirmed_at,
              created_at: session.user.created_at,
            }
          : null,
        authUser: authUser
          ? {
              id: authUser.id,
              email: authUser.email,
              email_confirmed_at: authUser.email_confirmed_at,
            }
          : null,
        userProfile: userProfile,
      }

      // Check database tables
      if (session) {
        try {
          // Check public.users table
          const { data: publicUsers, error: publicError } = await supabase.from("users").select("*")
          info.publicUsers = publicUsers
          info.publicUsersError = publicError?.message

          // Check goals
          const { data: goals, error: goalsError } = await supabase.from("goals").select("*")
          info.goalsCount = goals?.length || 0
          info.goalsError = goalsError?.message

          // Check if current user exists in public.users
          const { data: currentUserProfile, error: currentUserError } = await supabase
            .from("users")
            .select("*")
            .eq("id", session.user.id)
            .single()

          info.currentUserProfile = currentUserProfile
          info.currentUserError = currentUserError?.message
        } catch (error) {
          info.databaseError = error
        }
      }

      setDebugInfo(info)
    } catch (error) {
      console.error("Debug fetch error:", error)
      setDebugInfo({ error: error })
    } finally {
      setLoading(false)
    }
  }

  const testUserCreation = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/auth/test-user-creation", {
        method: "POST",
      })

      const result = await response.json()
      setTestResult(result)
      console.log("Test result:", result)

      // Refresh debug info
      await fetchDebugInfo()
    } catch (error) {
      console.error("Test error:", error)
      setTestResult({ error: "Test failed" })
    } finally {
      setLoading(false)
    }
  }

  const fixCurrentUser = async () => {
    if (!session) return

    setLoading(true)
    try {
      console.log("Fixing current user profile for:", session.user.email)

      const { data, error } = await supabase
        .from("users")
        .insert({
          id: session.user.id,
          email: session.user.email!,
          name: session.user.email!.split("@")[0],
          onboarding_completed: false,
        })
        .select()
        .single()

      if (error && error.code !== "23505") {
        // 23505 is unique constraint violation (user already exists)
        console.error("Error creating user profile:", error)
        throw error
      }

      console.log("User profile created/fixed:", data)
      await fetchDebugInfo()
    } catch (error) {
      console.error("Fix user error:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDebugInfo()
  }, [session, userProfile])

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Debug Information</h1>
        <div className="flex space-x-2">
          <Button onClick={fetchDebugInfo} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button onClick={testUserCreation} variant="outline" disabled={loading}>
            <TestTube className="w-4 h-4 mr-2" />
            Test User Creation
          </Button>
          {session && !debugInfo.currentUserProfile && (
            <Button onClick={fixCurrentUser} variant="destructive" disabled={loading}>
              Fix Current User
            </Button>
          )}
        </div>
      </div>

      {/* Alerts */}
      {session && !debugInfo.currentUserProfile && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Вы авторизованы, но ваш профиль не найден в таблице users. Нажмите "Fix Current User" для исправления.
          </AlertDescription>
        </Alert>
      )}

      {testResult && (
        <Alert variant={testResult.success ? "default" : "destructive"}>
          <AlertDescription>
            <strong>Test Result:</strong> {testResult.success ? "Success" : "Failed"}
            {testResult.triggerWorked !== undefined && (
              <div>Trigger worked: {testResult.triggerWorked ? "Yes" : "No"}</div>
            )}
            {testResult.error && <div>Error: {testResult.error}</div>}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Session Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="w-5 h-5" />
              <span>Session</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {debugInfo.session ? (
              <div className="space-y-2">
                <div>
                  <Badge variant="outline">Authenticated</Badge>
                </div>
                <div className="text-sm">
                  <strong>Email:</strong> {debugInfo.session.email}
                </div>
                <div className="text-sm">
                  <strong>ID:</strong> {debugInfo.session.user_id}
                </div>
                <div className="text-sm">
                  <strong>Confirmed:</strong> {debugInfo.session.email_confirmed_at ? "Yes" : "No"}
                </div>
              </div>
            ) : (
              <Badge variant="destructive">No Session</Badge>
            )}
          </CardContent>
        </Card>

        {/* User Profile */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="w-5 h-5" />
              <span>User Profile</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {debugInfo.currentUserProfile ? (
              <div className="space-y-2">
                <div>
                  <Badge variant="outline">Profile Exists</Badge>
                </div>
                <div className="text-sm">
                  <strong>Name:</strong> {debugInfo.currentUserProfile.name || "Not set"}
                </div>
                <div className="text-sm">
                  <strong>Email:</strong> {debugInfo.currentUserProfile.email}
                </div>
                <div className="text-sm">
                  <strong>Onboarding:</strong>{" "}
                  {debugInfo.currentUserProfile.onboarding_completed ? "Complete" : "Incomplete"}
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <Badge variant="destructive">No Profile</Badge>
                {debugInfo.currentUserError && (
                  <div className="text-sm text-red-600">Error: {debugInfo.currentUserError}</div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Database Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Database className="w-5 h-5" />
              <span>Database</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-sm">
                <strong>Public Users:</strong> {debugInfo.publicUsers?.length || 0}
              </div>
              <div className="text-sm">
                <strong>Goals:</strong> {debugInfo.goalsCount || 0}
              </div>
              {debugInfo.publicUsersError && (
                <div className="text-sm text-red-600">
                  <strong>Error:</strong> {debugInfo.publicUsersError}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Users List */}
      {debugInfo.publicUsers && debugInfo.publicUsers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Users in Database</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {debugInfo.publicUsers.map((user: any) => (
                <div key={user.id} className="flex items-center justify-between p-2 border rounded">
                  <div>
                    <div className="font-medium">{user.email}</div>
                    <div className="text-sm text-muted-foreground">
                      {user.name} • {user.onboarding_completed ? "Onboarded" : "Not onboarded"}
                    </div>
                  </div>
                  <Badge variant={user.id === session?.user.id ? "default" : "outline"}>
                    {user.id === session?.user.id ? "Current" : "Other"}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Raw Debug Data */}
      <Card>
        <CardHeader>
          <CardTitle>Raw Debug Data</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="text-xs bg-muted p-4 rounded-lg overflow-auto max-h-96">
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
        </CardContent>
      </Card>
    </div>
  )
}

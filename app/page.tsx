"use client"

import { useState, useEffect } from "react"
import { SplashScreen } from "@/components/auth/splash-screen"
import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard"
import { Dashboard } from "@/components/dashboard/dashboard"
import { GoalsPage } from "@/components/goals/goals-page"
import { ChatPage } from "@/components/chat/chat-page"
import { LibraryPage } from "@/components/library/library-page"
import { AnalyticsPage } from "@/components/analytics/analytics-page"
import { Navigation } from "@/components/layout/navigation"
import { MobileNavigation } from "@/components/layout/mobile-navigation"
import { Toaster } from "@/components/ui/toaster"
import { ThemeProvider } from "@/components/theme-provider"
import { LanguageProvider } from "@/contexts/language-context"
import { useAuth } from "@/hooks/use-auth"
import { useUser } from "@/hooks/use-user"
import { useRouter } from "next/navigation"

type AppState = "splash" | "onboarding" | "dashboard" | "goals" | "chat" | "library" | "analytics"

export default function Home() {
  const router = useRouter()
  const { session, loading: authLoading } = useAuth()
  const { user, loading: userProfileLoading, updateUserProfile } = useUser()
  const [currentState, setCurrentState] = useState<AppState>("splash")

  useEffect(() => {
    // Show splash while loading
    if (authLoading || userProfileLoading) {
      setCurrentState("splash")
      return
    }

    // Redirect to login if no session
    if (!session) {
      router.replace("/auth/login")
      return
    }

    // Show onboarding if user hasn't completed it
    if (user && !user.onboarding_completed) {
      setCurrentState("onboarding")
    } else {
      setCurrentState("dashboard")
    }
  }, [session, authLoading, user, userProfileLoading, router])

  const handleOnboardingComplete = async (onboardingData: any) => {
    if (user) {
      await updateUserProfile({
        onboarding_completed: true,
        name: onboardingData.name,
        focus_area: onboardingData.development,
        income_goal: onboardingData.incomeGoal,
        target_deadline: onboardingData.deadline?.toISOString(),
        obstacles: onboardingData.obstacles,
      })
      setCurrentState("dashboard")
    }
  }

  const renderContent = () => {
    switch (currentState) {
      case "splash":
        return <SplashScreen />
      case "onboarding":
        return <OnboardingWizard onComplete={handleOnboardingComplete} />
      case "dashboard":
        return <Dashboard />
      case "goals":
        return <GoalsPage />
      case "chat":
        return <ChatPage />
      case "library":
        return <LibraryPage />
      case "analytics":
        return <AnalyticsPage />
      default:
        return <SplashScreen />
    }
  }

  const showNavigation = ["dashboard", "goals", "chat", "library", "analytics"].includes(currentState)

  return (
    <LanguageProvider>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
        <div className="min-h-screen bg-background">
          {showNavigation && (
            <>
              <Navigation currentPage={currentState} onNavigate={setCurrentState} />
              <MobileNavigation currentPage={currentState} onNavigate={setCurrentState} />
            </>
          )}

          <main className={showNavigation ? "pt-16 pb-20 md:pb-0" : ""}>{renderContent()}</main>

          <Toaster />
        </div>
      </ThemeProvider>
    </LanguageProvider>
  )
}

"use client"

import { useState } from "react"
import useSWR from "swr"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { Target, MessageSquare, BookOpen, CheckCircle, Clock, TrendingUp, X, Info, AlertCircle } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import { useUser } from "@/hooks/use-user"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function Dashboard() {
  const { t } = useLanguage()
  const { user, loading: userLoading } = useUser()
  const [showReminder, setShowReminder] = useState(true)

  const { data: goals = [], isLoading: goalsLoading, error: goalsError } = useSWR(user ? "/api/goals" : null, fetcher)
  const { data: analytics, isLoading: analyticsLoading } = useSWR(user ? "/api/analytics" : null, fetcher)

  const isLoading = goalsLoading || analyticsLoading || userLoading

  if (goalsError) {
    return (
      <div className="container mx-auto p-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <AlertCircle className="w-12 h-12 mx-auto text-red-500" />
              <h3 className="font-semibold">Ошибка загрузки</h3>
              <p className="text-sm text-muted-foreground">Не удалось загрузить данные панели</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Ensure goals is always an array
  const goalsArray = Array.isArray(goals) ? goals : []

  const currentHour = new Date().getHours()
  const greeting =
    currentHour < 12
      ? t("dashboard.goodMorning")
      : currentHour < 18
        ? t("dashboard.goodAfternoon")
        : t("dashboard.goodEvening")

  const completedGoals = goalsArray.filter((goal: any) => goal.status === "completed").length
  const activeGoals = goalsArray.filter((goal: any) => goal.status === "active")
  const totalSteps = goalsArray.reduce((acc: number, goal: any) => acc + (goal.steps?.length || 0), 0)
  const completedSteps = goalsArray.reduce(
    (acc: number, goal: any) => acc + (goal.steps?.filter((step: any) => step.completed).length || 0),
    0,
  )

  // Calculate streak (simplified - days since last goal update)
  const lastActivity =
    goalsArray.length > 0 ? Math.max(...goalsArray.map((goal: any) => new Date(goal.updated_at).getTime())) : Date.now()
  const daysSinceActivity = Math.floor((Date.now() - lastActivity) / (1000 * 60 * 60 * 24))
  const streak = Math.max(0, 30 - daysSinceActivity) // Simple streak calculation

  const stats = [
    {
      title: t("dashboard.completedGoals"),
      value: completedGoals.toString(),
      description: t("dashboard.thisMonth"),
      icon: CheckCircle,
      color: "text-green-600",
    },
    {
      title: t("dashboard.activeSteps"),
      value: (totalSteps - completedSteps).toString(),
      description: t("dashboard.inProgress"),
      icon: Clock,
      color: "text-blue-600",
    },
    {
      title: t("dashboard.streak"),
      value: streak.toString(),
      description: t("dashboard.daysActive"),
      icon: TrendingUp,
      color: "text-purple-600",
    },
  ]

  const userName = user?.name || user?.email?.split("@")[0] || "Пользователь"

  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Welcome Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">
          {greeting}, {userName}! 👋
        </h1>
        <p className="text-muted-foreground">{t("dashboard.readyProgress")}</p>
      </div>

      {/* Reminder Strip - only show if user has goals */}
      {showReminder && goalsArray.length > 0 && (
        <Card className="border-l-4 border-l-orange-500 bg-orange-50 dark:bg-orange-950/20">
          <CardContent className="pt-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                <Info className="w-5 h-5 text-orange-600 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-medium text-orange-900 dark:text-orange-100">{t("dashboard.weeklyCheckin")}</p>
                  <p className="text-sm text-orange-700 dark:text-orange-200">{t("dashboard.timeForReview")}</p>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button variant="ghost" size="sm" className="text-orange-700 hover:text-orange-900">
                  {t("dashboard.details")}
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setShowReminder(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {isLoading
          ? Array.from({ length: 3 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="pt-6">
                  <Skeleton className="h-16 w-full" />
                </CardContent>
              </Card>
            ))
          : stats.map((stat, index) => (
              <Card key={index}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                      <div className="flex items-baseline space-x-2">
                        <p className="text-2xl font-bold">{stat.value}</p>
                        <p className="text-sm text-muted-foreground">{stat.description}</p>
                      </div>
                    </div>
                    <stat.icon className={`w-8 h-8 ${stat.color}`} />
                  </div>
                </CardContent>
              </Card>
            ))}
      </div>

      {/* CTA Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                <Target className="w-6 h-6 text-blue-600" />
              </div>
              <div className="space-y-1">
                <h3 className="font-semibold">{t("dashboard.myGoals")}</h3>
                <p className="text-sm text-muted-foreground">{t("dashboard.trackObjectives")}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-green-600" />
              </div>
              <div className="space-y-1">
                <h3 className="font-semibold">{t("dashboard.aiCoach")}</h3>
                <p className="text-sm text-muted-foreground">{t("dashboard.personalizedGuidance")}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-purple-600" />
              </div>
              <div className="space-y-1">
                <h3 className="font-semibold">{t("dashboard.library")}</h3>
                <p className="text-sm text-muted-foreground">{t("dashboard.learningResources")}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Current Goal Progress */}
      {activeGoals.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{t("dashboard.currentFocus")}</CardTitle>
            <CardDescription>{t("dashboard.activeGoalProgress")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading
              ? Array.from({ length: 2 }).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-2 w-full" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                ))
              : activeGoals.slice(0, 2).map((goal: any) => (
                  <div key={goal.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">{goal.title}</h4>
                      <Badge variant="secondary">{t("dashboard.inProgress")}</Badge>
                    </div>
                    <Progress value={goal.progress} className="w-full" />
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>
                        {goal.progress}% {t("dashboard.complete")}
                      </span>
                      <span>
                        {t("dashboard.due")}:{" "}
                        {goal.deadline ? new Date(goal.deadline).toLocaleDateString() : "Не указан"}
                      </span>
                    </div>
                    {goal.steps && goal.steps.length > 0 && (
                      <div className="space-y-2">
                        <h5 className="text-sm font-medium">{t("dashboard.nextSteps")}</h5>
                        <ul className="space-y-1 text-sm text-muted-foreground">
                          {goal.steps
                            .filter((step: any) => !step.completed)
                            .slice(0, 3)
                            .map((step: any) => (
                              <li key={step.id} className="flex items-center space-x-2">
                                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                                <span>{step.title}</span>
                              </li>
                            ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
          </CardContent>
        </Card>
      )}

      {/* No Goals State */}
      {!isLoading && goalsArray.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-4 py-8">
              <Target className="w-16 h-16 mx-auto text-muted-foreground" />
              <div className="space-y-2">
                <h3 className="font-semibold text-lg">Добро пожаловать в AI Coach!</h3>
                <p className="text-muted-foreground">Начните свой путь к успеху, создав первую цель</p>
              </div>
              <Button>
                <Target className="w-4 h-4 mr-2" />
                Создать первую цель
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { TrendingUp, Target, MessageSquare, Clock, Calendar, Award, Activity, AlertCircle } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import useSWR from "swr"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function AnalyticsPage() {
  const { t } = useLanguage()

  // Fetch real data from API
  const { data: goals = [], isLoading: goalsLoading, error: goalsError } = useSWR("/api/goals", fetcher)
  const { data: analytics, isLoading: analyticsLoading, error: analyticsError } = useSWR("/api/analytics", fetcher)

  const isLoading = goalsLoading || analyticsLoading
  const hasError = goalsError || analyticsError

  if (hasError) {
    return (
      <div className="container mx-auto p-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <AlertCircle className="w-12 h-12 mx-auto text-red-500" />
              <h3 className="font-semibold">Ошибка загрузки аналитики</h3>
              <p className="text-sm text-muted-foreground">Не удалось загрузить данные аналитики</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Calculate real statistics from goals data
  const totalGoals = goals.length
  const completedGoals = goals.filter((goal: any) => goal.status === "completed").length
  const activeGoals = goals.filter((goal: any) => goal.status === "active").length
  const pausedGoals = goals.filter((goal: any) => goal.status === "paused").length

  const totalSteps = goals.reduce((acc: number, goal: any) => acc + (goal.steps?.length || 0), 0)
  const completedSteps = goals.reduce(
    (acc: number, goal: any) => acc + (goal.steps?.filter((step: any) => step.completed).length || 0),
    0,
  )

  const avgProgress =
    totalGoals > 0 ? Math.round(goals.reduce((acc: number, goal: any) => acc + goal.progress, 0) / totalGoals) : 0

  const stats = [
    {
      title: t("analytics.totalGoals"),
      value: totalGoals.toString(),
      change: completedGoals > 0 ? `${completedGoals} завершено` : "Нет завершенных",
      icon: Target,
      color: "text-blue-600",
    },
    {
      title: t("analytics.activeSteps"),
      value: (totalSteps - completedSteps).toString(),
      change: `${completedSteps}/${totalSteps} завершено`,
      icon: Clock,
      color: "text-orange-600",
    },
    {
      title: "Средний прогресс",
      value: `${avgProgress}%`,
      change: activeGoals > 0 ? `${activeGoals} активных целей` : "Нет активных целей",
      icon: Activity,
      color: "text-green-600",
    },
    {
      title: "Сообщений в чате",
      value: analytics?.totalMessages?.toString() || "0",
      change: analytics?.totalSessions ? `${analytics.totalSessions} сессий` : "Нет сессий",
      icon: MessageSquare,
      color: "text-purple-600",
    },
  ]

  // Prepare goals by category data
  const goalsByCategory = goals.reduce((acc: any, goal: any) => {
    const category = goal.category || "Другое"
    acc[category] = (acc[category] || 0) + 1
    return acc
  }, {})

  const categoryData = Object.entries(goalsByCategory).map(([category, count], index) => ({
    category,
    count,
    color: ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"][index % 5],
  }))

  // Prepare goals by status data
  const statusData = [
    { name: "Активные", value: activeGoals, color: "#3b82f6" },
    { name: "Завершенные", value: completedGoals, color: "#10b981" },
    { name: "Приостановленные", value: pausedGoals, color: "#f59e0b" },
  ].filter((item) => item.value > 0)

  // Prepare progress distribution data
  const progressRanges = {
    "0-25%": 0,
    "26-50%": 0,
    "51-75%": 0,
    "76-100%": 0,
  }

  goals.forEach((goal: any) => {
    const progress = goal.progress || 0
    if (progress <= 25) progressRanges["0-25%"]++
    else if (progress <= 50) progressRanges["26-50%"]++
    else if (progress <= 75) progressRanges["51-75%"]++
    else progressRanges["76-100%"]++
  })

  const progressData = Object.entries(progressRanges).map(([range, count]) => ({
    range,
    count,
  }))

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{t("analytics.dashboardTitle")}</h1>
        <p className="text-muted-foreground">{t("analytics.dashboardDescription")}</p>
      </div>

      {/* Key Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => (
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
                      </div>
                      <p className="text-xs text-muted-foreground">{stat.change}</p>
                    </div>
                    <stat.icon className={`w-8 h-8 ${stat.color}`} />
                  </div>
                </CardContent>
              </Card>
            ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Goals by Category */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="w-5 h-5" />
              <span>Цели по категориям</span>
            </CardTitle>
            <CardDescription>Распределение ваших целей по категориям</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="count"
                    label={({ category, count }) => `${category}: ${count}`}
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <Target className="w-12 h-12 mx-auto mb-2" />
                  <p>Нет данных о целях</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Goals by Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="w-5 h-5" />
              <span>Статус целей</span>
            </CardTitle>
            <CardDescription>Распределение целей по статусу</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : statusData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={statusData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <Activity className="w-12 h-12 mx-auto mb-2" />
                  <p>Нет данных о статусе</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Progress Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5" />
              <span>Распределение прогресса</span>
            </CardTitle>
            <CardDescription>Как распределен прогресс по вашим целям</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : progressData.some((item) => item.count > 0) ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={progressData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="range" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <TrendingUp className="w-12 h-12 mx-auto mb-2" />
                  <p>Нет данных о прогрессе</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Performance Metrics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Award className="w-5 h-5" />
              <span>Показатели эффективности</span>
            </CardTitle>
            <CardDescription>Ключевые показатели вашего прогресса</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-2 w-full" />
                </div>
              ))
            ) : (
              <>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Процент завершения целей</span>
                    <span>{totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0}%</span>
                  </div>
                  <Progress value={totalGoals > 0 ? (completedGoals / totalGoals) * 100 : 0} className="w-full" />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Процент завершения шагов</span>
                    <span>{totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0}%</span>
                  </div>
                  <Progress value={totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0} className="w-full" />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Средний прогресс по целям</span>
                    <span>{avgProgress}%</span>
                  </div>
                  <Progress value={avgProgress} className="w-full" />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Активность (активные цели)</span>
                    <span>{totalGoals > 0 ? Math.round((activeGoals / totalGoals) * 100) : 0}%</span>
                  </div>
                  <Progress value={totalGoals > 0 ? (activeGoals / totalGoals) * 100 : 0} className="w-full" />
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Goals List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="w-5 h-5" />
            <span>Детали целей</span>
          </CardTitle>
          <CardDescription>Подробная информация о ваших целях</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="border rounded-lg p-4">
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2 mb-2" />
                  <Skeleton className="h-2 w-full" />
                </div>
              ))}
            </div>
          ) : goals.length > 0 ? (
            <div className="space-y-4">
              {goals.map((goal: any) => (
                <div key={goal.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-semibold">{goal.title}</h4>
                      <p className="text-sm text-muted-foreground">{goal.category}</p>
                    </div>
                    <Badge
                      variant={
                        goal.status === "completed" ? "default" : goal.status === "active" ? "secondary" : "outline"
                      }
                    >
                      {goal.status === "completed"
                        ? "Завершена"
                        : goal.status === "active"
                          ? "Активна"
                          : "Приостановлена"}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Прогресс</span>
                      <span>{goal.progress}%</span>
                    </div>
                    <Progress value={goal.progress} className="w-full" />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>
                        Шагов: {goal.steps?.filter((s: any) => s.completed).length || 0}/{goal.steps?.length || 0}
                      </span>
                      <span>Создана: {new Date(goal.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Target className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
              <h3 className="font-semibold mb-1">Нет целей</h3>
              <p className="text-sm text-muted-foreground">Создайте свою первую цель для просмотра аналитики</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

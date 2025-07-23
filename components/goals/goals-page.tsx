"use client"

import { useState } from "react"
import useSWR from "swr"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import { Plus, Target, Calendar, Edit, CheckCircle2, Clock, AlertCircle } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function GoalsPage() {
  const { t } = useLanguage()
  const { toast } = useToast()
  const [selectedGoal, setSelectedGoal] = useState<any>(null)
  const [showNewGoalDialog, setShowNewGoalDialog] = useState(false)
  const [newGoal, setNewGoal] = useState({
    title: "",
    description: "",
    category: "",
    deadline: "",
  })

  const { data: goals = [], error, mutate, isLoading } = useSWR("/api/goals", fetcher)

  const handleCreateGoal = async () => {
    try {
      const response = await fetch("/api/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newGoal),
      })

      if (response.ok) {
        toast({
          title: "Успех",
          description: "Цель успешно создана",
        })
        mutate()
        setShowNewGoalDialog(false)
        setNewGoal({ title: "", description: "", category: "", deadline: "" })
      } else {
        throw new Error("Failed to create goal")
      }
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось создать цель",
        variant: "destructive",
      })
    }
  }

  const toggleStep = async (stepId: string, completed: boolean) => {
    try {
      const response = await fetch(`/api/steps/${stepId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed }),
      })

      if (response.ok) {
        mutate()
        toast({
          title: completed ? "Шаг выполнен" : "Шаг отменен",
          description: completed ? "Отличная работа!" : "Шаг помечен как невыполненный",
        })
      }
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось обновить шаг",
        variant: "destructive",
      })
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">{t("goals.active")}</Badge>
        )
      case "completed":
        return (
          <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
            {t("goals.completed")}
          </Badge>
        )
      case "paused":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
            {t("goals.paused")}
          </Badge>
        )
      default:
        return <Badge variant="secondary">Unknown</Badge>
    }
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <AlertCircle className="w-12 h-12 mx-auto text-red-500" />
              <h3 className="font-semibold">Ошибка загрузки</h3>
              <p className="text-sm text-muted-foreground">Не удалось загрузить цели</p>
              <Button onClick={() => mutate()}>Попробовать снова</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t("goals.myGoals")}</h1>
          <p className="text-muted-foreground">{t("goals.trackProgress")}</p>
        </div>
        <Dialog open={showNewGoalDialog} onOpenChange={setShowNewGoalDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              {t("goals.newGoal")}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{t("goals.createNew")}</DialogTitle>
              <DialogDescription>{t("goals.setObjective")}</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">{t("goals.goalTitle")}</Label>
                <Input
                  id="title"
                  placeholder={t("goals.titlePlaceholder")}
                  value={newGoal.title}
                  onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">{t("goals.category")}</Label>
                <Select value={newGoal.category} onValueChange={(value) => setNewGoal({ ...newGoal, category: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder={t("goals.selectCategory")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="web-development">Веб-разработка</SelectItem>
                    <SelectItem value="mobile-development">Мобильная разработка</SelectItem>
                    <SelectItem value="data-science">Наука о данных</SelectItem>
                    <SelectItem value="design">Дизайн</SelectItem>
                    <SelectItem value="business">Бизнес</SelectItem>
                    <SelectItem value="other">Другое</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">{t("goals.description")}</Label>
                <Textarea
                  id="description"
                  placeholder={t("goals.descriptionPlaceholder")}
                  value={newGoal.description}
                  onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="deadline">{t("goals.deadline")}</Label>
                <Input
                  id="deadline"
                  type="date"
                  value={newGoal.deadline}
                  onChange={(e) => setNewGoal({ ...newGoal, deadline: e.target.value })}
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowNewGoalDialog(false)}>
                {t("goals.cancel")}
              </Button>
              <Button onClick={handleCreateGoal} disabled={!newGoal.title || !newGoal.category}>
                {t("goals.createGoal")}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Goals List */}
        <div className="lg:col-span-2 space-y-4">
          {isLoading ? (
            // Loading skeletons
            Array.from({ length: 3 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <Skeleton className="h-6 w-48" />
                        <Skeleton className="h-4 w-32" />
                      </div>
                      <Skeleton className="h-6 w-20" />
                    </div>
                    <Skeleton className="h-2 w-full" />
                    <div className="flex justify-between">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : goals.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center space-y-2">
                  <Target className="w-12 h-12 mx-auto text-muted-foreground" />
                  <h3 className="font-semibold">Нет целей</h3>
                  <p className="text-sm text-muted-foreground">Создайте свою первую цель</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            goals.map((goal: any) => (
              <Card
                key={goal.id}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedGoal?.id === goal.id ? "ring-2 ring-blue-500" : ""
                }`}
                onClick={() => setSelectedGoal(goal)}
              >
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <h3 className="font-semibold text-lg">{goal.title}</h3>
                        <p className="text-sm text-muted-foreground">{goal.category}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getStatusBadge(goal.status)}
                        <Button variant="ghost" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>{t("goals.progress")}</span>
                        <span>{goal.progress}%</span>
                      </div>
                      <Progress value={goal.progress} className="w-full" />
                    </div>

                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {t("goals.due")}: {goal.deadline ? new Date(goal.deadline).toLocaleDateString() : "Не указан"}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Target className="w-4 h-4" />
                        <span>
                          {goal.steps?.filter((s: any) => s.completed).length || 0}/{goal.steps?.length || 0}{" "}
                          {t("goals.steps")}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Goal Details */}
        <div className="space-y-4">
          {selectedGoal ? (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Target className="w-5 h-5" />
                    <span>{t("goals.goalDetails")}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold">{selectedGoal.title}</h4>
                    <p className="text-sm text-muted-foreground mt-1">{selectedGoal.description}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">{t("goals.category")}</span>
                      <p className="font-medium">{selectedGoal.category}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">{t("goals.status")}</span>
                      <div className="mt-1">{getStatusBadge(selectedGoal.status)}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">{t("goals.progress")}</span>
                      <p className="font-medium">{selectedGoal.progress}%</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">{t("goals.deadline")}</span>
                      <p className="font-medium">
                        {selectedGoal.deadline ? new Date(selectedGoal.deadline).toLocaleDateString() : "Не указан"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {selectedGoal.steps && selectedGoal.steps.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <CheckCircle2 className="w-5 h-5" />
                      <span>{t("goals.stepsChecklist")}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {selectedGoal.steps.map((step: any) => (
                      <div key={step.id} className="flex items-start space-x-3 p-2 rounded-lg hover:bg-muted/50">
                        <Checkbox
                          checked={step.completed}
                          onCheckedChange={(checked) => toggleStep(step.id, !!checked)}
                          className="mt-1"
                        />
                        <div className="flex-1 space-y-1">
                          <p className={`text-sm ${step.completed ? "line-through text-muted-foreground" : ""}`}>
                            {step.title}
                          </p>
                          {step.due_date && (
                            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                              <Clock className="w-3 h-3" />
                              <span>
                                {t("goals.due")}: {new Date(step.due_date).toLocaleDateString()}
                              </span>
                              {new Date(step.due_date) < new Date() && !step.completed && (
                                <div className="flex items-center space-x-1 text-red-500">
                                  <AlertCircle className="w-3 h-3" />
                                  <span>{t("goals.overdue")}</span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center space-y-2">
                  <Target className="w-12 h-12 mx-auto text-muted-foreground" />
                  <h3 className="font-semibold">{t("goals.selectGoal")}</h3>
                  <p className="text-sm text-muted-foreground">{t("goals.clickToView")}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

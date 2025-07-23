"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useUser } from "@/hooks/use-user"
import { useToast } from "@/hooks/use-toast"
import { Loader2, User, CalendarIcon, AlertCircle, Save } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import { format } from "date-fns"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import SplashScreen from "@/components/splash-screen" // Import SplashScreen component

export default function ProfilePage() {
  const { t } = useLanguage()
  const { user, loading, updateUserProfile } = useUser()
  const { toast } = useToast()

  const [name, setName] = useState("")
  const [focusArea, setFocusArea] = useState("")
  const [incomeGoal, setIncomeGoal] = useState<number | undefined>(undefined)
  const [targetDeadline, setTargetDeadline] = useState<Date | undefined>(undefined)
  const [obstacles, setObstacles] = useState<string[]>([])
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (user) {
      setName(user.name || "")
      setFocusArea(user.focus_area || "")
      setIncomeGoal(user.income_goal || undefined)
      setTargetDeadline(user.target_deadline ? new Date(user.target_deadline) : undefined)
      setObstacles(user.obstacles || [])
    }
  }, [user])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    const { success, error } = await updateUserProfile({
      name,
      focus_area: focusArea,
      income_goal: incomeGoal,
      target_deadline: targetDeadline?.toISOString() || null,
      obstacles,
    })

    if (success) {
      toast({
        title: "Профиль обновлен",
        description: "Ваши данные успешно сохранены.",
      })
    } else {
      toast({
        title: "Ошибка сохранения",
        description: error?.message || "Не удалось обновить профиль.",
        variant: "destructive",
      })
    }
    setIsSaving(false)
  }

  const obstacleOptions = [
    t("onboarding.timeManagement"),
    t("onboarding.technicalSkills"),
    t("onboarding.motivation"),
    t("onboarding.resources"),
    t("onboarding.network"),
    t("onboarding.experience"),
    t("onboarding.confidence"),
    t("onboarding.focus"),
  ]

  const toggleObstacle = (obstacle: string) => {
    setObstacles((prev) => (prev.includes(obstacle) ? prev.filter((o) => o !== obstacle) : [...prev, obstacle]))
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <SplashScreen />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-100 dark:from-gray-900 dark:to-gray-800 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="w-12 h-12 mx-auto text-red-500 mb-4" />
            <h3 className="font-semibold text-lg">Ошибка загрузки профиля</h3>
            <p className="text-sm text-muted-foreground">Пожалуйста, войдите в систему.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t("nav.profile")}</h1>
          <p className="text-muted-foreground">{t("profile.manageProfile")}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <User className="w-5 h-5" />
            <span>{t("profile.personalInfo")}</span>
          </CardTitle>
          <CardDescription>{t("profile.updateDetails")}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">{t("profile.name")}</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={user.email} disabled />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="focusArea">{t("onboarding.whatToDevelop")}</Label>
              <Input
                id="focusArea"
                value={focusArea}
                onChange={(e) => setFocusArea(e.target.value)}
                placeholder={t("onboarding.chooseFocusArea")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="incomeGoal">{t("onboarding.incomeGoal")}</Label>
              <Input
                id="incomeGoal"
                type="number"
                value={incomeGoal || ""}
                onChange={(e) => setIncomeGoal(Number(e.target.value))}
                placeholder="50000"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="deadline">{t("onboarding.achieveByWhen")}</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !targetDeadline && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {targetDeadline ? format(targetDeadline, "PPP") : t("onboarding.pickDate")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={targetDeadline}
                    onSelect={setTargetDeadline}
                    initialFocus
                    disabled={(date) => date < new Date()}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label className="text-base font-semibold flex items-center">
                <AlertCircle className="w-4 h-4 mr-2" />
                {t("onboarding.mainObstacles")}
              </Label>
              <p className="text-sm text-muted-foreground">{t("onboarding.selectAllThatApply")}</p>
              <div className="grid grid-cols-2 gap-2">
                {obstacleOptions.map((obstacle) => (
                  <Badge
                    key={obstacle}
                    variant={obstacles.includes(obstacle) ? "default" : "outline"}
                    className="cursor-pointer p-2 justify-center"
                    onClick={() => toggleObstacle(obstacle)}
                  >
                    {obstacle}
                  </Badge>
                ))}
              </div>
            </div>

            <Button type="submit" disabled={isSaving}>
              {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              {t("common.save")}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  CalendarIcon,
  ChevronRight,
  Target,
  DollarSign,
  CalendarIcon as CalendarIconLucide,
  AlertCircle,
} from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { useLanguage } from "@/contexts/language-context"

interface OnboardingData {
  name: string
  development: string
  customDevelopment?: string
  incomeGoal: number
  deadline: Date | undefined
  obstacles: string[]
}

interface OnboardingWizardProps {
  onComplete: (data: OnboardingData) => void
}

export function OnboardingWizard({ onComplete }: OnboardingWizardProps) {
  const { t } = useLanguage()
  const [step, setStep] = useState(0) // Start from step 0 for name input
  const [isLoading, setIsLoading] = useState(false)
  const [data, setData] = useState<OnboardingData>({
    name: "",
    development: "",
    incomeGoal: 50000,
    deadline: undefined,
    obstacles: [],
  })

  const developmentOptions = [
    t("onboarding.webDevelopment"),
    t("onboarding.mobileApps"),
    t("onboarding.dataScience"),
    t("onboarding.aiMl"),
    t("onboarding.devOps"),
    t("onboarding.design"),
    t("onboarding.marketing"),
    t("onboarding.other"),
  ]

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

  const handleNext = () => {
    if (step < 4) {
      // Total 5 steps (0-4)
      setStep(step + 1)
    } else {
      setIsLoading(true)
      // Simulate API call
      setTimeout(() => {
        setIsLoading(false)
        setStep(5) // Show roadmap preview
      }, 3000)
    }
  }

  const handleComplete = () => {
    onComplete(data)
  }

  const progress = (step / 4) * 100 // Progress bar for steps 1-4 (index 0-3)

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center space-y-6">
              <div className="w-16 h-16 mx-auto bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                <Target className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">{t("onboarding.buildingRoadmap")}</h3>
                <p className="text-sm text-muted-foreground">{t("onboarding.analyzingGoals")}</p>
              </div>
              <Progress value={66} className="w-full" />
              <div className="grid grid-cols-1 gap-2">
                {[
                  t("onboarding.analyzingGoals"),
                  t("onboarding.creatingMilestones"),
                  t("onboarding.buildingTimeline"),
                ].map((item, index) => (
                  <div key={item} className="flex items-center space-x-2 text-sm">
                    <div className={cn("w-2 h-2 rounded-full", index <= 1 ? "bg-blue-600" : "bg-gray-300")} />
                    <span className={index <= 1 ? "text-foreground" : "text-muted-foreground"}>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (step === 5) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 dark:from-gray-900 dark:to-gray-800 p-4">
        <Card className="w-full max-w-2xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">{t("onboarding.yourRoadmap")}</CardTitle>
            <CardDescription>
              {t("onboarding.yourPath")} {data.development.toLowerCase()} {t("onboarding.goals")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              {[
                {
                  title: t("onboarding.foundationBuildingTitle"),
                  duration: "2-4 weeks",
                  description: t("onboarding.foundationBuildingDescription"),
                },
                {
                  title: t("onboarding.skillDevelopmentTitle"),
                  duration: "6-8 weeks",
                  description: t("onboarding.skillDevelopmentDescription"),
                },
                {
                  title: t("onboarding.portfolioCreationTitle"),
                  duration: "4-6 weeks",
                  description: t("onboarding.portfolioCreationDescription"),
                },
                {
                  title: t("onboarding.networkApplyTitle"),
                  duration: "2-4 weeks",
                  description: t("onboarding.networkApplyDescription"),
                },
                {
                  title: t("onboarding.incomeOptimizationTitle"),
                  duration: "Ongoing",
                  description: t("onboarding.incomeOptimizationDescription"),
                },
              ].map((milestone, index) => (
                <Card key={index} className="border-l-4 border-l-blue-600">
                  <CardContent className="pt-4">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <h4 className="font-semibold">{milestone.title}</h4>
                        <p className="text-sm text-muted-foreground">{milestone.description}</p>
                      </div>
                      <Badge variant="secondary">{milestone.duration}</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <Button onClick={handleComplete} className="w-full" size="lg">
              <ChevronRight className="w-4 h-4 mr-2" />
              {t("onboarding.goToGoals")}
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="text-xl">
                {t("onboarding.step")} {step + 1} {t("onboarding.of")} 5
              </CardTitle>
              <CardDescription>{t("onboarding.personalizeExperience")}</CardDescription>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600">{step + 1}/5</div>
            </div>
          </div>
          <Progress value={progress} className="w-full" />
        </CardHeader>

        <CardContent className="space-y-6">
          {step === 0 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-base font-semibold">
                  {t("onboarding.whatsYourName")}
                </Label>
                <p className="text-sm text-muted-foreground">{t("onboarding.enterYourName")}</p>
              </div>
              <Input
                id="name"
                placeholder={t("onboarding.yourNamePlaceholder")}
                value={data.name}
                onChange={(e) => setData({ ...data, name: e.target.value })}
              />
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-base font-semibold">{t("onboarding.whatToDevelop")}</Label>
                <p className="text-sm text-muted-foreground">{t("onboarding.chooseFocusArea")}</p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {developmentOptions.map((option) => (
                  <Button
                    key={option}
                    variant={data.development === option ? "default" : "outline"}
                    className="h-auto p-3 text-left justify-start"
                    onClick={() => setData({ ...data, development: option })}
                  >
                    {option}
                  </Button>
                ))}
              </div>
              {data.development === t("onboarding.other") && (
                <div className="space-y-2">
                  <Label htmlFor="custom">{t("onboarding.specifyFocusArea")}</Label>
                  <Input
                    id="custom"
                    placeholder="e.g., Game Development, Blockchain..."
                    value={data.customDevelopment || ""}
                    onChange={(e) => setData({ ...data, customDevelopment: e.target.value })}
                  />
                </div>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <Label className="text-base font-semibold flex items-center">
                  <DollarSign className="w-4 h-4 mr-2" />
                  {t("onboarding.incomeGoal")}
                </Label>
                <p className="text-sm text-muted-foreground">{t("onboarding.annualTargetIncome")}</p>
              </div>
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">${data.incomeGoal.toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground">{t("onboarding.perYear")}</div>
                </div>
                <Slider
                  value={[data.incomeGoal]}
                  onValueChange={(value) => setData({ ...data, incomeGoal: value[0] })}
                  max={200000}
                  min={20000}
                  step={5000}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>$20K</span>
                  <span>$50K</span>
                  <span>$100K</span>
                  <span>$200K+</span>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-base font-semibold flex items-center">
                  <CalendarIconLucide className="w-4 h-4 mr-2" />
                  {t("onboarding.achieveByWhen")}
                </Label>
                <p className="text-sm text-muted-foreground">{t("onboarding.setTargetDeadline")}</p>
              </div>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !data.deadline && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {data.deadline ? format(data.deadline, "PPP") : t("onboarding.pickDate")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={data.deadline}
                    onSelect={(date) => setData({ ...data, deadline: date })}
                    initialFocus
                    disabled={(date) => date < new Date()}
                  />
                </PopoverContent>
              </Popover>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-base font-semibold flex items-center">
                  <AlertCircle className="w-4 h-4 mr-2" />
                  {t("onboarding.mainObstacles")}
                </Label>
                <p className="text-sm text-muted-foreground">{t("onboarding.selectAllThatApply")}</p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {obstacleOptions.map((obstacle) => (
                  <Badge
                    key={obstacle}
                    variant={data.obstacles.includes(obstacle) ? "default" : "outline"}
                    className="cursor-pointer p-2 justify-center"
                    onClick={() => {
                      const newObstacles = data.obstacles.includes(obstacle)
                        ? data.obstacles.filter((o) => o !== obstacle)
                        : [...data.obstacles, obstacle]
                      setData({ ...data, obstacles: newObstacles })
                    }}
                  >
                    {obstacle}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <Button
            onClick={handleNext}
            className="w-full"
            size="lg"
            disabled={
              (step === 0 && !data.name.trim()) ||
              (step === 1 && !data.development) ||
              (step === 1 && data.development === t("onboarding.other") && !data.customDevelopment) ||
              (step === 3 && !data.deadline) ||
              (step === 4 && data.obstacles.length === 0)
            }
          >
            {step === 4 ? t("onboarding.createRoadmap") : t("onboarding.continue")}
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

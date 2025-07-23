"use client"

import { Loader2 } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"

export function SplashScreen() {
  const { t } = useLanguage()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="text-center space-y-8">
        <div className="w-24 h-24 mx-auto bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center">
          <span className="text-2xl font-bold text-white">AI</span>
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t("auth.aiCoach")}</h1>
          <p className="text-gray-600 dark:text-gray-400">{t("auth.personalCompanion")}</p>
        </div>

        <div className="flex items-center justify-center space-x-2">
          <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
          <span className="text-sm text-gray-600 dark:text-gray-400">{t("common.loading")}</span>
        </div>
      </div>
    </div>
  )
}

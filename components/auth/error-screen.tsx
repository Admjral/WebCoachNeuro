"use client"

import { AlertTriangle, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useLanguage } from "@/contexts/language-context"

export function ErrorScreen() {
  const { t } = useLanguage()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-16 h-16 mx-auto bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          <CardTitle className="text-xl">{t("auth.accessDenied")}</CardTitle>
          <CardDescription>{t("auth.linkExpired")}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button className="w-full" onClick={() => window.open("https://t.me/support", "_blank")}>
            <MessageCircle className="w-4 h-4 mr-2" />
            {t("auth.contactTelegram")}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

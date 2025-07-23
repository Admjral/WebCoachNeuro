"use client"

import { AlertTriangle, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useLanguage } from "@/contexts/language-context"
import Link from "next/link"

export default function AuthCodeErrorPage() {
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
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground text-center">
            Возможно, ссылка подтверждения устарела или была использована ранее. Попробуйте войти в систему или
            зарегистрироваться заново.
          </p>
          <div className="flex flex-col space-y-2">
            <Button asChild>
              <Link href="/auth/login">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Вернуться к входу
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/auth/register">Зарегистрироваться заново</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

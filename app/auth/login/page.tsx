"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/hooks/use-auth"
import { Loader2, LogIn, AlertCircle, Eye, EyeOff } from "lucide-react"
import Link from "next/link"
import { useLanguage } from "@/contexts/language-context"

export default function LoginPage() {
  const { t } = useLanguage()
  const router = useRouter()
  const { signInWithPassword, loading } = useAuth()
  const { toast } = useToast()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<string[]>([])

  const validateForm = () => {
    const newErrors: string[] = []

    if (!email.trim()) {
      newErrors.push("Email обязателен")
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.push("Неверный формат email")
    }

    if (!password) {
      newErrors.push("Пароль обязателен")
    }

    setErrors(newErrors)
    return newErrors.length === 0
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    console.log("Attempting to login with email:", email)

    const { data, error } = await signInWithPassword(email, password)

    if (error) {
      console.error("Login error:", error)

      let errorMessage = "Ошибка входа"

      // Handle specific error cases
      if (error.message.includes("Invalid login credentials")) {
        errorMessage = "Неверный email или пароль. Убедитесь, что вы зарегистрированы и подтвердили email."
      } else if (error.message.includes("Email not confirmed")) {
        errorMessage = "Пожалуйста, подтвердите ваш email перед входом. Проверьте почту."
      } else if (error.message.includes("Too many requests")) {
        errorMessage = "Слишком много попыток входа. Попробуйте позже."
      } else {
        errorMessage = error.message
      }

      toast({
        title: "Ошибка входа",
        description: errorMessage,
        variant: "destructive",
      })
    } else {
      console.log("Login successful:", data)
      toast({
        title: "Успешный вход",
        description: "Добро пожаловать!",
      })
      router.push("/")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-16 h-16 mx-auto bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mb-4">
            <span className="text-xl font-bold text-white">AI</span>
          </div>
          <CardTitle className="text-2xl">{t("auth.aiCoach")}</CardTitle>
          <CardDescription>{t("auth.personalCompanion")}</CardDescription>
        </CardHeader>
        <CardContent>
          {errors.length > 0 && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <ul className="list-disc list-inside">
                  {errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{t("auth.password")}</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LogIn className="mr-2 h-4 w-4" />}
              {t("auth.login")}
            </Button>
          </form>

          <div className="mt-4 space-y-2">
            <div className="text-center text-sm">
              {t("auth.noAccount")}{" "}
              <Link href="/auth/register" className="underline">
                {t("auth.register")}
              </Link>
            </div>

            {/* Test account info for development */}
            <div className="mt-4 p-3 bg-muted rounded-lg">
              <p className="text-xs text-muted-foreground text-center">
                <strong>Для тестирования:</strong>
                <br />
                Сначала зарегистрируйтесь, затем используйте те же данные для входа
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

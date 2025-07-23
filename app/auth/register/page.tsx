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
import { Loader2, UserPlus, AlertCircle, CheckCircle, Eye, EyeOff } from "lucide-react"
import Link from "next/link"
import { useLanguage } from "@/contexts/language-context"

export default function RegisterPage() {
  const { t } = useLanguage()
  const router = useRouter()
  const { signUp, loading } = useAuth()
  const { toast } = useToast()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [registrationSuccess, setRegistrationSuccess] = useState(false)
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
    } else if (password.length < 6) {
      newErrors.push("Пароль должен содержать минимум 6 символов")
    }

    if (password !== confirmPassword) {
      newErrors.push("Пароли не совпадают")
    }

    setErrors(newErrors)
    return newErrors.length === 0
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    console.log("Attempting to register with email:", email)

    const { data, error } = await signUp(email, password)

    if (error) {
      console.error("Registration error:", error)

      let errorMessage = "Не удалось зарегистрироваться"

      // Handle specific error cases
      if (error.message.includes("User already registered")) {
        errorMessage = "Пользователь с таким email уже существует"
      } else if (error.message.includes("Invalid email")) {
        errorMessage = "Неверный формат email"
      } else if (error.message.includes("Password should be at least")) {
        errorMessage = "Пароль должен содержать минимум 6 символов"
      } else if (error.message.includes("Signup requires a valid password")) {
        errorMessage = "Требуется действительный пароль"
      } else {
        errorMessage = error.message
      }

      toast({
        title: "Ошибка регистрации",
        description: errorMessage,
        variant: "destructive",
      })
    } else {
      console.log("Registration successful:", data)

      // Check if user needs email confirmation
      if (data.user && !data.user.email_confirmed_at) {
        setRegistrationSuccess(true)
        toast({
          title: "Регистрация успешна!",
          description: "Проверьте свою почту для подтверждения аккаунта",
        })
      } else {
        // User is immediately confirmed, redirect to login
        toast({
          title: "Регистрация успешна!",
          description: "Теперь вы можете войти в систему",
        })
        router.push("/auth/login")
      }
    }
  }

  if (registrationSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 dark:from-gray-900 dark:to-gray-800 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-16 h-16 mx-auto bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <CardTitle className="text-2xl">Регистрация успешна!</CardTitle>
            <CardDescription>
              Мы отправили письмо с подтверждением на ваш email. Пожалуйста, проверьте почту и перейдите по ссылке для
              активации аккаунта.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button asChild className="w-full">
              <Link href="/auth/login">Перейти к входу</Link>
            </Button>
            <div className="text-center text-sm text-muted-foreground">
              <p>Не получили письмо? Проверьте папку "Спам" или попробуйте зарегистрироваться снова.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
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

          <form onSubmit={handleRegister} className="space-y-4">
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
                  minLength={6}
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
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Подтвердите пароль</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserPlus className="mr-2 h-4 w-4" />}
              {t("auth.register")}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            {t("auth.alreadyAccount")}{" "}
            <Link href="/auth/login" className="underline">
              {t("auth.login")}
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

"use client"

import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ModeToggle } from "@/components/mode-toggle"
import {
  LayoutDashboard,
  Target,
  MessageSquare,
  BookOpen,
  BarChart3,
  Settings,
  LogOut,
  User,
  LogIn,
  UserPlus,
} from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import { LanguageToggle } from "@/components/language-toggle"
import { useAuth } from "@/hooks/use-auth"
import { useUser } from "@/hooks/use-user"
import Link from "next/link"
import { useRouter } from "next/navigation" // Import router

interface NavigationProps {
  currentPage: string
  onNavigate: (page: string) => void
}

export function Navigation({ currentPage, onNavigate }: NavigationProps) {
  const { t } = useLanguage()
  const { session, signOut } = useAuth()
  const { user } = useUser()
  const router = useRouter() // Declare router

  const navItems = [
    { id: "dashboard", label: t("nav.dashboard"), icon: LayoutDashboard },
    { id: "goals", label: t("nav.goals"), icon: Target },
    { id: "chat", label: t("nav.chat"), icon: MessageSquare },
    { id: "library", label: t("nav.library"), icon: BookOpen },
    { id: "analytics", label: t("nav.analytics"), icon: BarChart3 },
  ]

  const userName = user?.name || user?.email?.split("@")[0] || "Пользователь"
  const userEmail = user?.email || "user@example.com"

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-sm font-bold text-white">AI</span>
            </div>
            <span className="font-bold text-xl">{t("auth.aiCoach")}</span>
          </div>

          {/* Navigation Items - Hidden on mobile */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <Button
                key={item.id}
                variant={currentPage === item.id ? "default" : "ghost"}
                onClick={() => onNavigate(item.id)}
                className="flex items-center space-x-2"
              >
                <item.icon className="w-4 h-4" />
                <span>{item.label}</span>
              </Button>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            <LanguageToggle />
            <ModeToggle />

            {session ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>{userName.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium">{userName}</p>
                      <p className="w-[200px] truncate text-sm text-muted-foreground">{userEmail}</p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => router.push("/profile")}>
                    <User className="mr-2 h-4 w-4" />
                    <span>{t("nav.profile")}</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>{t("nav.settings")}</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => signOut()}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>{t("nav.logout")}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center space-x-2">
                <Button variant="ghost" asChild>
                  <Link href="/auth/login">
                    <LogIn className="mr-2 h-4 w-4" />
                    {t("auth.login")}
                  </Link>
                </Button>
                <Button asChild>
                  <Link href="/auth/register">
                    <UserPlus className="mr-2 h-4 w-4" />
                    {t("auth.register")}
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

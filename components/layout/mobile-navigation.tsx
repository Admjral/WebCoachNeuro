"use client"

import { Button } from "@/components/ui/button"
import { LayoutDashboard, Target, MessageSquare, BookOpen } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"

interface MobileNavigationProps {
  currentPage: string
  onNavigate: (page: string) => void
}

export function MobileNavigation({ currentPage, onNavigate }: MobileNavigationProps) {
  const { t } = useLanguage()

  const navItems = [
    { id: "dashboard", label: t("nav.home"), icon: LayoutDashboard },
    { id: "goals", label: t("nav.goals"), icon: Target },
    { id: "chat", label: t("nav.chat"), icon: MessageSquare },
    { id: "library", label: t("nav.library"), icon: BookOpen },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t md:hidden">
      <div className="grid grid-cols-4 h-16">
        {navItems.map((item) => (
          <Button
            key={item.id}
            variant="ghost"
            onClick={() => onNavigate(item.id)}
            className={`flex flex-col items-center justify-center space-y-1 h-full rounded-none ${
              currentPage === item.id ? "text-primary bg-primary/10" : "text-muted-foreground"
            }`}
          >
            <item.icon className="w-5 h-5" />
            <span className="text-xs">{item.label}</span>
          </Button>
        ))}
      </div>
    </nav>
  )
}

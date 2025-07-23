"use client"

import { useState, useRef, useEffect } from "react"
import useSWR from "swr"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import { OpenAIKeyModal } from "@/components/modals/openai-key-modal"
import { Send, Bot, User, Pin, Lightbulb, Target, MessageSquare } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import { useUser } from "@clerk/nextjs"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

interface Message {
  id: string
  content: string
  sender: "user" | "assistant"
  role?: string
  created_at: string
}

export function ChatPage() {
  const { t } = useLanguage()
  const { toast } = useToast()
  const [inputValue, setInputValue] = useState("")
  const [selectedRole, setSelectedRole] = useState("coach")
  const [isTyping, setIsTyping] = useState(false)
  const [sessionId] = useState(() => `session-${Date.now()}`)
  const [openaiKey, setOpenaiKey] = useState("")
  const [showKeyModal, setShowKeyModal] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { user } = useUser()

  const {
    data: messages = [],
    mutate,
    isLoading,
    error: messagesError,
  } = useSWR(user ? `/api/messages?sessionId=${sessionId}` : null, fetcher, {
    fallbackData: [],
    onError: (error) => {
      console.error("Error fetching messages:", error)
      toast({
        title: "Ошибка загрузки сообщений",
        description: "Не удалось загрузить историю чата",
        variant: "destructive",
      })
    },
  })

  const { data: goals = [] } = useSWR("/api/goals", fetcher)

  if (messagesError) {
    console.error("Messages error:", messagesError)
  }

  // Ensure messages is always an array
  const messagesArray = Array.isArray(messages) ? messages : []

  useEffect(() => {
    // Check for stored OpenAI key
    if (typeof window !== "undefined") {
      const storedKey = localStorage.getItem("openaiKey")
      if (storedKey) {
        setOpenaiKey(storedKey)
      } else {
        setShowKeyModal(true)
      }
    }
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messagesArray])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleSaveKey = (key: string) => {
    setOpenaiKey(key)
    setShowKeyModal(false)
  }

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !openaiKey) return

    const userMessage = inputValue
    setInputValue("")
    setIsTyping(true)

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-openai-key": openaiKey,
        },
        body: JSON.stringify({
          sessionId,
          message: userMessage,
        }),
      })

      if (response.ok) {
        mutate() // Refresh messages
        toast({
          title: "Сообщение отправлено",
          description: "AI коуч отвечает...",
        })
      } else {
        throw new Error("Failed to send message")
      }
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось отправить сообщение",
        variant: "destructive",
      })
    } finally {
      setIsTyping(false)
    }
  }

  if (!openaiKey) {
    return <OpenAIKeyModal open={showKeyModal} onSave={handleSaveKey} />
  }

  const pinnedGoals = goals.filter((goal: any) => goal.status === "active").slice(0, 2)

  return (
    <div className="container mx-auto p-4 h-[calc(100vh-8rem)]">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full">
        {/* Chat Interface */}
        <div className="lg:col-span-3 flex flex-col">
          <Card className="flex-1 flex flex-col">
            <CardHeader className="flex-shrink-0">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <MessageSquare className="w-5 h-5" />
                  <span>{t("chat.aiCoachChat")}</span>
                </CardTitle>
                <div className="flex items-center space-x-2">
                  <Select value={selectedRole} onValueChange={setSelectedRole}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="coach">{t("chat.coach")}</SelectItem>
                      <SelectItem value="mentor">{t("chat.mentor")}</SelectItem>
                      <SelectItem value="strategist">{t("chat.strategist")}</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="sm" onClick={() => setShowKeyModal(true)}>
                    API Key
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="flex-1 flex flex-col p-0">
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {isLoading ? (
                    // Loading skeletons
                    Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="flex items-start space-x-3">
                        <Skeleton className="w-8 h-8 rounded-full" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-4 w-1/2" />
                        </div>
                      </div>
                    ))
                  ) : messagesArray.length === 0 ? (
                    <div className="text-center space-y-4 py-8">
                      <Bot className="w-16 h-16 mx-auto text-muted-foreground" />
                      <div className="space-y-2">
                        <h3 className="font-semibold">Добро пожаловать!</h3>
                        <p className="text-sm text-muted-foreground">Начните разговор с вашим AI коучем</p>
                      </div>
                    </div>
                  ) : (
                    messagesArray.map((message: Message) => (
                      <div
                        key={message.id}
                        className={`flex items-start space-x-3 ${
                          message.sender === "user" ? "flex-row-reverse space-x-reverse" : ""
                        }`}
                      >
                        <Avatar className="w-8 h-8">
                          <AvatarFallback>
                            {message.sender === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                          </AvatarFallback>
                        </Avatar>

                        <div className={`flex-1 max-w-[80%] ${message.sender === "user" ? "text-right" : ""}`}>
                          <div
                            className={`rounded-lg p-3 ${
                              message.sender === "user" ? "bg-blue-600 text-white ml-auto" : "bg-muted"
                            }`}
                          >
                            {message.role && (
                              <Badge variant="secondary" className="mb-2 text-xs">
                                {message.role}
                              </Badge>
                            )}
                            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(message.created_at).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    ))
                  )}

                  {isTyping && (
                    <div className="flex items-start space-x-3">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback>
                          <Bot className="w-4 h-4" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="bg-muted rounded-lg p-3">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                          <div
                            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                            style={{ animationDelay: "0.1s" }}
                          />
                          <div
                            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                            style={{ animationDelay: "0.2s" }}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              <div className="p-4 border-t">
                <div className="flex space-x-2">
                  <Input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder={t("chat.askAnything")}
                    onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                    className="flex-1"
                  />
                  <Button onClick={handleSendMessage} disabled={!inputValue.trim() || isTyping}>
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Side Panel */}
        <div className="space-y-4">
          {/* Pinned Goals */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-sm">
                <Pin className="w-4 h-4" />
                <span>{t("chat.pinnedGoals")}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {pinnedGoals.length === 0 ? (
                <p className="text-sm text-muted-foreground">Нет активных целей</p>
              ) : (
                pinnedGoals.map((goal: any) => (
                  <div key={goal.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">{goal.title}</p>
                      <Target className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${goal.progress}%` }} />
                    </div>
                    <p className="text-xs text-muted-foreground">{goal.progress}% завершено</p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* AI Insights */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-sm">
                <Lightbulb className="w-4 h-4" />
                <span>{t("chat.aiInsights")}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-2 bg-muted/50 rounded-lg">
                <p className="text-xs">{t("chat.performBest")}</p>
              </div>
              <div className="p-2 bg-muted/50 rounded-lg">
                <p className="text-xs">{t("chat.breakingTasks")}</p>
              </div>
              <div className="p-2 bg-muted/50 rounded-lg">
                <p className="text-xs">{t("chat.visualLearners")}</p>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">{t("chat.quickActions")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" size="sm" className="w-full justify-start bg-transparent">
                {t("chat.reviewProgress")}
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start bg-transparent">
                {t("chat.setMilestone")}
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start bg-transparent">
                {t("chat.motivationBoost")}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <OpenAIKeyModal open={showKeyModal} onSave={handleSaveKey} />
    </div>
  )
}

"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Search, Filter, Play, Clock, BookOpen, Video, FileText, Star, Eye } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"

export function LibraryPage() {
  const { t } = useLanguage()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedContent, setSelectedContent] = useState<any>(null)

  const content = [
    {
      id: 1,
      title: "Продвинутый React",
      type: "video",
      duration: "45 min",
      category: "Веб-разработка",
      tags: ["React", "JavaScript", "Advanced"],
      thumbnail: "/placeholder.svg?height=200&width=300",
      description: "Изучите продвинутые концепции React включая хуки, контекст и оптимизацию производительности.",
      rating: 4.8,
      views: 1234,
      notes: `# Продвинутый React

## Render Props Pattern
The render props pattern is a technique for sharing code between React components using a prop whose value is a function.

## Higher-Order Components (HOCs)
HOCs are functions that take a component and return a new component with additional functionality.

## Compound Components
This pattern allows you to create components that work together to form a complete UI.`,
    },
    {
      id: 2,
      title: "Создание RESTful API",
      type: "video",
      duration: "60 min",
      category: "Backend разработка",
      tags: ["API", "REST", "Node.js"],
      thumbnail: "/placeholder.svg?height=200&width=300",
      description: "Полное руководство по созданию масштабируемых RESTful API с использованием Node.js и Express.",
      rating: 4.6,
      views: 892,
      notes: `# Создание RESTful API

## REST Principles
- Stateless communication
- Uniform interface
- Cacheable responses
- Client-server architecture

## Best Practices
- Use proper HTTP methods
- Implement proper error handling
- Add authentication and authorization`,
    },
    {
      id: 3,
      title: "Основы UI/UX дизайна",
      type: "article",
      duration: "15 min read",
      category: "Дизайн",
      tags: ["UI", "UX", "Design"],
      thumbnail: "/placeholder.svg?height=200&width=300",
      description:
        "Изучите фундаментальные принципы создания интуитивных и привлекательных пользовательских интерфейсов.",
      rating: 4.9,
      views: 2156,
      notes: `# Основы UI/UX дизайна

## Key Principles
1. **Clarity** - Make interfaces clear and understandable
2. **Consistency** - Maintain consistent patterns
3. **Accessibility** - Design for all users
4. **Feedback** - Provide clear user feedback`,
    },
    {
      id: 4,
      title: "Анализ данных с Python",
      type: "video",
      duration: "90 min",
      category: "Наука о данных",
      tags: ["Python", "Pandas", "Data Analysis"],
      thumbnail: "/placeholder.svg?height=200&width=300",
      description: "Освойте анализ данных с помощью Python, Pandas и других популярных библиотек.",
      rating: 4.7,
      views: 1567,
      notes: `# Анализ данных с Python

## Essential Libraries
- **Pandas** - Data manipulation and analysis
- **NumPy** - Numerical computing
- **Matplotlib** - Data visualization
- **Seaborn** - Statistical visualization`,
    },
    {
      id: 5,
      title: "Разработка мобильных приложений",
      type: "video",
      duration: "120 min",
      category: "Мобильная разработка",
      tags: ["React Native", "Mobile", "Cross-platform"],
      thumbnail: "/placeholder.svg?height=200&width=300",
      description: "Создавайте кроссплатформенные мобильные приложения с React Native.",
      rating: 4.5,
      views: 743,
      notes: `# Разработка мобильных приложений с React Native

## Getting Started
- Set up development environment
- Create your first app
- Understanding components

## Navigation
- Stack Navigator
- Tab Navigator
- Drawer Navigator`,
    },
    {
      id: 6,
      title: "Лучшие практики DevOps",
      type: "article",
      duration: "20 min read",
      category: "DevOps",
      tags: ["DevOps", "CI/CD", "Docker"],
      thumbnail: "/placeholder.svg?height=200&width=300",
      description: "Изучите современные практики DevOps для эффективной разработки и развертывания.",
      rating: 4.4,
      views: 1089,
      notes: `# Лучшие практики DevOps

## Continuous Integration/Continuous Deployment
- Automate testing and deployment
- Use version control effectively
- Monitor application performance
- Implement infrastructure as code

## Containerization
- Docker for consistent environments
- Kubernetes for orchestration
- Microservices architecture`,
    },
  ]

  const categories = [
    "all",
    "Веб-разработка",
    "Backend разработка",
    "Дизайн",
    "Наука о данных",
    "Мобильная разработка",
    "DevOps",
  ]

  const filteredContent = content.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "video":
        return <Video className="w-4 h-4" />
      case "article":
        return <FileText className="w-4 h-4" />
      default:
        return <BookOpen className="w-4 h-4" />
    }
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Библиотека контента</h1>
          <p className="text-muted-foreground">Изучите кураторские обучающие ресурсы</p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Поиск контента..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Категория" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category === "all" ? "Все категории" : category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" className="flex items-center space-x-2 bg-transparent">
              <Filter className="w-4 h-4" />
              <span>Сортировать</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredContent.map((item) => (
          <Card key={item.id} className="hover:shadow-lg transition-shadow cursor-pointer">
            <div className="relative">
              <img
                src={item.thumbnail || "/placeholder.svg"}
                alt={item.title}
                className="w-full h-48 object-cover rounded-t-lg"
              />
              <div className="absolute top-2 left-2">
                <Badge variant="secondary" className="flex items-center space-x-1">
                  {getTypeIcon(item.type)}
                  <span className="capitalize">{item.type}</span>
                </Badge>
              </div>
              <div className="absolute bottom-2 right-2">
                <Badge variant="outline" className="bg-black/50 text-white border-white/20">
                  <Clock className="w-3 h-3 mr-1" />
                  {item.duration}
                </Badge>
              </div>
            </div>

            <CardContent className="pt-4">
              <div className="space-y-3">
                <div>
                  <h3 className="font-semibold text-lg line-clamp-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{item.category}</p>
                </div>

                <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>

                <div className="flex flex-wrap gap-1">
                  {item.tags.map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>

                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span>{item.rating}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Eye className="w-4 h-4" />
                    <span>{item.views.toLocaleString()}</span>
                  </div>
                </div>

                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="w-full" onClick={() => setSelectedContent(item)}>
                      <Play className="w-4 h-4 mr-2" />
                      {item.type === "video" ? "Смотреть" : "Читать"}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[80vh]">
                    <DialogHeader>
                      <DialogTitle className="flex items-center space-x-2">
                        {getTypeIcon(item.type)}
                        <span>{item.title}</span>
                      </DialogTitle>
                    </DialogHeader>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
                      {/* Content Viewer */}
                      <div className="space-y-4">
                        {item.type === "video" ? (
                          <div className="aspect-video bg-black rounded-lg flex items-center justify-center">
                            <div className="text-center text-white space-y-2">
                              <Play className="w-16 h-16 mx-auto" />
                              <p>Видеоплеер</p>
                              <p className="text-sm opacity-75">{item.duration}</p>
                            </div>
                          </div>
                        ) : (
                          <div className="bg-muted p-4 rounded-lg">
                            <div className="text-center space-y-2">
                              <FileText className="w-16 h-16 mx-auto text-muted-foreground" />
                              <p className="font-medium">Содержание статьи</p>
                              <p className="text-sm text-muted-foreground">{item.duration}</p>
                            </div>
                          </div>
                        )}

                        <div className="space-y-2">
                          <h4 className="font-semibold">Описание</h4>
                          <p className="text-sm text-muted-foreground">{item.description}</p>
                        </div>

                        <div className="flex flex-wrap gap-1">
                          {item.tags.map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* Notes */}
                      <div className="space-y-4">
                        <h4 className="font-semibold">Заметки</h4>
                        <ScrollArea className="h-96 border rounded-lg p-4">
                          <div className="prose prose-sm max-w-none">
                            <pre className="whitespace-pre-wrap text-sm">{item.notes}</pre>
                          </div>
                        </ScrollArea>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredContent.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <BookOpen className="w-12 h-12 mx-auto text-muted-foreground" />
              <h3 className="font-semibold">Контент не найден</h3>
              <p className="text-sm text-muted-foreground">Попробуйте изменить критерии поиска или фильтра</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

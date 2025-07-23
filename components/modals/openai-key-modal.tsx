"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Key } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"

interface OpenAIKeyModalProps {
  open: boolean
  onSave: (key: string) => void
}

export function OpenAIKeyModal({ open, onSave }: OpenAIKeyModalProps) {
  const { t } = useLanguage()
  const [tempKey, setTempKey] = useState("")

  const handleSave = () => {
    if (tempKey.trim()) {
      localStorage.setItem("openaiKey", tempKey.trim())
      onSave(tempKey.trim())
      setTempKey("")
    }
  }

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Key className="w-5 h-5" />
            <span>OpenAI API Key</span>
          </DialogTitle>
          <DialogDescription>
            Введите ваш OpenAI API ключ для работы с AI коучем. Ключ будет сохранен локально в браузере.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="api-key">API Key</Label>
            <Input
              id="api-key"
              type="password"
              placeholder="sk-..."
              value={tempKey}
              onChange={(e) => setTempKey(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSave()}
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button onClick={handleSave} disabled={!tempKey.trim()}>
              Сохранить
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

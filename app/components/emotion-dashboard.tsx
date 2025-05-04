"use client"

import { useState, useEffect } from "react"
import { RefreshCw, Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { EmotionTable } from "@/app/components/emotion-table"
import { getAnalyses } from "../server_actions"

interface Analysis {
  id: string;
  emotion: string;
  confidence: number;
  timestamp: string;
}

interface EmotionDashboardProps {
  initialData: Analysis[];
  userId?: string;
}

export function EmotionDashboard({ initialData, userId }: EmotionDashboardProps) {
  const [analyses, setAnalyses] = useState<Analysis[]>(initialData)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedEmotion, setSelectedEmotion] = useState("all")

  useEffect(() => {
    const fetchAnalyses = async () => {
      try {
        const data = await getAnalyses(userId)
        setAnalyses(data)
      } catch (error) {
        console.error("Error fetching analyses:", error)
      }
    }

    fetchAnalyses()
  }, [userId])

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row gap-4 justify-between">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search emotions..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={selectedEmotion} onValueChange={setSelectedEmotion}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter by emotion" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Emotions</SelectItem>
              <SelectItem value="happy">Happy</SelectItem>
              <SelectItem value="sad">Sad</SelectItem>
              <SelectItem value="angry">Angry</SelectItem>
              <SelectItem value="neutral">Neutral</SelectItem>
              <SelectItem value="fearful">Fearful</SelectItem>
              <SelectItem value="disgust">Disgust</SelectItem>
              <SelectItem value="surprised">Surprised</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          <Button variant="outline" size="icon">
            <RefreshCw className="h-4 w-4" />
            <span className="sr-only">Refresh</span>
          </Button>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Emotion Logs</CardTitle>
          <CardDescription>View your emotion analysis history.</CardDescription>
        </CardHeader>
        <CardContent>
          <EmotionTable 
            data={analyses}
            searchQuery={searchQuery} 
            emotionFilter={selectedEmotion} 
          />
        </CardContent>
      </Card>
    </div>
  )
}


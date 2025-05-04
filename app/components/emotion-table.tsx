"use client"

import { useState } from "react"
import { Smile, Frown, Meh, Angry, Heart, ArrowUpDown, MoreHorizontal } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface Analysis {
  id: string;
  emotion: string;
  confidence: number;
  timestamp: string;
}

interface EmotionTableProps {
  data: Analysis[];
  searchQuery: string;
  emotionFilter: string;
}

export function EmotionTable({ data, searchQuery, emotionFilter }: EmotionTableProps) {
  const [sortColumn, setSortColumn] = useState("timestamp")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")
  const [page, setPage] = useState(1)
  const itemsPerPage = 5

  // Filter and sort the data
  const filteredData = data.filter((item) => {
    const matchesSearch =
      item.emotion.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.timestamp.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesEmotion =
      emotionFilter === "all" || item.emotion.toLowerCase() === emotionFilter.toLowerCase()

    return matchesSearch && matchesEmotion
  })

  const sortedData = [...filteredData].sort((a, b) => {
    if (sortColumn === "emotion") {
      return sortDirection === "asc"
        ? a.emotion.localeCompare(b.emotion)
        : b.emotion.localeCompare(a.emotion)
    } else if (sortColumn === "confidence") {
      return sortDirection === "asc"
        ? a.confidence - b.confidence
        : b.confidence - a.confidence
    } else if (sortColumn === "timestamp") {
      return sortDirection === "asc"
        ? new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        : new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    }
    return 0
  })

  // Paginate the data
  const paginatedData = sortedData.slice((page - 1) * itemsPerPage, page * itemsPerPage)
  const totalPages = Math.ceil(sortedData.length / itemsPerPage)

  // Handle sorting
  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortColumn(column)
      setSortDirection("asc")
    }
  }

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", {
      month: "numeric",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  return (
    <Table>
      <TableHeader>
        <TableRow key="header">
          <TableHead key="emotion">
            <Button
              variant="ghost"
              className="flex items-center gap-2 p-0 hover:bg-transparent"
              onClick={() => handleSort("emotion")}
            >
              Emotion
              <ArrowUpDown className="h-4 w-4" />
            </Button>
          </TableHead>
          <TableHead key="confidence">
            <Button
              variant="ghost"
              className="flex items-center gap-2 p-0 hover:bg-transparent"
              onClick={() => handleSort("confidence")}
            >
              Confidence
              <ArrowUpDown className="h-4 w-4" />
            </Button>
          </TableHead>
          <TableHead key="timestamp">
            <Button
              variant="ghost"
              className="flex items-center gap-2 p-0 hover:bg-transparent"
              onClick={() => handleSort("timestamp")}
            >
              Timestamp
              <ArrowUpDown className="h-4 w-4" />
            </Button>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {paginatedData.length > 0 ? (
          paginatedData.map((log) => (
            <TableRow key={log.id}>
              <TableCell key={`${log.id}-emotion`} className="flex items-center gap-2">
                {log.emotion === "happy" && <Smile className="h-4 w-4 text-green-500" />}
                {log.emotion === "sad" && <Frown className="h-4 w-4 text-blue-500" />}
                {log.emotion === "angry" && <Angry className="h-4 w-4 text-red-500" />}
                {log.emotion === "neutral" && <Meh className="h-4 w-4 text-gray-500" />}
                {log.emotion === "excited" && <Heart className="h-4 w-4 text-pink-500" />}
                <span className="capitalize">{log.emotion}</span>
              </TableCell>
              <TableCell key={`${log.id}-confidence`}>{(log.confidence * 100).toFixed(0)}%</TableCell>
              <TableCell key={`${log.id}-timestamp`}>{formatDate(log.timestamp)}</TableCell>
            </TableRow>
          ))
        ) : (
          <TableRow key="no-results">
            <TableCell key="no-results-cell" colSpan={3} className="text-center py-6 text-muted-foreground">
              No emotion logs found matching your filters.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  )
}


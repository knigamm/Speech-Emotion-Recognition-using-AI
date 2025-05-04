"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  Search,
  RefreshCw,
  Download,
  MoreHorizontal,
  ArrowUpDown,
  Users,
  Smile,
  Frown,
  Angry,
  Meh,
  Heart,
  User,
} from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from 'recharts';

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  imageUrl: string;
  role: string;
  department?: string;
  status?: string;
  lastActive?: string;
  totalRecordings?: number;
  emotionCounts?: Record<string, number>;
}

interface EmotionData {
  emotion: string;
  count: number;
}

interface AdminDashboardProps {
  users: User[];
  emotionDistribution: EmotionData[];
  dailyUserStats: { date: string; users: number }[];
}

// Add color constants for the pie chart
const EMOTION_COLORS = {
  happy: "#4ade80",
  sad: "#60a5fa",
  angry: "#ef4444",
  neutral: "#94a3b8",
  excited: "#ec4899",
  calm: "#8b5cf6",
  fearful: "#f59e0b",
  disgust: "#10b981",
  surprised: "#f472b6",
};

// Mock data for users
const mockUsers = [
  {
    id: "user1",
    name: "John Doe",
    email: "john.doe@example.com",
    role: "Manager",
    department: "Sales",
    lastActive: "2025-03-16T10:30:00",
    dominantEmotion: "happy",
    emotionCounts: { happy: 45, sad: 12, angry: 8, neutral: 30, excited: 25 },
    totalRecordings: 120,
    status: "active",
  },
  {
    id: "user2",
    name: "Jane Smith",
    email: "jane.smith@example.com",
    role: "Team Lead",
    department: "Marketing",
    lastActive: "2025-03-16T09:15:00",
    dominantEmotion: "neutral",
    emotionCounts: { happy: 30, sad: 15, angry: 10, neutral: 50, excited: 15 },
    totalRecordings: 120,
    status: "active",
  },
  {
    id: "user3",
    name: "Robert Johnson",
    email: "robert.johnson@example.com",
    role: "Customer Service",
    department: "Support",
    lastActive: "2025-03-15T16:45:00",
    dominantEmotion: "angry",
    emotionCounts: { happy: 20, sad: 25, angry: 40, neutral: 30, excited: 5 },
    totalRecordings: 120,
    status: "inactive",
  },
  {
    id: "user4",
    name: "Emily Davis",
    email: "emily.davis@example.com",
    role: "Developer",
    department: "Engineering",
    lastActive: "2025-03-16T11:20:00",
    dominantEmotion: "excited",
    emotionCounts: { happy: 35, sad: 5, angry: 10, neutral: 20, excited: 50 },
    totalRecordings: 120,
    status: "active",
  },
  {
    id: "user5",
    name: "Michael Wilson",
    email: "michael.wilson@example.com",
    role: "HR Specialist",
    department: "Human Resources",
    lastActive: "2025-03-14T14:10:00",
    dominantEmotion: "sad",
    emotionCounts: { happy: 15, sad: 45, angry: 20, neutral: 25, excited: 10 },
    totalRecordings: 115,
    status: "active",
  },
  {
    id: "user6",
    name: "Sarah Brown",
    email: "sarah.brown@example.com",
    role: "Product Manager",
    department: "Product",
    lastActive: "2025-03-16T08:45:00",
    dominantEmotion: "happy",
    emotionCounts: { happy: 50, sad: 10, angry: 5, neutral: 25, excited: 30 },
    totalRecordings: 120,
    status: "active",
  },
  {
    id: "user7",
    name: "David Miller",
    email: "david.miller@example.com",
    role: "Sales Representative",
    department: "Sales",
    lastActive: "2025-03-15T13:30:00",
    dominantEmotion: "neutral",
    emotionCounts: { happy: 30, sad: 20, angry: 15, neutral: 40, excited: 15 },
    totalRecordings: 120,
    status: "inactive",
  },
  {
    id: "user8",
    name: "Lisa Taylor",
    email: "lisa.taylor@example.com",
    role: "Content Writer",
    department: "Marketing",
    lastActive: "2025-03-16T10:05:00",
    dominantEmotion: "excited",
    emotionCounts: { happy: 35, sad: 10, angry: 5, neutral: 20, excited: 40 },
    totalRecordings: 110,
    status: "active",
  },
  {
    id: "user9",
    name: "James Anderson",
    email: "james.anderson@example.com",
    role: "Support Specialist",
    department: "Support",
    lastActive: "2025-03-16T09:50:00",
    dominantEmotion: "neutral",
    emotionCounts: { happy: 25, sad: 20, angry: 15, neutral: 45, excited: 15 },
    totalRecordings: 120,
    status: "active",
  },
  {
    id: "user10",
    name: "Jennifer White",
    email: "jennifer.white@example.com",
    role: "UX Designer",
    department: "Design",
    lastActive: "2025-03-15T15:20:00",
    dominantEmotion: "happy",
    emotionCounts: { happy: 40, sad: 15, angry: 10, neutral: 25, excited: 30 },
    totalRecordings: 120,
    status: "active",
  },
  {
    id: "user11",
    name: "Thomas Clark",
    email: "thomas.clark@example.com",
    role: "Backend Developer",
    department: "Engineering",
    lastActive: "2025-03-14T16:15:00",
    dominantEmotion: "angry",
    emotionCounts: { happy: 20, sad: 15, angry: 35, neutral: 25, excited: 5 },
    totalRecordings: 100,
    status: "inactive",
  },
  {
    id: "user12",
    name: "Patricia Lewis",
    email: "patricia.lewis@example.com",
    role: "Finance Manager",
    department: "Finance",
    lastActive: "2025-03-16T11:40:00",
    dominantEmotion: "neutral",
    emotionCounts: { happy: 30, sad: 20, angry: 10, neutral: 35, excited: 15 },
    totalRecordings: 110,
    status: "active",
  },
]

// Emotion icon mapping
const emotionIcons = {
  happy: <Smile className="h-4 w-4 text-green-500" />,
  sad: <Frown className="h-4 w-4 text-blue-500" />,
  angry: <Angry className="h-4 w-4 text-red-500" />,
  neutral: <Meh className="h-4 w-4 text-gray-500" />,
  excited: <Heart className="h-4 w-4 text-pink-500" />,
}

// Status badge mapping
const statusBadges = {
  active: (
    <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">
      Active
    </Badge>
  ),
  inactive: (
    <Badge variant="outline" className="bg-gray-100 text-gray-800 hover:bg-gray-100">
      Inactive
    </Badge>
  ),
}

export function AdminDashboard({ users, emotionDistribution, dailyUserStats }: AdminDashboardProps) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [sortColumn, setSortColumn] = useState("name")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const [page, setPage] = useState(1)
  const itemsPerPage = 8

  // Filter and sort the data
  const filteredData = users.filter((user) => {
    const matchesSearch =
      searchQuery === "" ||
      `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.role.toLowerCase().includes(searchQuery.toLowerCase())

    return matchesSearch
  })

  const sortedData = [...filteredData].sort((a, b) => {
    if (sortColumn === "name") {
      const nameA = `${a.firstName} ${a.lastName}`;
      const nameB = `${b.firstName} ${b.lastName}`;
      return sortDirection === "asc" ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
    } else if (sortColumn === "lastActive" && a.lastActive && b.lastActive) {
      return sortDirection === "asc"
        ? new Date(a.lastActive).getTime() - new Date(b.lastActive).getTime()
        : new Date(b.lastActive).getTime() - new Date(a.lastActive).getTime();
    } else if (sortColumn === "totalRecordings") {
      const aRecordings = a.totalRecordings ?? 0;
      const bRecordings = b.totalRecordings ?? 0;
      return sortDirection === "asc" ? aRecordings - bRecordings : bRecordings - aRecordings;
    }
    return 0;
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
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  const navigateToUserDashboard = (userId: string) => {
    router.push(`/dashboard/${userId}`)
  }

  const totalUsers = users.length;
  const activeUsers = users.filter((user) => user.status === "active").length;

  const emotionTotals = users.reduce(
    (acc, user) => {
      if (user.emotionCounts) {
        Object.entries(user.emotionCounts).forEach(([emotion, count]) => {
          acc[emotion] = (acc[emotion] || 0) + count;
        });
      }
      return acc;
    },
    { neutral: 0 } as Record<string, number>,
  );

  const dominantEmotion = Object.entries(emotionTotals).reduce((a, b) => (a[1] > b[1] ? a : b))[0] as keyof typeof emotionIcons;

  // Remove the getDailyUserData function and use the prop directly
  const dailyUserData = dailyUserStats;

  return (
    <div className="flex flex-col gap-6">
      {/* Stats Overview */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Users Over Time</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyUserData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis 
                    domain={[0, 'dataMax']}
                    tickCount={Math.ceil(Math.max(...dailyUserData.map(d => d.users)) + 1)}
                    allowDecimals={false}
                  />
                  <Tooltip />
                  <Bar dataKey="users" fill="#4695f1" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {totalUsers} total users ({activeUsers} active)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Emotion Distribution</CardTitle>
            {emotionIcons[dominantEmotion]}
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={emotionDistribution}
                    dataKey="count"
                    nameKey="emotion"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    innerRadius={40}
                    paddingAngle={5}
                    label={({ emotion, count, percent }) => 
                      `${emotion} (${(percent * 100).toFixed(0)}%)`
                    }
                  >
                    {emotionDistribution.map((entry) => (
                      <Cell
                        key={entry.emotion}
                        fill={EMOTION_COLORS[entry.emotion as keyof typeof EMOTION_COLORS] || "#64748b"}
                      />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => [`${value} recordings`, 'Count']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4">
              <p className="text-sm text-center text-muted-foreground">
                Total recordings: {emotionDistribution.reduce((sum, item) => sum + item.count, 0)}
              </p>
              <div className="flex flex-wrap justify-center gap-2 mt-2">
                {emotionDistribution.map((item) => (
                  <div key={item.emotion} className="flex items-center gap-1">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ 
                        backgroundColor: EMOTION_COLORS[item.emotion as keyof typeof EMOTION_COLORS] 
                      }} 
                    />
                    <span className="text-xs capitalize">{item.emotion}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 justify-between">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search users..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          <Button variant="outline" size="icon">
            <RefreshCw className="h-4 w-4" />
            <span className="sr-only">Refresh</span>
          </Button>
          <Button variant="outline" size="icon">
            <Download className="h-4 w-4" />
            <span className="sr-only">Download</span>
          </Button>
        </div>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
          <CardDescription>View and manage all users in the system.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.map((user) => (
                <TableRow 
                  key={user.id}
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => router.push(`/dashboard/${user.id}`)}
                >
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar>
                        <AvatarImage src={user.imageUrl} alt={`${user.firstName} ${user.lastName}`} />
                        <AvatarFallback>
                          {`${user.firstName} ${user.lastName}`
                            .split(" ")
                            .map((n: string) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <span>{`${user.firstName} ${user.lastName}`}</span>
                    </div>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.role}</TableCell>
                  <TableCell>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/dashboard/${user.id}`);
                      }}
                    >
                      View Dashboard
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {totalPages > 1 && (
            <div className="mt-4">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      className={page === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>

                  {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
                    let pageNumber: number

                    // Logic to show pages around the current page
                    if (totalPages <= 5) {
                      pageNumber = i + 1
                    } else if (page <= 3) {
                      pageNumber = i + 1
                      if (i === 4)
                        return (
                          <PaginationItem key={i}>
                            <PaginationEllipsis />
                          </PaginationItem>
                        )
                    } else if (page >= totalPages - 2) {
                      pageNumber = totalPages - 4 + i
                      if (i === 0)
                        return (
                          <PaginationItem key={i}>
                            <PaginationEllipsis />
                          </PaginationItem>
                        )
                    } else {
                      if (i === 0)
                        return (
                          <PaginationItem key={i}>
                            <PaginationLink onClick={() => setPage(1)}>1</PaginationLink>
                          </PaginationItem>
                        )
                      if (i === 1)
                        return (
                          <PaginationItem key={i}>
                            <PaginationEllipsis />
                          </PaginationItem>
                        )
                      if (i === 3)
                        return (
                          <PaginationItem key={i}>
                            <PaginationEllipsis />
                          </PaginationItem>
                        )
                      if (i === 4)
                        return (
                          <PaginationItem key={i}>
                            <PaginationLink onClick={() => setPage(totalPages)}>{totalPages}</PaginationLink>
                          </PaginationItem>
                        )
                      pageNumber = page + i - 2
                    }

                    return (
                      <PaginationItem key={i}>
                        <PaginationLink onClick={() => setPage(pageNumber)} isActive={page === pageNumber}>
                          {pageNumber}
                        </PaginationLink>
                      </PaginationItem>
                    )
                  })}

                  <PaginationItem>
                    <PaginationNext
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      className={page === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}


"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Trash2, Edit, Calendar, Tag, MoreHorizontal, CheckSquare, Square } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Progress } from "@/components/ui/progress"

interface Task {
  id: string
  title: string
  description: string
  status: "not-started" | "in-progress" | "completed"
  priority: "low" | "medium" | "high"
  dueDate?: string
  category: string
}

export default function TaskManager() {
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: "task-1",
      title: "Finalize Q3 Budget",
      description: "Review and approve the Q3 budget proposals from all departments.",
      status: "in-progress",
      priority: "high",
      dueDate: "2023-07-25",
      category: "Finance",
    },
    {
      id: "task-2",
      title: "Prepare Board Meeting Presentation",
      description: "Create slides for the upcoming board meeting covering Q2 results and Q3 outlook.",
      status: "not-started",
      priority: "high",
      dueDate: "2023-07-28",
      category: "Executive",
    },
    {
      id: "task-3",
      title: "Review Marketing Campaign Results",
      description: "Analyze the results of the summer marketing campaign and prepare recommendations.",
      status: "completed",
      priority: "medium",
      dueDate: "2023-07-15",
      category: "Marketing",
    },
    {
      id: "task-4",
      title: "Conduct Performance Reviews",
      description: "Complete mid-year performance reviews for direct reports.",
      status: "in-progress",
      priority: "medium",
      dueDate: "2023-07-31",
      category: "HR",
    },
    {
      id: "task-5",
      title: "Update Strategic Plan",
      description: "Revise the 5-year strategic plan based on recent market changes.",
      status: "not-started",
      priority: "low",
      dueDate: "2023-08-15",
      category: "Strategy",
    },
  ])

  const [activeTab, setActiveTab] = useState("all")
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [newTask, setNewTask] = useState<Omit<Task, "id">>({
    title: "",
    description: "",
    status: "not-started",
    priority: "medium",
    category: "Work",
  })

  const categories = Array.from(new Set(tasks.map((task) => task.category)))

  const filteredTasks =
    activeTab === "all"
      ? tasks
      : activeTab === "completed"
        ? tasks.filter((task) => task.status === "completed")
        : activeTab === "in-progress"
          ? tasks.filter((task) => task.status === "in-progress")
          : tasks.filter((task) => task.status === "not-started")

  const handleAddTask = () => {
    const task: Task = {
      id: `task-${Date.now()}`,
      ...newTask,
    }

    setTasks([...tasks, task])
    setNewTask({
      title: "",
      description: "",
      status: "not-started",
      priority: "medium",
      category: "Work",
    })
    setIsAddTaskOpen(false)
  }

  const handleUpdateTask = () => {
    if (!editingTask) return

    setTasks(tasks.map((task) => (task.id === editingTask.id ? editingTask : task)))

    setEditingTask(null)
  }

  const handleDeleteTask = (id: string) => {
    setTasks(tasks.filter((task) => task.id !== id))
  }

  const handleToggleStatus = (id: string) => {
    setTasks(
      tasks.map((task) => {
        if (task.id !== id) return task

        const newStatus = task.status === "completed" ? "not-started" : "completed"

        return { ...task, status: newStatus }
      }),
    )
  }

  const getStatusBadge = (status: Task["status"]) => {
    switch (status) {
      case "not-started":
        return (
          <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
            Not Started
          </Badge>
        )
      case "in-progress":
        return (
          <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20">
            In Progress
          </Badge>
        )
      case "completed":
        return (
          <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
            Completed
          </Badge>
        )
    }
  }

  const getPriorityBadge = (priority: Task["priority"]) => {
    switch (priority) {
      case "low":
        return (
          <Badge variant="outline" className="bg-gray-500/10 text-gray-500 border-gray-500/20">
            Low
          </Badge>
        )
      case "medium":
        return (
          <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20">
            Medium
          </Badge>
        )
      case "high":
        return (
          <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20">
            High
          </Badge>
        )
    }
  }

  const calculateProgress = () => {
    const completed = tasks.filter((task) => task.status === "completed").length
    return (completed / tasks.length) * 100
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Tasks & Projects</h2>
        <Button onClick={() => setIsAddTaskOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Task
        </Button>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="text-sm font-medium">Task Progress</h3>
            <div className="flex items-center gap-2">
              <Progress value={calculateProgress()} className="h-2 w-[200px]" />
              <span className="text-sm text-muted-foreground">
                {tasks.filter((task) => task.status === "completed").length}/{tasks.length} completed
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <span className="text-xs text-muted-foreground">Not Started</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-blue-500" />
              <span className="text-xs text-muted-foreground">In Progress</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="text-xs text-muted-foreground">Completed</span>
            </div>
          </div>
        </div>

        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-secondary border border-border">
            <TabsTrigger value="all" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
              All Tasks
            </TabsTrigger>
            <TabsTrigger
              value="not-started"
              className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
            >
              Not Started
            </TabsTrigger>
            <TabsTrigger
              value="in-progress"
              className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
            >
              In Progress
            </TabsTrigger>
            <TabsTrigger
              value="completed"
              className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
            >
              Completed
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="border border-border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40px]"></TableHead>
                <TableHead>Task</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTasks.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No tasks found
                  </TableCell>
                </TableRow>
              ) : (
                filteredTasks.map((task) => (
                  <TableRow key={task.id}>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleToggleStatus(task.id)}
                        className="h-6 w-6"
                      >
                        {task.status === "completed" ? (
                          <CheckSquare className="h-4 w-4 text-primary" />
                        ) : (
                          <Square className="h-4 w-4" />
                        )}
                      </Button>
                    </TableCell>
                    <TableCell className="font-medium">
                      <div className="max-w-[300px]">
                        <div className={task.status === "completed" ? "line-through text-muted-foreground" : ""}>
                          {task.title}
                        </div>
                        {task.description && (
                          <div className="text-xs text-muted-foreground truncate mt-1">{task.description}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Tag className="h-3 w-3 text-primary" />
                        <span className="text-xs">{task.category}</span>
                      </div>
                    </TableCell>
                    <TableCell>{getPriorityBadge(task.priority)}</TableCell>
                    <TableCell>
                      {task.dueDate ? (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs">{task.dueDate}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">No due date</span>
                      )}
                    </TableCell>
                    <TableCell>{getStatusBadge(task.status)}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setEditingTask(task)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDeleteTask(task.id)}>
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Add Task Dialog */}
      <Dialog open={isAddTaskOpen} onOpenChange={setIsAddTaskOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New Task</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Task Title</Label>
              <Input
                id="title"
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                placeholder="Enter task title"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={newTask.description}
                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                placeholder="Enter task description"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select value={newTask.category} onValueChange={(value) => setNewTask({ ...newTask, category: value })}>
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                    <SelectItem value="Work">Work</SelectItem>
                    <SelectItem value="Personal">Personal</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select
                  value={newTask.priority}
                  onValueChange={(value) => setNewTask({ ...newTask, priority: value as Task["priority"] })}
                >
                  <SelectTrigger id="priority">
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={newTask.status}
                  onValueChange={(value) => setNewTask({ ...newTask, status: value as Task["status"] })}
                >
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="not-started">Not Started</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="due-date">Due Date</Label>
                <Input
                  id="due-date"
                  type="date"
                  value={newTask.dueDate || ""}
                  onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddTaskOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddTask} disabled={!newTask.title}>
              Add Task
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Task Dialog */}
      <Dialog open={!!editingTask} onOpenChange={(open) => !open && setEditingTask(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
          </DialogHeader>
          {editingTask && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-title">Task Title</Label>
                <Input
                  id="edit-title"
                  value={editingTask.title}
                  onChange={(e) => setEditingTask({ ...editingTask, title: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={editingTask.description}
                  onChange={(e) => setEditingTask({ ...editingTask, description: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-category">Category</Label>
                  <Select
                    value={editingTask.category}
                    onValueChange={(value) => setEditingTask({ ...editingTask, category: value })}
                  >
                    <SelectTrigger id="edit-category">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                      <SelectItem value="Work">Work</SelectItem>
                      <SelectItem value="Personal">Personal</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-priority">Priority</Label>
                  <Select
                    value={editingTask.priority}
                    onValueChange={(value) => setEditingTask({ ...editingTask, priority: value as Task["priority"] })}
                  >
                    <SelectTrigger id="edit-priority">
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-status">Status</Label>
                  <Select
                    value={editingTask.status}
                    onValueChange={(value) => setEditingTask({ ...editingTask, status: value as Task["status"] })}
                  >
                    <SelectTrigger id="edit-status">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="not-started">Not Started</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-due-date">Due Date</Label>
                  <Input
                    id="edit-due-date"
                    type="date"
                    value={editingTask.dueDate || ""}
                    onChange={(e) => setEditingTask({ ...editingTask, dueDate: e.target.value })}
                  />
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingTask(null)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateTask}>Update Task</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Trash2, Edit, Calendar, MoreHorizontal, ListChecks } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"

interface Task {
  id: string
  title: string
  description?: string
  status: "todo" | "inprogress" | "done"
  priority: "low" | "medium" | "high"
  dueDate?: string
  category?: string
  assignee?: string // Added assignee
}

const initialTasks: Task[] = [
  {
    id: "task-1",
    title: "Finalize Q3 Budget for " + "Employee", // Placeholder, replace with actual employee name if needed
    description: "Review and approve the Q3 budget proposals from all departments.",
    status: "inprogress",
    priority: "high",
    dueDate: "2025-07-25",
    category: "Finance",
    assignee: "Eleanor R.",
  },
  {
    id: "task-2",
    title: "Prepare Board Meeting Presentation",
    description: "Create slides for the upcoming board meeting covering Q2 results and Q3 outlook.",
    status: "todo",
    priority: "high",
    dueDate: "2025-07-28",
    category: "Executive",
  },
  {
    id: "task-3",
    title: "Review Marketing Campaign Results",
    description: "Analyze the results of the summer marketing campaign and prepare recommendations.",
    status: "done",
    priority: "medium",
    dueDate: "2025-07-15",
    category: "Marketing",
    assignee: "James W.",
  },
  {
    id: "task-4",
    title: "Conduct Performance Reviews",
    description: "Complete mid-year performance reviews for direct reports.",
    status: "inprogress",
    priority: "medium",
    dueDate: "2025-07-31",
    category: "HR",
  },
]

const columns: { id: Task["status"]; title: string }[] = [
  { id: "todo", title: "To Do" },
  { id: "inprogress", title: "In Progress" },
  { id: "done", title: "Done" },
]

export default function TaskBoard({ employeeId }: { employeeId: string }) {
  const [tasks, setTasks] = useState<Task[]>(
    initialTasks.map((task) => ({ ...task, title: task.title.replace("Employee", `Employee ${employeeId}`) })),
  )
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [currentTaskForm, setCurrentTaskForm] = useState<Omit<Task, "id">>({
    title: "",
    description: "",
    status: "todo",
    priority: "medium",
    category: "Work",
  })

  const categories = useMemo(() => Array.from(new Set(tasks.map((task) => task.category).filter(Boolean))), [tasks])

  const openNewTaskDialog = () => {
    setEditingTask(null)
    setCurrentTaskForm({
      title: "",
      description: "",
      status: "todo",
      priority: "medium",
      category: "Work",
    })
    setIsTaskDialogOpen(true)
  }

  const openEditTaskDialog = (task: Task) => {
    setEditingTask(task)
    setCurrentTaskForm({ ...task })
    setIsTaskDialogOpen(true)
  }

  const handleSaveTask = () => {
    if (editingTask) {
      setTasks(
        tasks.map((task) => (task.id === editingTask.id ? ({ ...currentTaskForm, id: editingTask.id } as Task) : task)),
      )
    } else {
      setTasks([...tasks, { ...currentTaskForm, id: `task-${Date.now()}` } as Task])
    }
    setIsTaskDialogOpen(false)
    setEditingTask(null)
  }

  const handleDeleteTask = (id: string) => {
    setTasks(tasks.filter((task) => task.id !== id))
  }

  const getPriorityBadge = (priority: Task["priority"]) => {
    switch (priority) {
      case "low":
        return (
          <Badge
            variant="outline"
            className="bg-green-500/20 text-green-700 border-green-500/30 dark:text-green-400 dark:border-green-500/50"
          >
            Low
          </Badge>
        )
      case "medium":
        return (
          <Badge
            variant="outline"
            className="bg-yellow-500/20 text-yellow-700 border-yellow-500/30 dark:text-yellow-400 dark:border-yellow-500/50"
          >
            Medium
          </Badge>
        )
      case "high":
        return (
          <Badge
            variant="outline"
            className="bg-red-500/20 text-red-700 border-red-500/30 dark:text-red-400 dark:border-red-500/50"
          >
            High
          </Badge>
        )
    }
  }

  return (
    <div className="flex flex-col h-full p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <ListChecks className="h-6 w-6 text-primary" />
          <h3 className="font-semibold text-xl">Task Board</h3>
        </div>
        <Button onClick={openNewTaskDialog} size="sm" className="gap-2">
          <Plus className="h-4 w-4" /> Add Task
        </Button>
      </div>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 overflow-hidden">
        {columns.map((column) => (
          <Card
            key={column.id}
            className="bg-background/50 flex flex-col overflow-hidden border-[hsl(var(--border))]"
          >
            <CardHeader className="p-3 border-b border-[hsl(var(--border))]">
              <CardTitle className="text-base">
                {column.title}{" "}
                <span className="text-muted-foreground text-xs font-normal">
                  ({tasks.filter((t) => t.status === column.id).length})
                </span>
              </CardTitle>
            </CardHeader>
            <ScrollArea className="flex-1">
              <CardContent className="p-3 space-y-2">
                {tasks
                  .filter((task) => task.status === column.id)
                  .map((task) => (
                    <Card
                      key={task.id}
                      className="bg-[hsl(var(--panel-bg))] border-[hsl(var(--border))] group"
                    >
                      <CardContent className="p-2.5">
                        <div className="flex justify-between items-start mb-1">
                          <p className="text-sm font-medium leading-tight flex-1 mr-2">{task.title}</p>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 opacity-50 group-hover:opacity-100"
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => openEditTaskDialog(task)}>
                                <Edit className="h-3 w-3 mr-2" /> Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDeleteTask(task.id)} className="text-destructive">
                                <Trash2 className="h-3 w-3 mr-2" /> Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        {task.description && (
                          <p className="text-xs text-muted-foreground mb-2 truncate">{task.description}</p>
                        )}
                        <div className="flex items-center justify-between text-xs">
                          {getPriorityBadge(task.priority)}
                          {task.dueDate && (
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <Calendar className="h-3 w-3" />
                              <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                            </div>
                          )}
                        </div>
                        {task.assignee && (
                          <Badge variant="secondary" className="mt-2 text-xs">
                            {task.assignee}
                          </Badge>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                {tasks.filter((task) => task.status === column.id).length === 0 && (
                  <p className="text-xs text-muted-foreground text-center py-4">No tasks in this column.</p>
                )}
              </CardContent>
            </ScrollArea>
          </Card>
        ))}
      </div>

      <Dialog open={isTaskDialogOpen} onOpenChange={setIsTaskDialogOpen}>
        <DialogContent className="sm:max-w-[500px] bg-[hsl(var(--workspace-panel-background))] border-[hsl(var(--workspace-border))]">
          <DialogHeader>
            <DialogTitle>{editingTask ? "Edit Task" : "Add New Task"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-1">
              <Label htmlFor="title">Task Title</Label>
              <Input
                id="title"
                value={currentTaskForm.title}
                onChange={(e) => setCurrentTaskForm({ ...currentTaskForm, title: e.target.value })}
                placeholder="Enter task title"
                className="bg-background"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                value={currentTaskForm.description || ""}
                onChange={(e) => setCurrentTaskForm({ ...currentTaskForm, description: e.target.value })}
                placeholder="Enter task description"
                className="bg-background"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={currentTaskForm.status}
                  onValueChange={(value) => setCurrentTaskForm({ ...currentTaskForm, status: value as Task["status"] })}
                >
                  <SelectTrigger id="status" className="bg-background">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todo">To Do</SelectItem>
                    <SelectItem value="inprogress">In Progress</SelectItem>
                    <SelectItem value="done">Done</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label htmlFor="priority">Priority</Label>
                <Select
                  value={currentTaskForm.priority}
                  onValueChange={(value) =>
                    setCurrentTaskForm({ ...currentTaskForm, priority: value as Task["priority"] })
                  }
                >
                  <SelectTrigger id="priority" className="bg-background">
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label htmlFor="category">Category (Optional)</Label>
                <Input
                  id="category"
                  value={currentTaskForm.category || ""}
                  onChange={(e) => setCurrentTaskForm({ ...currentTaskForm, category: e.target.value })}
                  placeholder="e.g., Marketing"
                  className="bg-background"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="due-date">Due Date (Optional)</Label>
                <Input
                  id="due-date"
                  type="date"
                  value={currentTaskForm.dueDate || ""}
                  onChange={(e) => setCurrentTaskForm({ ...currentTaskForm, dueDate: e.target.value })}
                  className="bg-background"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="assignee">Assignee (Optional)</Label>
                <Input
                  id="assignee"
                  value={currentTaskForm.assignee || ""}
                  onChange={(e) => setCurrentTaskForm({ ...currentTaskForm, assignee: e.target.value })}
                  placeholder="e.g., John D."
                  className="bg-background"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsTaskDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveTask} disabled={!currentTaskForm.title}>
              Save Task
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

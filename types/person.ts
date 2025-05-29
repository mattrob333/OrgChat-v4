export interface Person {
  id: string
  name: string
  role: string
  department: string
  email: string
  image?: string
  responsibilities?: string[]
  bio?: string
  children?: Person[]
}

export interface Message {
  id: string
  content: string
  sender: "user" | "ai"
  timestamp: Date
}

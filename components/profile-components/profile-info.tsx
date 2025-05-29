"use client"

import type React from "react"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Camera, Pencil } from "lucide-react"

interface ProfileInfoProps {
  userData: {
    id: string
    name: string
    role: string
    department: string
    email: string
    phone: string
    location: string
    timezone: string
    bio: string
    image: string
  }
}

export default function ProfileInfo({ userData }: ProfileInfoProps) {
  const [formData, setFormData] = useState(userData)
  const [isEditing, setIsEditing] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const timezones = [
    "America/New_York",
    "America/Chicago",
    "America/Denver",
    "America/Los_Angeles",
    "Europe/London",
    "Europe/Paris",
    "Asia/Tokyo",
    "Australia/Sydney",
  ]

  const departments = [
    "Executive",
    "Engineering",
    "Marketing",
    "Sales",
    "Finance",
    "Human Resources",
    "Product",
    "Design",
    "Customer Support",
  ]

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Personal Information</h2>
        <Button variant="outline" size="sm" onClick={() => setIsEditing(!isEditing)} className="gap-2">
          <Pencil className="h-4 w-4" />
          {isEditing ? "Cancel" : "Edit"}
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        <div className="flex flex-col items-center space-y-4">
          <Avatar className="h-40 w-40 border-2 border-border">
            <AvatarImage src={formData.image || "/placeholder.svg"} alt={formData.name} />
            <AvatarFallback className="text-4xl bg-primary/10 text-primary">
              {formData.name
                .split(" ")
                .map((part) => part[0])
                .join("")}
            </AvatarFallback>
          </Avatar>

          <Button variant="outline" size="sm" className="gap-2">
            <Camera className="h-4 w-4" />
            Change Photo
          </Button>
        </div>

        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input id="name" name="name" value={formData.name} onChange={handleChange} disabled={!isEditing} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              disabled={!isEditing}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Job Title</Label>
            <Input id="role" name="role" value={formData.role} onChange={handleChange} disabled={!isEditing} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="department">Department</Label>
            <Select
              disabled={!isEditing}
              value={formData.department}
              onValueChange={(value) => handleSelectChange("department", value)}
            >
              <SelectTrigger id="department">
                <SelectValue placeholder="Select department" />
              </SelectTrigger>
              <SelectContent>
                {departments.map((dept) => (
                  <SelectItem key={dept} value={dept}>
                    {dept}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input id="phone" name="phone" value={formData.phone} onChange={handleChange} disabled={!isEditing} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              disabled={!isEditing}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="timezone">Timezone</Label>
            <Select
              disabled={!isEditing}
              value={formData.timezone}
              onValueChange={(value) => handleSelectChange("timezone", value)}
            >
              <SelectTrigger id="timezone">
                <SelectValue placeholder="Select timezone" />
              </SelectTrigger>
              <SelectContent>
                {timezones.map((tz) => (
                  <SelectItem key={tz} value={tz}>
                    {tz}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              disabled={!isEditing}
              className="min-h-[120px]"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

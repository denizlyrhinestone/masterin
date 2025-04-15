"use client"

import type React from "react"

import { useState } from "react"
import { ProfilePictureUpload } from "@/components/profile-picture-upload"

interface ProfileFormProps {
  userId: string
}

export function ProfileForm({ userId }: ProfileFormProps) {
  const [name, setName] = useState("Demo User")
  const [email, setEmail] = useState("demo@example.com")
  const [bio, setBio] = useState("I'm a student interested in web development and design.")

  const handleProfilePictureUpdate = (url: string) => {
    console.log("Profile picture updated:", url)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Saving profile changes:", { name, email, bio })
    // In a real app, this would save the changes to the database
  }

  return (
    <div className="bg-white rounded-lg border shadow-sm p-6 mb-8">
      <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
        <div className="w-full md:w-1/3 flex justify-center">
          <ProfilePictureUpload userId={userId} onUpdate={handleProfilePictureUpdate} />
        </div>

        <div className="w-full md:w-2/3">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                className="w-full p-2 border rounded-md"
                placeholder="Your Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                className="w-full p-2 border rounded-md"
                placeholder="your.email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
              <textarea
                className="w-full p-2 border rounded-md"
                rows={4}
                placeholder="Tell us about yourself"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
              />
            </div>

            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Save Changes
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

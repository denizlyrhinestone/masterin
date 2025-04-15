import { executeQuery, toCamelCase } from "@/lib/db"

export interface User {
  id: string
  name: string
  email: string
  bio?: string
  profilePictureUrl?: string
  role: "student" | "instructor" | "admin"
  createdAt: Date
  updatedAt: Date
}

export async function getUserById(id: string): Promise<User | null> {
  try {
    const users = await executeQuery<User>("SELECT * FROM users WHERE id = $1", [id])

    if (users.length === 0) {
      return null
    }

    return toCamelCase<User>(users[0])
  } catch (error) {
    console.error("Error getting user by ID:", error)
    return null
  }
}

export async function updateUserProfilePicture(userId: string, imageUrl: string): Promise<boolean> {
  try {
    await executeQuery("UPDATE users SET profile_picture_url = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2", [
      imageUrl,
      userId,
    ])

    return true
  } catch (error) {
    console.error("Error updating user profile picture:", error)
    return false
  }
}

export async function createUser(user: Omit<User, "id" | "createdAt" | "updatedAt">): Promise<User | null> {
  try {
    const result = await executeQuery<User>(
      `INSERT INTO users (name, email, bio, profile_picture_url, role) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING *`,
      [user.name, user.email, user.bio || null, user.profilePictureUrl || null, user.role],
    )

    if (result.length === 0) {
      return null
    }

    return toCamelCase<User>(result[0])
  } catch (error) {
    console.error("Error creating user:", error)
    return null
  }
}

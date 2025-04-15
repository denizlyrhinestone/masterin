import { ProfileForm } from "@/components/profile-form"

export default function ProfilePage() {
  // For demo purposes, we'll use a fixed user ID
  // In a real app, this would come from authentication
  const userId = "demo-user-123"

  return (
    <main className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Your Profile</h1>
        <ProfileForm userId={userId} />
      </div>
    </main>
  )
}

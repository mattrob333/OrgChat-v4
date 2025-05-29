import { Toaster } from "@/components/ui/toaster"
import ProfilePage from "@/components/profile-page"

export default function Page() {
  return (
    <main className="p-4 bg-background flex justify-center">
      <div className="w-[90%] max-w-[1600px]">
        <h1 className="text-3xl font-bold mb-6 text-foreground">
          <span className="text-primary">My</span> Profile
        </h1>
        <ProfilePage />
      </div>
      <Toaster />
    </main>
  )
}

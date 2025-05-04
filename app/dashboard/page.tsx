import { currentUser } from "@clerk/nextjs/server";
import { clerkClient } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { EmotionDashboard } from "@/app/components/emotion-dashboard";
import { AdminDashboard } from "@/app/components/admin-dashboard";
import { isAdmin } from "@/utils/roles";
import { getAnalyses, getEmotionDistribution, getDailyUserStats } from "@/app/server_actions";
import { User } from "@/types";

export default async function DashboardPage() {
  const user = await currentUser();
  if (!user) {
    redirect("/sign-in");
  }

  const isUserAdmin = await isAdmin();
  
  if (isUserAdmin) {
    const clerkUsers = await (await clerkClient()).users.getUserList();
    const users: User[] = clerkUsers.data.map(clerkUser => ({
      id: clerkUser.id,
      firstName: clerkUser.firstName || '',
      lastName: clerkUser.lastName || '',
      email: clerkUser.emailAddresses[0]?.emailAddress || '',
      imageUrl: clerkUser.imageUrl || '',
      role: clerkUser.publicMetadata.role as string || 'user',
      lastActive: clerkUser.lastSignInAt ? new Date(clerkUser.lastSignInAt).toISOString() : new Date().toISOString()
    }));
    
    const emotionDistribution = await getEmotionDistribution();
    const dailyUserStats = await getDailyUserStats();
    
    return (
      <div className="container mx-auto py-6">
        <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
        <AdminDashboard 
          users={users} 
          emotionDistribution={emotionDistribution}
          dailyUserStats={dailyUserStats}
        />
      </div>
    );
  }

  const analyses = await getAnalyses(user.id);
  return <EmotionDashboard initialData={analyses} />;
}


import { currentUser, clerkClient } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { EmotionDashboard } from "@/app/components/emotion-dashboard";
import { isAdmin } from "@/utils/roles";

async function getAnalyses(userId: string) {
  const analyses = await db.collection("analyses")
    .find({ userId })
    .sort({ timestamp: -1 })
    .toArray();

  return analyses.map(analysis => ({
    id: analysis._id.toString(),
    emotion: analysis.emotion,
    confidence: analysis.confidence,
    timestamp: analysis.timestamp.toISOString(),
    audioData: analysis.audioData ? Buffer.from(analysis.audioData).toString('base64') : null,
  }));
}

export default async function UserDashboardPage({ params }: { params: { userId: string } }) {
  const currentUserData = await currentUser();
  
  if (!currentUserData) {
    redirect("/sign-in");
  }

  const admin = await isAdmin();

  if (!admin && currentUserData.id !== params.userId) {
    redirect("/dashboard");
  }

  const targetUser = await (await clerkClient()).users.getUser(params.userId);
  const analyses = await getAnalyses(params.userId);

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center gap-4 mb-6">
        <h1 className="text-3xl font-bold">
          {targetUser.firstName} {targetUser.lastName}'s Emotion Logs
        </h1>
      </div>
      <EmotionDashboard initialData={analyses} userId={params.userId} />
    </div>
  );
} 
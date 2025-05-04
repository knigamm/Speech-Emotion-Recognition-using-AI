'use server'

import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

export async function analyzeAudio(file: File) {
  const formData = new FormData();
  formData.append("file", file);

  try {
    console.log("Sending request to backend...");
    const response = await fetch("http://127.0.0.1:8000/predict/", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Backend error response:", errorText);
      throw new Error(`Failed to analyze audio: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log("Backend response:", data);
    return {
      emotion: data.emotion,
      confidence: data.confidence,
    };
  } catch (error) {
    console.error("Error analyzing audio:", error);
    throw error;
  }
}

export async function saveAnalysis(emotion: string, confidence: number) {
  const user = await currentUser();
  if (!user) {
    throw new Error("User not authenticated");
  }

  try {
    const result = await db.collection("analyses").insertOne({
      userId: user.id,
      emotion,
      confidence,
      timestamp: new Date(),
    });

    return {
      success: true,
      id: result.insertedId.toString()
    };
  } catch (error) {
    console.error("Error saving analysis:", error);
    throw error;
  }
}

export async function getAnalyses(userId?: string) {
  const user = await currentUser();
  if (!user) {
    throw new Error("User not authenticated");
  }

  try {
    const targetUserId = userId || user.id;
    const analyses = await db.collection("analyses")
      .find({ userId: targetUserId })
      .sort({ timestamp: -1 })
      .toArray();

    return analyses.map(analysis => ({
      id: analysis._id.toString(),
      emotion: analysis.emotion,
      confidence: analysis.confidence,
      timestamp: analysis.timestamp.toISOString(),
    }));
  } catch (error) {
    console.error("Error fetching analyses:", error);
    throw error;
  }
}

export async function getEmotionDistribution() {
  try {
    const analyses = await db.collection("analyses")
      .find({})
      .toArray();

    const emotionCounts: { [key: string]: number } = {};

    analyses.forEach(analysis => {
      const emotion = analysis.emotion;
      emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1;
    });

    return Object.entries(emotionCounts)
      .map(([emotion, count]) => ({
        emotion,
        count,
      }))
      .sort((a, b) => b.count - a.count); // Sort by count in descending order
  } catch (error) {
    console.error("Error fetching emotion distribution:", error);
    return [];
  }
}

export async function getDailyUserStats() {
  try {
    const today = new Date();
    const dailyData: { [key: string]: Set<string> } = {};

    // Initialize last 7 days with empty sets
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toLocaleDateString('en-US', { weekday: 'short' });
      dailyData[dateStr] = new Set();
    }

    // Get all analyses from the database
    const analyses = await db.collection("analyses")
      .find({})
      .toArray();

    // Count unique users per day
    analyses.forEach(analysis => {
      const analysisDate = new Date(analysis.timestamp);
      const dateStr = analysisDate.toLocaleDateString('en-US', { weekday: 'short' });
      if (dailyData[dateStr]) {
        dailyData[dateStr].add(analysis.userId);
      }
    });

    return Object.entries(dailyData).map(([date, userSet]) => ({
      date,
      users: userSet.size,
    }));
  } catch (error) {
    console.error("Error fetching daily user stats:", error);
    return [];
  }
}
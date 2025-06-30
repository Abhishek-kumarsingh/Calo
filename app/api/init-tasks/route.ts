import { NextRequest, NextResponse } from "next/server";
import { ScheduledTasks } from "@/lib/tasks/scheduledTasks";

// Flag to track if tasks have been initialized
let tasksInitialized = false;

export async function GET(req: NextRequest) {
  try {
    // Only initialize tasks once
    if (!tasksInitialized) {
      console.log("Initializing scheduled tasks");
      ScheduledTasks.start();
      tasksInitialized = true;
    }

    return NextResponse.json({
      message: "Scheduled tasks initialized",
      status: tasksInitialized ? "running" : "not running"
    });
  } catch (error: any) {
    console.error("Error initializing scheduled tasks:", error);
    return NextResponse.json(
      { error: error.message || "Failed to initialize scheduled tasks" },
      { status: 500 }
    );
  }
}

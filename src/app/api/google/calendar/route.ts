import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { listCalendarEvents } from "@/lib/google/calendar";

export async function GET() {
  const supabase = await createServerSupabaseClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session?.provider_token) {
    return NextResponse.json({ error: "인증 필요" }, { status: 401 });
  }

  try {
    const events = await listCalendarEvents(session.provider_token);
    return NextResponse.json({ events });
  } catch (error) {
    console.error("캘린더 API 에러:", error);
    return NextResponse.json({ error: "캘린더 조회 실패" }, { status: 500 });
  }
}

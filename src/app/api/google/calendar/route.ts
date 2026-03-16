import { NextResponse } from "next/server";
import { getGoogleAccessToken } from "@/lib/google/token";
import { listCalendarEvents } from "@/lib/google/calendar";

export async function GET() {
  const accessToken = await getGoogleAccessToken();
  if (!accessToken) {
    return NextResponse.json({ error: "인증 필요" }, { status: 401 });
  }

  try {
    const events = await listCalendarEvents(accessToken);
    return NextResponse.json({ events });
  } catch (error) {
    console.error("캘린더 API 에러:", error);
    return NextResponse.json({ error: "캘린더 조회 실패" }, { status: 500 });
  }
}

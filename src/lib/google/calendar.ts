import type { CalendarEvent } from "@/types";

const CALENDAR_API = "https://www.googleapis.com/calendar/v3";

// 이벤트 목록 조회
export async function listCalendarEvents(
  accessToken: string,
  timeMin?: string,
  timeMax?: string,
  maxResults: number = 10
): Promise<CalendarEvent[]> {
  const params = new URLSearchParams({
    maxResults: String(maxResults),
    singleEvents: "true",
    orderBy: "startTime",
    timeMin: timeMin || new Date().toISOString(),
    timeMax: timeMax || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  });

  const res = await fetch(`${CALENDAR_API}/calendars/primary/events?${params}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) throw new Error(`Calendar API 에러: ${res.status}`);
  const data = await res.json();
  return data.items || [];
}

// 이벤트 생성
export async function createCalendarEvent(
  accessToken: string,
  event: {
    summary: string;
    description?: string;
    start: { dateTime: string; timeZone?: string };
    end: { dateTime: string; timeZone?: string };
  }
): Promise<CalendarEvent> {
  const res = await fetch(`${CALENDAR_API}/calendars/primary/events`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      ...event,
      start: { ...event.start, timeZone: event.start.timeZone || "Asia/Seoul" },
      end: { ...event.end, timeZone: event.end.timeZone || "Asia/Seoul" },
    }),
  });

  if (!res.ok) throw new Error(`Calendar 이벤트 생성 실패: ${res.status}`);
  return res.json();
}

// 이벤트 삭제
export async function deleteCalendarEvent(
  accessToken: string,
  eventId: string
): Promise<void> {
  const res = await fetch(
    `${CALENDAR_API}/calendars/primary/events/${eventId}`,
    {
      method: "DELETE",
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );
  if (!res.ok) throw new Error(`Calendar 이벤트 삭제 실패: ${res.status}`);
}

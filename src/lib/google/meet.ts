// Meet 링크가 포함된 캘린더 이벤트 생성
export async function createMeetEvent(
  accessToken: string,
  summary: string,
  startTime: string,
  durationMinutes: number = 30
): Promise<{ eventId: string; meetLink: string }> {
  const start = new Date(startTime);
  const end = new Date(start.getTime() + durationMinutes * 60 * 1000);

  const res = await fetch(
    "https://www.googleapis.com/calendar/v3/calendars/primary/events?conferenceDataVersion=1",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        summary,
        start: { dateTime: start.toISOString(), timeZone: "Asia/Seoul" },
        end: { dateTime: end.toISOString(), timeZone: "Asia/Seoul" },
        conferenceData: {
          createRequest: {
            requestId: `workhub-${Date.now()}`,
            conferenceSolutionKey: { type: "hangoutsMeet" },
          },
        },
      }),
    }
  );

  if (!res.ok) throw new Error(`Meet 이벤트 생성 실패: ${res.status}`);
  const data = await res.json();

  return {
    eventId: data.id,
    meetLink: data.hangoutLink || "",
  };
}

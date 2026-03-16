import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { listDriveFiles } from "@/lib/google/drive";

export async function GET(request: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session?.provider_token) {
    return NextResponse.json({ error: "인증 필요" }, { status: 401 });
  }

  const folderId = request.nextUrl.searchParams.get("folderId") || undefined;

  try {
    const files = await listDriveFiles(session.provider_token, folderId);
    return NextResponse.json({ files });
  } catch (error) {
    console.error("Drive API 에러:", error);
    return NextResponse.json({ error: "Drive 조회 실패" }, { status: 500 });
  }
}

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// 현재 세션의 Google access token 가져오기
export async function getGoogleAccessToken(): Promise<string | null> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.accessToken) return null;
  return session.user.accessToken;
}

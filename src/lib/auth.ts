import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { createServerSupabase } from "./supabase";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: "openid email profile https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/drive.file",
          access_type: "offline",
          prompt: "consent",
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      // 최초 로그인 시 토큰 저장
      if (account) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.accessTokenExpires = account.expires_at
          ? account.expires_at * 1000
          : 0;
        token.email = profile?.email;
        token.name = profile?.name;
        token.picture = (profile as { picture?: string })?.picture;
      }

      // 토큰 만료 확인 및 갱신
      if (
        token.accessTokenExpires &&
        Date.now() < (token.accessTokenExpires as number)
      ) {
        return token;
      }

      return await refreshAccessToken(token);
    },
    async session({ session, token }) {
      session.user = {
        ...session.user,
        id: token.sub!,
        accessToken: token.accessToken as string,
      };
      return session;
    },
    async signIn({ user, account, profile }) {
      if (!account || !profile) return false;

      try {
        const supabase = createServerSupabase();
        const { error } = await supabase.from("profiles").upsert({
          id: user.id,
          display_name: profile.name || "",
          email: profile.email || "",
          avatar_url: (profile as { picture?: string }).picture || null,
          google_tokens: {
            access_token: account.access_token,
            refresh_token: account.refresh_token,
            expiry: account.expires_at
              ? new Date(account.expires_at * 1000).toISOString()
              : null,
          },
        });
        if (error) console.error("프로필 저장 실패:", error);
      } catch (err) {
        console.error("signIn callback 에러:", err);
      }

      return true;
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
  session: {
    strategy: "jwt",
  },
};

// Google OAuth 토큰 갱신
async function refreshAccessToken(token: Record<string, unknown>) {
  try {
    const response = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        grant_type: "refresh_token",
        refresh_token: token.refreshToken as string,
      }),
    });

    const refreshed = await response.json();

    if (!response.ok) throw refreshed;

    // Supabase에 갱신된 토큰 저장
    const supabase = createServerSupabase();
    await supabase
      .from("profiles")
      .update({
        google_tokens: {
          access_token: refreshed.access_token,
          refresh_token: token.refreshToken,
          expiry: new Date(
            Date.now() + refreshed.expires_in * 1000
          ).toISOString(),
        },
      })
      .eq("id", token.sub);

    return {
      ...token,
      accessToken: refreshed.access_token,
      accessTokenExpires: Date.now() + refreshed.expires_in * 1000,
      refreshToken: refreshed.refresh_token ?? token.refreshToken,
    };
  } catch (error) {
    console.error("토큰 갱신 실패:", error);
    return { ...token, error: "RefreshAccessTokenError" };
  }
}

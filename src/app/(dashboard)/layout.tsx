"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import ActivityBar from "@/components/layout/ActivityBar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [activeView, setActiveView] = useState("todo");
  const [authChecked, setAuthChecked] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  // 세션 체크: user가 없으면 로그인 페이지로 리다이렉트
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        router.replace("/auth/signin");
      } else {
        setAuthChecked(true);
      }
    });
  }, []);

  if (!authChecked) {
    return (
      <div className="h-screen flex items-center justify-center bg-bg">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-[60px_1fr] h-screen overflow-hidden">
      <ActivityBar activeView={activeView} onViewChange={setActiveView} />
      <main className="overflow-hidden">
        {children}
      </main>
    </div>
  );
}

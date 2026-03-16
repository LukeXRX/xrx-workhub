"use client";

import { useState } from "react";
import ActivityBar from "@/components/layout/ActivityBar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [activeView, setActiveView] = useState("todo");

  return (
    <div className="grid grid-cols-[60px_1fr] h-screen overflow-hidden">
      <ActivityBar activeView={activeView} onViewChange={setActiveView} />
      <main className="overflow-hidden">
        {children}
      </main>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";

interface NavItem {
  id: string;
  icon: string;
  label: string;
  badge?: number;
}

const navItems: NavItem[] = [
  { id: "todo", icon: "✓", label: "TODO" },
  { id: "calendar", icon: "📅", label: "Calendar" },
  { id: "drive", icon: "📁", label: "Drive" },
  { id: "chat", icon: "💬", label: "Chat", badge: 3 },
];

interface ActivityBarProps {
  activeView: string;
  onViewChange: (view: string) => void;
}

export default function ActivityBar({ activeView, onViewChange }: ActivityBarProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // next-themes hydration 대응
  useEffect(() => { setMounted(true); }, []);

  return (
    <div className="flex flex-col items-center py-2.5 gap-1 border-r border-bd bg-actbar w-[60px] min-h-screen z-10">
      {/* 로고 */}
      <div className="text-lg font-bold text-accent mb-3.5 py-2.5 cursor-default">W</div>

      {/* 네비게이션 */}
      {navItems.map((item) => (
        <button
          key={item.id}
          onClick={() => onViewChange(item.id)}
          className={`
            w-[46px] h-[46px] flex items-center justify-center text-[22px] cursor-pointer
            transition-all duration-300 border-l-[3px] relative
            ${activeView === item.id
              ? "text-actbar-active border-l-actbar-active"
              : "text-actbar-tx border-l-transparent hover:text-white/85"
            }
          `}
          title={item.label}
        >
          {item.icon}
          {item.badge && (
            <span className="absolute top-1.5 right-1.5 min-w-4 h-4 bg-accent text-black text-[9px] font-bold rounded-full flex items-center justify-center px-0.5">
              {item.badge}
            </span>
          )}
        </button>
      ))}

      {/* 스페이서 */}
      <div className="flex-1" />

      {/* 테마 토글 */}
      {mounted && (
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="w-[38px] h-[38px] rounded-full flex items-center justify-center text-[17px] text-actbar-tx border border-white/12 bg-transparent hover:text-accent hover:border-accent transition-all duration-300"
        >
          {theme === "dark" ? "☀️" : "🌙"}
        </button>
      )}

      {/* 아바타 */}
      <div className="w-[34px] h-[34px] rounded-full bg-accent text-black text-[13px] font-bold flex items-center justify-center mt-1.5">
        L
      </div>
    </div>
  );
}

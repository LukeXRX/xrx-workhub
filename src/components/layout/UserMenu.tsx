"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

export default function UserMenu() {
  const [user, setUser] = useState<User | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user: u } }) => {
      setUser(u);
    });
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/auth/signin";
  };

  const avatarUrl = user?.user_metadata?.avatar_url;
  const displayName =
    user?.user_metadata?.full_name || user?.email || "User";
  const initials = displayName.charAt(0).toUpperCase();

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="w-[34px] h-[34px] rounded-full overflow-hidden flex items-center justify-center mt-1.5 hover:ring-2 hover:ring-accent transition-all"
      >
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={displayName}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-accent text-black text-[13px] font-bold flex items-center justify-center">
            {initials}
          </div>
        )}
      </button>

      {showMenu && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowMenu(false)}
          />
          <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-50 w-48 bg-card border border-bd rounded-lg shadow-xl py-1">
            <div className="px-3 py-2 border-b border-bd">
              <p className="text-[13px] font-medium text-tx truncate">
                {displayName}
              </p>
              <p className="text-[11px] text-tx-3 truncate">{user?.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="w-full text-left px-3 py-2 text-[13px] text-tx-2 hover:bg-bg-2 hover:text-red-400 transition-colors"
            >
              로그아웃
            </button>
          </div>
        </>
      )}
    </div>
  );
}

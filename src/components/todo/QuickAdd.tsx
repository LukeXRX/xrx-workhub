"use client";

import { useState, useRef, KeyboardEvent } from "react";

interface QuickAddProps {
  onAdd: (title: string, priority: "high" | "medium" | "low", dueDate: string | null) => void;
}

export default function QuickAdd({ onAdd }: QuickAddProps) {
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const parseAndAdd = (text: string) => {
    let priority: "high" | "medium" | "low" = "medium";
    let title = text.trim();

    if (title.includes("!!")) {
      priority = "high";
      title = title.replace("!!", "").trim();
    } else if (title.includes("!")) {
      priority = "medium";
      title = title.replace("!", "").trim();
    }

    let dueDate: string | null = null;
    const dateMatch = title.match(/#(\d{1,2})\/(\d{1,2})/);
    if (dateMatch) {
      const month = parseInt(dateMatch[1]);
      const day = parseInt(dateMatch[2]);
      const year = new Date().getFullYear();
      dueDate = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      title = title.replace(/#\d{1,2}\/\d{1,2}/, "").trim();
    }

    if (title) {
      onAdd(title, priority, dueDate);
      setValue("");
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.nativeEvent.isComposing || e.keyCode === 229) return;
    if (e.key === "Enter" && value.trim()) {
      e.preventDefault();
      parseAndAdd(value);
    }
  };

  return (
    <div className="flex items-center gap-3 px-5 py-4 border-b-2 border-accent bg-accent-soft mb-6 rounded">
      <span className="text-accent text-2xl font-light">+</span>
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="할 일 추가... (!! 높음, #3/20 마감일)"
        className="flex-1 bg-transparent outline-none text-[16px] text-tx placeholder:text-tx-3"
      />
      <kbd className="text-[12px] text-tx-3 border border-bd px-2.5 py-1 font-mono rounded">
        ⌘K
      </kbd>
    </div>
  );
}

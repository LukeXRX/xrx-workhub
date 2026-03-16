"use client";

import { useState, useEffect, useRef, KeyboardEvent } from "react";

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (title: string, priority: "high" | "medium" | "low", dueDate: string | null) => void;
}

export default function CommandPalette({ isOpen, onClose, onAdd }: CommandPaletteProps) {
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setValue("");
    }
  }, [isOpen]);

  // 전역 키보드 단축키
  useEffect(() => {
    const handler = (e: globalThis.KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (isOpen) {
          onClose();
        }
      }
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

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
    // 한글 IME 조합 중이면 무시
    if (e.nativeEvent.isComposing || e.keyCode === 229) return;
    if (e.key === "Enter" && value.trim()) {
      e.preventDefault();
      parseAndAdd(value);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh]">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-[560px] mx-4 bg-card border border-bd rounded-lg shadow-2xl overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-4 border-b border-bd">
          <span className="text-accent text-xl font-bold">⚡</span>
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="할 일을 입력하세요... (!! 높음, #3/20 마감일)"
            className="flex-1 bg-transparent outline-none text-lg text-tx placeholder:text-tx-3"
          />
        </div>
        <div className="px-5 py-3 flex items-center gap-4 text-[12px] text-tx-3">
          <span><kbd className="font-mono bg-bg-3 px-1.5 py-0.5 rounded text-[11px]">Enter</kbd> 추가</span>
          <span><kbd className="font-mono bg-bg-3 px-1.5 py-0.5 rounded text-[11px]">!!</kbd> 높은 우선순위</span>
          <span><kbd className="font-mono bg-bg-3 px-1.5 py-0.5 rounded text-[11px]">#3/20</kbd> 마감일</span>
          <span className="ml-auto"><kbd className="font-mono bg-bg-3 px-1.5 py-0.5 rounded text-[11px]">Esc</kbd> 닫기</span>
        </div>
      </div>
    </div>
  );
}

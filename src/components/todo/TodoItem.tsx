"use client";

import type { Todo } from "@/types";

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: string, status: string) => void;
  onDelete: (id: string) => void;
  onEdit: (todo: Todo) => void;
}

const priorityStyles = {
  high: "border-l-red-500 bg-red-500/5",
  medium: "border-l-accent bg-accent-soft",
  low: "border-l-blue-400 bg-blue-400/5",
};

const priorityLabels = {
  high: "HIGH",
  medium: "MED",
  low: "LOW",
};

const priorityColors = {
  high: "bg-red-500/15 text-red-400 border-red-500/30",
  medium: "bg-accent/15 text-accent border-accent/30",
  low: "bg-blue-400/15 text-blue-400 border-blue-400/30",
};

export default function TodoItem({ todo, onToggle, onDelete, onEdit }: TodoItemProps) {
  const isDone = todo.status === "done";

  return (
    <div
      className={`
        flex items-start gap-4 px-5 py-4 border-l-[3px] transition-all group cursor-pointer rounded-r
        ${priorityStyles[todo.priority]}
        ${isDone ? "opacity-45" : ""}
        hover:bg-accent-soft/50
      `}
    >
      {/* 체크박스 */}
      <button
        onClick={(e) => { e.stopPropagation(); onToggle(todo.id, todo.status); }}
        className={`
          mt-1 w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0
          transition-all duration-200
          ${isDone
            ? "bg-accent border-accent text-black"
            : "border-tx-3 hover:border-accent"
          }
        `}
      >
        {isDone && <span className="text-xs font-bold">✓</span>}
      </button>

      {/* 내용 */}
      <div className="flex-1 min-w-0" onClick={() => onEdit(todo)}>
        <p className={`text-[17px] font-medium leading-snug ${isDone ? "line-through text-tx-3" : "text-tx"}`}>
          {todo.title}
        </p>
        {todo.description && (
          <p className="text-[14px] text-tx-3 mt-1 truncate">{todo.description}</p>
        )}
        <div className="flex items-center gap-3 mt-2">
          <span className={`text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${priorityColors[todo.priority]}`}>
            {priorityLabels[todo.priority]}
          </span>
          {todo.due_date && (
            <span className="text-[13px] text-tx-3 flex items-center gap-1">
              📅 {new Date(todo.due_date).toLocaleDateString("ko-KR", { month: "long", day: "numeric" })}
            </span>
          )}
          {todo.category && (
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-bg-3 text-tx-2 border border-bd">
              {todo.category}
            </span>
          )}
          {todo.gcal_event_id && (
            <span className="text-[13px] text-accent font-semibold">📆 Calendar</span>
          )}
        </div>
      </div>

      {/* 삭제 버튼 */}
      <button
        onClick={(e) => { e.stopPropagation(); onDelete(todo.id); }}
        className="opacity-0 group-hover:opacity-100 text-tx-3 hover:text-red-500 transition-all text-base mt-1"
      >
        ✕
      </button>
    </div>
  );
}

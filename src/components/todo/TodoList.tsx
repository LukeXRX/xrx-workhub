"use client";

import type { Todo } from "@/types";
import TodoItem from "./TodoItem";

interface TodoListProps {
  todos: Todo[];
  onToggle: (id: string, status: string) => void;
  onDelete: (id: string) => void;
  onEdit: (todo: Todo) => void;
}

export default function TodoList({ todos, onToggle, onDelete, onEdit }: TodoListProps) {
  const pending = todos.filter((t) => t.status === "pending");
  const done = todos.filter((t) => t.status === "done");

  return (
    <div>
      {/* Pending */}
      {pending.length > 0 && (
        <>
          <div className="text-[12px] font-bold uppercase tracking-[2px] text-tx-3 my-5 flex items-center gap-3">
            Pending
            <span className="text-accent font-bold">({pending.length})</span>
            <span className="flex-1 h-px bg-bd" />
          </div>
          <div className="flex flex-col gap-1.5">
            {pending.map((todo) => (
              <TodoItem
                key={todo.id}
                todo={todo}
                onToggle={onToggle}
                onDelete={onDelete}
                onEdit={onEdit}
              />
            ))}
          </div>
        </>
      )}

      {/* Done */}
      {done.length > 0 && (
        <>
          <div className="text-[12px] font-bold uppercase tracking-[2px] text-tx-3 my-5 flex items-center gap-3">
            Completed
            <span className="text-accent font-bold">({done.length})</span>
            <span className="flex-1 h-px bg-bd" />
          </div>
          <div className="flex flex-col gap-1.5">
            {done.map((todo) => (
              <TodoItem
                key={todo.id}
                todo={todo}
                onToggle={onToggle}
                onDelete={onDelete}
                onEdit={onEdit}
              />
            ))}
          </div>
        </>
      )}

      {todos.length === 0 && (
        <div className="text-center py-24 text-tx-3">
          <p className="text-5xl mb-4">📝</p>
          <p className="text-xl font-medium text-tx">할 일이 없습니다</p>
          <p className="text-[15px] mt-2">Cmd+K로 빠르게 추가하세요</p>
        </div>
      )}
    </div>
  );
}

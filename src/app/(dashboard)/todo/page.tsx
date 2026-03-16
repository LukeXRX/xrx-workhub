"use client";

import { useState, useCallback, useEffect } from "react";
import Sidebar from "@/components/layout/Sidebar";
import type { ProjectItem } from "@/components/layout/Sidebar";
import QuickAdd from "@/components/todo/QuickAdd";
import TodoList from "@/components/todo/TodoList";
import CommandPalette from "@/components/todo/CommandPalette";
import TodoDetailModal from "@/components/todo/TodoDetailModal";
import type { Todo, TodoCategory } from "@/types";
import { TODO_CATEGORIES } from "@/types";

const initialProjects: ProjectItem[] = [
  { id: "p1", name: "ALIVE Engine", icon: "🤖", color: "#FF9800", count: 0 },
  { id: "p2", name: "OntologyHub", icon: "🧠", color: "#4CAF50", count: 0 },
  { id: "p3", name: "WorkHub", icon: "🏢", color: "#2196F3", count: 0 },
];

const initialTodos: Todo[] = [
  { id: "t1", project_id: "p3", created_by: "u1", assigned_to: "u1", title: "NextAuth 인증 플로우 구현", description: "Google OAuth 연동 및 토큰 갱신 로직 구현", status: "pending", priority: "high", due_date: "2026-03-18", gcal_event_id: null, drive_file_ids: null, completed_at: null, category: "개발", sort_order: 0, created_at: "2026-03-16" },
  { id: "t2", project_id: "p3", created_by: "u1", assigned_to: "u1", title: "Supabase RLS 정책 테스트", description: "프로젝트 멤버 접근 제어 검증", status: "pending", priority: "medium", due_date: "2026-03-19", gcal_event_id: null, drive_file_ids: null, completed_at: null, category: "검토", sort_order: 1, created_at: "2026-03-16" },
  { id: "t3", project_id: "p3", created_by: "u1", assigned_to: null, title: "다크모드 전환 테스트", description: "라이트/다크 테마 모두 확인", status: "pending", priority: "low", due_date: null, gcal_event_id: null, drive_file_ids: null, completed_at: null, category: "디자인", sort_order: 2, created_at: "2026-03-16" },
  { id: "t4", project_id: "p1", created_by: "u1", assigned_to: "u1", title: "ALIVE Engine API 문서 작성", description: null, status: "done", priority: "medium", due_date: "2026-03-15", gcal_event_id: null, drive_file_ids: null, completed_at: "2026-03-15", category: "문서 작성", sort_order: 3, created_at: "2026-03-14" },
  { id: "t5", project_id: "p2", created_by: "u1", assigned_to: "u1", title: "온톨로지 스키마 설계", description: "SKOS 기반 온톨로지 데이터 모델 정의", status: "pending", priority: "high", due_date: "2026-03-20", gcal_event_id: null, drive_file_ids: null, completed_at: null, category: "개발", sort_order: 4, created_at: "2026-03-16" },
];

export default function TodoPage() {
  const [activeProjectId, setActiveProjectId] = useState("all");
  const [activeCategory, setActiveCategory] = useState<TodoCategory | "all">("all");
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [localTodos, setLocalTodos] = useState<Todo[]>(initialTodos);
  const [localProjects, setLocalProjects] = useState<ProjectItem[]>(initialProjects);
  const [selectedTodo, setSelectedTodo] = useState<Todo | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const projectsWithCounts = localProjects.map((p) => ({
    ...p,
    count: localTodos.filter((t) => t.project_id === p.id && t.status === "pending").length,
  }));

  // 프로젝트 + 카테고리 필터
  let filteredTodos = activeProjectId === "all"
    ? localTodos
    : localTodos.filter((t) => t.project_id === activeProjectId);

  if (activeCategory !== "all") {
    filteredTodos = filteredTodos.filter((t) => t.category === activeCategory);
  }

  const activeProject = localProjects.find((p) => p.id === activeProjectId);
  const pendingCount = filteredTodos.filter((t) => t.status === "pending").length;

  const handleAdd = useCallback(
    (title: string, priority: "high" | "medium" | "low", dueDate: string | null) => {
      const targetProjectId = activeProjectId === "all" ? (localProjects[0]?.id || "p1") : activeProjectId;
      const newTodo: Todo = {
        id: `t${Date.now()}`,
        project_id: targetProjectId,
        created_by: "u1",
        assigned_to: "u1",
        title,
        description: null,
        status: "pending",
        priority,
        due_date: dueDate,
        gcal_event_id: null,
        drive_file_ids: null,
        completed_at: null,
        category: activeCategory !== "all" ? activeCategory : null,
        sort_order: localTodos.length,
        created_at: new Date().toISOString(),
      };
      setLocalTodos((prev) => [newTodo, ...prev]);
    },
    [activeProjectId, activeCategory, localProjects, localTodos.length]
  );

  const handleToggle = useCallback((id: string, status: string) => {
    setLocalTodos((prev) =>
      prev.map((t) =>
        t.id === id
          ? { ...t, status: (status === "pending" ? "done" : "pending") as "pending" | "done", completed_at: status === "pending" ? new Date().toISOString() : null }
          : t
      )
    );
  }, []);

  const handleDelete = useCallback((id: string) => {
    setLocalTodos((prev) => prev.filter((t) => t.id !== id));
    setDetailModalOpen(false);
    setSelectedTodo(null);
  }, []);

  const handleUpdate = useCallback((id: string, updates: Partial<Todo>) => {
    setLocalTodos((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates } : t)));
  }, []);

  const handleEdit = useCallback((todo: Todo) => {
    setSelectedTodo(todo);
    setDetailModalOpen(true);
  }, []);

  const handleAddProject = useCallback((name: string, icon: string, color: string) => {
    const newProject: ProjectItem = { id: `p${Date.now()}`, name, icon, color, count: 0 };
    setLocalProjects((prev) => [...prev, newProject]);
  }, []);

  return (
    <div className="grid grid-cols-[260px_1fr] h-full">
      <Sidebar
        projects={projectsWithCounts}
        activeProjectId={activeProjectId}
        onProjectSelect={setActiveProjectId}
        onAddProject={handleAddProject}
      />

      <div className="px-8 py-6 overflow-y-auto">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-[30px] font-medium text-tx">
              {activeProjectId === "all" ? "All Tasks" : activeProject?.name || "Tasks"}
            </h1>
            <p className="text-[14px] text-tx-3 mt-0.5">
              {pendingCount} task{pendingCount !== 1 ? "s" : ""} remaining
            </p>
          </div>
          <button
            onClick={() => setCommandPaletteOpen(true)}
            className="inline-flex items-center gap-2.5 pl-5 pr-3 h-10 bg-accent text-black text-[13px] font-semibold uppercase tracking-wider rounded-full hover:brightness-110 transition-all"
          >
            Add Task
            <span className="w-6 h-6 rounded-full bg-black text-accent flex items-center justify-center text-[13px]">→</span>
          </button>
        </div>

        {/* 카테고리 필터 */}
        <div className="flex gap-1.5 mb-5 overflow-x-auto pb-1">
          <button
            onClick={() => setActiveCategory("all")}
            className={`px-3 py-1.5 text-[13px] rounded-full border whitespace-nowrap transition-all ${
              activeCategory === "all"
                ? "bg-accent text-black border-accent font-bold"
                : "bg-bg-2 text-tx-2 border-bd hover:border-accent hover:text-accent"
            }`}
          >
            전체
          </button>
          {TODO_CATEGORIES.map((cat) => {
            const count = filteredTodos.filter((t) => t.category === cat.value && t.status === "pending").length;
            return (
              <button
                key={cat.value}
                onClick={() => setActiveCategory(activeCategory === cat.value ? "all" : cat.value)}
                className={`px-3 py-1.5 text-[13px] rounded-full border whitespace-nowrap transition-all flex items-center gap-1 ${
                  activeCategory === cat.value
                    ? "bg-accent text-black border-accent font-bold"
                    : "bg-bg-2 text-tx-2 border-bd hover:border-accent hover:text-accent"
                }`}
              >
                <span>{cat.icon}</span>
                {cat.label}
                {count > 0 && <span className="ml-0.5 text-[11px] opacity-70">({count})</span>}
              </button>
            );
          })}
        </div>

        <QuickAdd onAdd={handleAdd} />

        <TodoList
          todos={filteredTodos}
          onToggle={handleToggle}
          onDelete={handleDelete}
          onEdit={handleEdit}
        />
      </div>

      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        onAdd={handleAdd}
      />

      <TodoDetailModal
        todo={selectedTodo}
        isOpen={detailModalOpen}
        onClose={() => { setDetailModalOpen(false); setSelectedTodo(null); }}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
      />
    </div>
  );
}

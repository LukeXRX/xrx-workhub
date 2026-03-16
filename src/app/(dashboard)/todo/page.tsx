"use client";

import { useState, useCallback, useEffect } from "react";
import { createClient } from "@/lib/supabase";
import Sidebar from "@/components/layout/Sidebar";
import type { ProjectItem } from "@/components/layout/Sidebar";
import QuickAdd from "@/components/todo/QuickAdd";
import TodoList from "@/components/todo/TodoList";
import CommandPalette from "@/components/todo/CommandPalette";
import TodoDetailModal from "@/components/todo/TodoDetailModal";
import { TodoSkeleton, SidebarSkeleton } from "@/components/common/LoadingSkeleton";
import type { Todo, TodoCategory } from "@/types";
import { TODO_CATEGORIES } from "@/types";

export default function TodoPage() {
  const supabase = createClient();
  const [activeProjectId, setActiveProjectId] = useState("all");
  const [activeCategory, setActiveCategory] = useState<TodoCategory | "all">("all");
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  // DB에서 가져오기
  const [todos, setTodos] = useState<Todo[]>([]);
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [todosLoading, setTodosLoading] = useState(true);
  const [projectsLoading, setProjectsLoading] = useState(true);
  const [selectedTodo, setSelectedTodo] = useState<Todo | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  // 유저 정보
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setUserId(user.id);
    });
  }, []);

  // 프로젝트 조회
  const fetchProjects = useCallback(async () => {
    setProjectsLoading(true);
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("is_archived", false)
      .order("created_at", { ascending: true });

    if (!error && data) {
      setProjects(data.map((p: any) => ({
        id: p.id,
        name: p.name,
        icon: p.icon || "📁",
        color: p.color || "#FF9800",
        count: 0,
      })));
    }
    setProjectsLoading(false);
  }, []);

  // TODO 조회
  const fetchTodos = useCallback(async () => {
    setTodosLoading(true);
    let query = supabase
      .from("todos")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });

    if (activeProjectId !== "all") {
      query = query.eq("project_id", activeProjectId);
    }

    const { data, error } = await query;
    if (!error && data) {
      setTodos(data as Todo[]);
    }
    setTodosLoading(false);
  }, [activeProjectId]);

  useEffect(() => { fetchProjects(); }, [fetchProjects]);
  useEffect(() => { fetchTodos(); }, [fetchTodos]);

  // Realtime 구독
  useEffect(() => {
    const channel = supabase
      .channel("todos-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "todos" }, () => {
        fetchTodos();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [fetchTodos]);

  // 프로젝트별 카운트
  const projectsWithCounts = projects.map((p) => ({
    ...p,
    count: todos.filter((t) => t.project_id === p.id && t.status === "pending").length,
  }));

  // 필터링
  let filteredTodos = activeProjectId === "all" ? todos : todos.filter((t) => t.project_id === activeProjectId);
  if (activeCategory !== "all") {
    filteredTodos = filteredTodos.filter((t) => t.category === activeCategory);
  }

  const activeProject = projects.find((p) => p.id === activeProjectId);
  const pendingCount = filteredTodos.filter((t) => t.status === "pending").length;

  // TODO 추가
  const handleAdd = useCallback(async (title: string, priority: "high" | "medium" | "low", dueDate: string | null) => {
    if (!userId) return;
    const targetProjectId = activeProjectId === "all" ? (projects[0]?.id) : activeProjectId;
    if (!targetProjectId) return;

    const { error } = await supabase.from("todos").insert({
      project_id: targetProjectId,
      created_by: userId,
      assigned_to: userId,
      title,
      priority,
      due_date: dueDate,
      category: activeCategory !== "all" ? activeCategory : null,
      status: "pending",
      sort_order: todos.length,
    });

    if (!error) fetchTodos();
  }, [userId, activeProjectId, activeCategory, projects, todos.length, fetchTodos]);

  // TODO 토글
  const handleToggle = useCallback(async (id: string, status: string) => {
    const newStatus = status === "pending" ? "done" : "pending";
    await supabase.from("todos").update({
      status: newStatus,
      completed_at: newStatus === "done" ? new Date().toISOString() : null,
    }).eq("id", id);
    fetchTodos();
  }, [fetchTodos]);

  // TODO 삭제
  const handleDelete = useCallback(async (id: string) => {
    await supabase.from("todos").delete().eq("id", id);
    setDetailModalOpen(false);
    setSelectedTodo(null);
    fetchTodos();
  }, [fetchTodos]);

  // TODO 수정
  const handleUpdate = useCallback(async (id: string, updates: Partial<Todo>) => {
    await supabase.from("todos").update(updates).eq("id", id);
    fetchTodos();
  }, [fetchTodos]);

  // TODO 클릭 -> 상세 모달
  const handleEdit = useCallback((todo: Todo) => {
    setSelectedTodo(todo);
    setDetailModalOpen(true);
  }, []);

  // 프로젝트 추가
  const handleAddProject = useCallback(async (name: string, icon: string, color: string) => {
    if (!userId) return;
    const { data, error } = await supabase
      .from("projects")
      .insert({ name, icon, color, owner_id: userId })
      .select()
      .single();

    if (!error && data) {
      // 프로젝트 멤버에 자동 추가
      await supabase.from("project_members").insert({
        project_id: data.id,
        user_id: userId,
        role: "owner",
      });
      fetchProjects();
    }
  }, [userId, fetchProjects]);

  // Cmd+K 단축키
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

  // 첫 접속 시 기본 프로젝트 생성
  useEffect(() => {
    if (!projectsLoading && projects.length === 0 && userId) {
      handleAddProject("내 할 일", "📋", "#FF9800");
    }
  }, [projectsLoading, projects.length, userId]);

  return (
    <div className="grid grid-cols-[260px_1fr] h-full">
      {projectsLoading ? (
        <div className="bg-sidebar border-r border-bd w-[260px]"><SidebarSkeleton /></div>
      ) : (
        <Sidebar
          projects={projectsWithCounts}
          activeProjectId={activeProjectId}
          onProjectSelect={setActiveProjectId}
          onAddProject={handleAddProject}
        />
      )}

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
              activeCategory === "all" ? "bg-accent text-black border-accent font-bold" : "bg-bg-2 text-tx-2 border-bd hover:border-accent hover:text-accent"
            }`}
          >
            전체
          </button>
          {TODO_CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setActiveCategory(activeCategory === cat.value ? "all" : cat.value)}
              className={`px-3 py-1.5 text-[13px] rounded-full border whitespace-nowrap transition-all flex items-center gap-1 ${
                activeCategory === cat.value ? "bg-accent text-black border-accent font-bold" : "bg-bg-2 text-tx-2 border-bd hover:border-accent hover:text-accent"
              }`}
            >
              <span>{cat.icon}</span>
              {cat.label}
            </button>
          ))}
        </div>

        <QuickAdd onAdd={handleAdd} />

        {todosLoading ? (
          <TodoSkeleton />
        ) : (
          <TodoList
            todos={filteredTodos}
            onToggle={handleToggle}
            onDelete={handleDelete}
            onEdit={handleEdit}
          />
        )}
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

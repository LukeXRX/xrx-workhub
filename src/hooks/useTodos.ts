"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import type { Todo } from "@/types";

export function useTodos(projectId: string | null) {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTodos = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from("todos")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });

    if (projectId && projectId !== "all") {
      query = query.eq("project_id", projectId);
    }

    const { data, error } = await query;
    if (error) {
      console.error("TODO 조회 실패:", error);
    } else {
      setTodos(data || []);
    }
    setLoading(false);
  }, [projectId]);

  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]);

  // Realtime 구독
  useEffect(() => {
    const channel = supabase
      .channel("todos-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "todos" },
        () => {
          fetchTodos();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchTodos]);

  const addTodo = async (todo: Partial<Todo>) => {
    const { data, error } = await supabase
      .from("todos")
      .insert(todo)
      .select()
      .single();
    if (error) {
      console.error("TODO 생성 실패:", error);
      return null;
    }
    return data;
  };

  const updateTodo = async (id: string, updates: Partial<Todo>) => {
    const { error } = await supabase
      .from("todos")
      .update(updates)
      .eq("id", id);
    if (error) console.error("TODO 수정 실패:", error);
  };

  const deleteTodo = async (id: string) => {
    const { error } = await supabase.from("todos").delete().eq("id", id);
    if (error) console.error("TODO 삭제 실패:", error);
  };

  const toggleTodo = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === "pending" ? "done" : "pending";
    await updateTodo(id, {
      status: newStatus,
      completed_at: newStatus === "done" ? new Date().toISOString() : null,
    });
  };

  return { todos, loading, addTodo, updateTodo, deleteTodo, toggleTodo, refetch: fetchTodos };
}

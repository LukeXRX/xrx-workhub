"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import type { Project } from "@/types";

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("is_archived", false)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("프로젝트 조회 실패:", error);
    } else {
      setProjects(data || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const addProject = async (project: Partial<Project>) => {
    const { data, error } = await supabase
      .from("projects")
      .insert(project)
      .select()
      .single();
    if (error) {
      console.error("프로젝트 생성 실패:", error);
      return null;
    }
    return data;
  };

  const updateProject = async (id: string, updates: Partial<Project>) => {
    const { error } = await supabase
      .from("projects")
      .update(updates)
      .eq("id", id);
    if (error) console.error("프로젝트 수정 실패:", error);
  };

  const archiveProject = async (id: string) => {
    await updateProject(id, { is_archived: true });
  };

  return { projects, loading, addProject, updateProject, archiveProject, refetch: fetchProjects };
}

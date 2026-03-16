"use client";

import { useState, useEffect, useCallback } from "react";
import type { DriveFile } from "@/types";

export function useDriveFiles(folderId?: string) {
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFiles = useCallback(async () => {
    setLoading(true);
    try {
      const params = folderId ? `?folderId=${folderId}` : "";
      const res = await fetch(`/api/google/drive${params}`);
      if (res.ok) {
        const data = await res.json();
        setFiles(data.files || []);
      }
    } catch (err) {
      console.error("Drive 파일 조회 실패:", err);
    }
    setLoading(false);
  }, [folderId]);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  return { files, loading, refetch: fetchFiles };
}

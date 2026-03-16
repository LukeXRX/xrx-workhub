"use client";

import type { DriveFile } from "@/types";
import { getFileIcon } from "@/lib/google/drive";

interface FileGridProps {
  files: DriveFile[];
  onFileClick?: (file: DriveFile) => void;
}

export default function FileGrid({ files, onFileClick }: FileGridProps) {
  if (files.length === 0) {
    return (
      <div className="text-center py-20 text-tx-3">
        <p className="text-4xl mb-3">📁</p>
        <p className="text-lg font-medium text-tx">파일이 없습니다</p>
        <p className="text-sm mt-1">Google Drive에서 파일을 추가하세요</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
      {files.map((file) => (
        <button
          key={file.id}
          onClick={() => onFileClick?.(file)}
          className="p-4 border border-bd bg-card hover:border-accent hover:bg-accent-soft transition-all text-left group"
        >
          {file.thumbnailLink ? (
            <img
              src={file.thumbnailLink}
              alt={file.name}
              className="w-full h-24 object-cover mb-3 rounded"
            />
          ) : (
            <div className="w-full h-24 flex items-center justify-center text-4xl mb-3 bg-bg-2 rounded">
              {getFileIcon(file.mimeType)}
            </div>
          )}
          <p className="text-sm font-medium text-tx truncate">{file.name}</p>
          <p className="text-[11px] text-tx-3 mt-1">
            {new Date(file.modifiedTime).toLocaleDateString("ko-KR")}
          </p>
        </button>
      ))}
    </div>
  );
}

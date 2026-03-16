import type { DriveFile } from "@/types";

const DRIVE_API = "https://www.googleapis.com/drive/v3";

// 파일 목록 조회
export async function listDriveFiles(
  accessToken: string,
  folderId?: string,
  pageSize: number = 20
): Promise<DriveFile[]> {
  const query = folderId ? `'${folderId}' in parents and trashed = false` : "trashed = false";

  const params = new URLSearchParams({
    q: query,
    pageSize: String(pageSize),
    fields: "files(id,name,mimeType,iconLink,webViewLink,modifiedTime,size,thumbnailLink)",
    orderBy: "modifiedTime desc",
  });

  const res = await fetch(`${DRIVE_API}/files?${params}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) throw new Error(`Drive API 에러: ${res.status}`);
  const data = await res.json();
  return data.files || [];
}

// 폴더 생성
export async function createDriveFolder(
  accessToken: string,
  name: string,
  parentId?: string
): Promise<DriveFile> {
  const metadata: Record<string, unknown> = {
    name,
    mimeType: "application/vnd.google-apps.folder",
  };
  if (parentId) metadata.parents = [parentId];

  const res = await fetch(`${DRIVE_API}/files`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(metadata),
  });

  if (!res.ok) throw new Error(`Drive 폴더 생성 실패: ${res.status}`);
  return res.json();
}

// 파일 MIME 타입으로 아이콘 결정
export function getFileIcon(mimeType: string): string {
  if (mimeType.includes("folder")) return "📁";
  if (mimeType.includes("document")) return "📝";
  if (mimeType.includes("spreadsheet")) return "📊";
  if (mimeType.includes("presentation")) return "📽️";
  if (mimeType.includes("image")) return "🖼️";
  if (mimeType.includes("pdf")) return "📕";
  return "📄";
}

// 파일 임베드 URL 생성
export function getEmbedUrl(fileId: string, mimeType: string): string {
  if (mimeType.includes("document")) {
    return `https://docs.google.com/document/d/${fileId}/edit`;
  }
  if (mimeType.includes("spreadsheet")) {
    return `https://docs.google.com/spreadsheets/d/${fileId}/edit`;
  }
  if (mimeType.includes("presentation")) {
    return `https://docs.google.com/presentation/d/${fileId}/edit`;
  }
  return `https://drive.google.com/file/d/${fileId}/preview`;
}

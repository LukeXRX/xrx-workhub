// XRX WorkHub 타입 정의

export interface Profile {
  id: string;
  display_name: string;
  email: string;
  avatar_url: string | null;
  role: "owner" | "admin" | "member" | "viewer";
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  name: string;
  description: string | null;
  color: string;
  icon: string;
  drive_folder_id: string | null;
  owner_id: string;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProjectMember {
  id: string;
  project_id: string;
  user_id: string;
  role: "owner" | "admin" | "member" | "viewer";
  joined_at: string;
}

export type TodoCategory = "문서 작성" | "개발" | "이메일" | "자료 조사" | "디자인" | "출장" | "검토" | "기타";

export const TODO_CATEGORIES: { value: TodoCategory; label: string; icon: string }[] = [
  { value: "개발", label: "개발", icon: "💻" },
  { value: "문서 작성", label: "문서 작성", icon: "📝" },
  { value: "이메일", label: "이메일", icon: "✉️" },
  { value: "자료 조사", label: "자료 조사", icon: "🔍" },
  { value: "디자인", label: "디자인", icon: "🎨" },
  { value: "출장", label: "출장", icon: "✈️" },
  { value: "검토", label: "검토", icon: "✅" },
  { value: "기타", label: "기타", icon: "📌" },
];

export interface Todo {
  id: string;
  project_id: string;
  created_by: string;
  assigned_to: string | null;
  title: string;
  description: string | null;
  status: "pending" | "done";
  priority: "high" | "medium" | "low";
  category: TodoCategory | null;
  due_date: string | null;
  gcal_event_id: string | null;
  drive_file_ids: string[] | null;
  completed_at: string | null;
  sort_order: number;
  created_at: string;
}

export interface CalendarEvent {
  id: string;
  summary: string;
  description?: string;
  start: { dateTime: string; timeZone: string };
  end: { dateTime: string; timeZone: string };
  htmlLink: string;
  hangoutLink?: string;
}

export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  iconLink: string;
  webViewLink: string;
  modifiedTime: string;
  size?: string;
  thumbnailLink?: string;
}

export interface ChatChannel {
  id: string;
  project_id: string;
  name: string;
  description: string | null;
  is_direct: boolean;
  created_by: string;
  created_at: string;
}

export interface ChatMessage {
  id: string;
  channel_id: string;
  user_id: string;
  content: string;
  thread_id: string | null;
  is_edited: boolean;
  created_at: string;
  updated_at: string;
}

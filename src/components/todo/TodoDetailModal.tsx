"use client";

import React, { useState, useEffect, useRef, useMemo, KeyboardEvent } from "react";
import type { Todo, TodoCategory } from "@/types";
import { TODO_CATEGORIES } from "@/types";

interface Invitee {
  email: string;
  status: "pending" | "accepted" | "declined";
}

const REMINDER_OPTIONS = [
  { id: "1h", label: "1시간 전", value: "1h" },
  { id: "1d", label: "1일 전", value: "1d" },
  { id: "due", label: "마감일 당일", value: "due" },
  { id: "none", label: "알림 없음", value: "none" },
];

interface TodoDetailModalProps {
  todo: Todo | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (id: string, updates: Partial<Todo>) => void;
  onDelete: (id: string) => void;
}

// YouTube ID 추출
function getYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
    /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

function isImageUrl(url: string): boolean {
  return /\.(png|jpg|jpeg|gif|webp|svg|bmp)(\?.*)?$/i.test(url);
}

type UrlPreview =
  | { type: "youtube"; url: string; ytId: string }
  | { type: "image"; url: string }
  | { type: "link"; url: string };

export default function TodoDetailModal({
  todo,
  isOpen,
  onClose,
  onUpdate,
  onDelete,
}: TodoDetailModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<"high" | "medium" | "low">("medium");
  const [category, setCategory] = useState<TodoCategory | null>(null);
  const [dueDate, setDueDate] = useState("");
  const [pastedImages, setPastedImages] = useState<string[]>([]);
  const [invitees, setInvitees] = useState<Invitee[]>([]);
  const [inviteEmail, setInviteEmail] = useState("");
  const [reminder, setReminder] = useState("1d");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (todo && isOpen) {
      setTitle(todo.title);
      setDescription(todo.description || "");
      setPriority(todo.priority);
      setCategory(todo.category || null);
      setDueDate(todo.due_date || "");
      setPastedImages([]);
      setInvitees([]);
      setReminder("1d");
      setShowDeleteConfirm(false);
      setTimeout(() => titleRef.current?.focus(), 50);
    }
  }, [todo, isOpen]);

  useEffect(() => {
    const handler = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  // 이미지 파일을 base64로 읽어서 pastedImages에 추가
  const addImageFile = (file: File) => {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === "string") {
        setPastedImages((prev) => [...prev, reader.result as string]);
      }
    };
    reader.readAsDataURL(file);
  };

  // 모달 div에서 직접 paste 처리 (React synthetic event)
  const handleModalPaste = (e: React.ClipboardEvent) => {
    const items = Array.from(e.clipboardData.items || []);
    for (const item of items) {
      if (item.type.startsWith("image/")) {
        e.preventDefault();
        e.stopPropagation();
        const file = item.getAsFile();
        if (file) addImageFile(file);
        return;
      }
    }
    // files도 체크
    for (let i = 0; i < e.clipboardData.files.length; i++) {
      if (e.clipboardData.files[i].type.startsWith("image/")) {
        e.preventDefault();
        e.stopPropagation();
        addImageFile(e.clipboardData.files[i]);
        return;
      }
    }
  };

  // 드래그 앤 드롭
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    files.forEach((file) => {
      if (file.type.startsWith("image/")) addImageFile(file);
    });
  };

  // 클립보드 API로 이미지 읽기 (버튼 클릭용)
  const pasteFromClipboard = async () => {
    try {
      const items = await navigator.clipboard.read();
      for (const item of items) {
        const imageType = item.types.find((t) => t.startsWith("image/"));
        if (imageType) {
          const blob = await item.getType(imageType);
          addImageFile(new File([blob], "pasted-image.png", { type: imageType }));
          return;
        }
      }
      alert("클립보드에 이미지가 없습니다");
    } catch {
      // Clipboard API 미지원 시 file input 대체
      fileInputRef.current?.click();
    }
  };

  // file input ref (폴백용)
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    for (let i = 0; i < files.length; i++) {
      addImageFile(files[i]);
    }
    e.target.value = "";
  };

  // Description 텍스트에서 URL 미리보기 추출 (useMemo — 즉시 반영)
  const urlPreviews: UrlPreview[] = useMemo(() => {
    if (!description) return [];
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const urls = description.match(urlRegex) || [];
    const seen = new Set<string>();
    const results: UrlPreview[] = [];

    for (const url of urls) {
      if (seen.has(url)) continue;
      seen.add(url);

      const ytId = getYouTubeId(url);
      if (ytId) {
        results.push({ type: "youtube", url, ytId });
      } else if (isImageUrl(url)) {
        results.push({ type: "image", url });
      } else {
        results.push({ type: "link", url });
      }
    }
    return results;
  }, [description]);

  // 이미지 붙여넣기 (Ctrl+V / Cmd+V)
  const handlePaste = (e: React.ClipboardEvent) => {
    const clipboardData = e.clipboardData;
    if (!clipboardData) return;

    // files 먼저 체크 (더 신뢰성 높음)
    if (clipboardData.files && clipboardData.files.length > 0) {
      for (let i = 0; i < clipboardData.files.length; i++) {
        const file = clipboardData.files[i];
        if (file.type.startsWith("image/")) {
          e.preventDefault();
          const reader = new FileReader();
          reader.onloadend = () => {
            const result = reader.result;
            if (typeof result === "string") {
              setPastedImages((prev) => [...prev, result]);
            }
          };
          reader.readAsDataURL(file);
          return;
        }
      }
    }

    // items fallback
    const items = clipboardData.items;
    if (!items) return;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.startsWith("image/")) {
        e.preventDefault();
        const file = items[i].getAsFile();
        if (!file) continue;
        const reader = new FileReader();
        reader.onloadend = () => {
          const result = reader.result;
          if (typeof result === "string") {
            setPastedImages((prev) => [...prev, result]);
          }
        };
        reader.readAsDataURL(file);
        return;
      }
    }
  };

  const removePastedImage = (index: number) => {
    setPastedImages((prev) => prev.filter((_, i) => i !== index));
  };

  if (!isOpen || !todo) return null;

  const handleSave = () => {
    onUpdate(todo.id, {
      title: title.trim() || todo.title,
      description: description.trim() || null,
      priority,
      category,
      due_date: dueDate || null,
    });
    onClose();
  };

  const handleAddInvitee = () => {
    const email = inviteEmail.trim();
    if (email && email.includes("@") && !invitees.find((i) => i.email === email)) {
      setInvitees((prev) => [...prev, { email, status: "pending" }]);
      setInviteEmail("");
    }
  };

  const handleInviteKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.nativeEvent.isComposing || e.keyCode === 229) return;
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddInvitee();
    }
  };

  const removeInvitee = (email: string) => {
    setInvitees((prev) => prev.filter((i) => i.email !== email));
  };

  const handleDelete = () => {
    if (showDeleteConfirm) {
      onDelete(todo.id);
      onClose();
    } else {
      setShowDeleteConfirm(true);
    }
  };

  const priorityConfig = {
    high: { label: "HIGH", color: "bg-red-500 text-white" },
    medium: { label: "MED", color: "bg-accent text-black" },
    low: { label: "LOW", color: "bg-blue-400 text-white" },
  };

  const statusConfig = {
    pending: { emoji: "⏳", label: "대기중", color: "text-yellow-500" },
    accepted: { emoji: "✅", label: "수락", color: "text-green-500" },
    declined: { emoji: "❌", label: "거절", color: "text-red-500" },
  };

  const hasAttachments = pastedImages.length > 0 || urlPreviews.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div
        className={`relative w-full max-w-[720px] mx-4 bg-card border rounded-lg shadow-2xl max-h-[90vh] overflow-y-auto ${isDragging ? "border-accent border-2" : "border-bd"}`}
        onPaste={handleModalPaste}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        {/* 헤더 */}
        <div className="sticky top-0 bg-card border-b border-bd px-7 py-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-2.5">
            <span className={`w-2.5 h-2.5 rounded-full ${priority === "high" ? "bg-red-500" : priority === "medium" ? "bg-accent" : "bg-blue-400"}`} />
            <span className="text-[14px] font-semibold text-tx-3 uppercase tracking-wider">Task Detail</span>
            {category && (
              <span className="ml-2 text-[12px] px-2 py-0.5 rounded-full bg-bg-3 text-tx-2">
                {TODO_CATEGORIES.find((c) => c.value === category)?.icon} {category}
              </span>
            )}
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-bg-3 text-tx-3 hover:text-tx transition-all text-lg">✕</button>
        </div>

        <div className="px-7 py-6 space-y-6">
          {/* 제목 */}
          <input
            ref={titleRef}
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full text-2xl font-semibold text-tx bg-transparent outline-none border-b-2 border-transparent hover:border-bd focus:border-accent pb-2 transition-colors"
            placeholder="할 일 제목..."
          />

          {/* 설명 + 붙여넣기 */}
          <div>
            <label className="text-[12px] font-bold uppercase tracking-[2px] text-tx-3 mb-2 flex items-center gap-2">
              Description / Notes
              <span className="text-[11px] font-normal normal-case tracking-normal text-tx-3/60">
                — 이미지 Ctrl+V 붙여넣기, URL 자동 미리보기
              </span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
              className="w-full bg-bg-2 border border-bd rounded-t-lg px-4 py-3 text-[16px] leading-relaxed text-tx placeholder:text-tx-3 outline-none focus:border-accent resize-y min-h-[140px]"
              placeholder={"메모, 링크, 이미지 URL 입력...\n스크린샷을 Ctrl+V로 바로 붙여넣을 수 있습니다"}
            />
            {/* 이미지 첨부 바 */}
            <div className="flex items-center gap-2 px-3 py-2 bg-bg-2 border border-t-0 border-bd rounded-b-lg">
              <button
                type="button"
                onClick={pasteFromClipboard}
                className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] text-tx-3 hover:text-accent hover:bg-accent/10 rounded transition-all"
              >
                📋 클립보드에서 붙여넣기
              </button>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] text-tx-3 hover:text-accent hover:bg-accent/10 rounded transition-all"
              >
                📎 파일 첨부
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileSelect}
                className="hidden"
              />
              {pastedImages.length > 0 && (
                <span className="ml-auto text-[11px] text-accent font-semibold">{pastedImages.length}개 이미지 첨부됨</span>
              )}
            </div>
          </div>

          {/* ═══ 첨부 미리보기 ═══ */}
          {hasAttachments && (
            <div className="space-y-4 -mt-2">
              {/* 붙여넣은 이미지 */}
              {pastedImages.length > 0 && (
                <div>
                  <label className="text-[12px] font-bold uppercase tracking-[2px] text-tx-3 mb-2 block">
                    📷 Pasted Images ({pastedImages.length})
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {pastedImages.map((dataUrl, idx) => (
                      <div key={idx} className="relative group rounded-lg border border-bd overflow-hidden bg-bg-2">
                        <img
                          src={dataUrl}
                          alt={`Pasted ${idx + 1}`}
                          className="w-full max-h-[220px] object-contain cursor-zoom-in"
                          onClick={() => {
                            const w = window.open();
                            if (w) { w.document.write(`<img src="${dataUrl}" style="max-width:100%">`); w.document.title = "Image Preview"; }
                          }}
                        />
                        <button
                          onClick={() => removePastedImage(idx)}
                          className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/80 text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* YouTube 썸네일 */}
              {urlPreviews.filter((p) => p.type === "youtube").map((preview, idx) => (
                <a
                  key={`yt-${idx}`}
                  href={preview.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block rounded-lg border border-bd overflow-hidden bg-bg-2 hover:border-accent transition-colors group"
                >
                  <div className="relative">
                    <img
                      src={`https://img.youtube.com/vi/${(preview as { ytId: string }).ytId}/hqdefault.jpg`}
                      alt="YouTube thumbnail"
                      className="w-full h-[200px] object-cover"
                      referrerPolicy="no-referrer"
                      crossOrigin="anonymous"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${(preview as { ytId: string }).ytId}/0.jpg`;
                      }}
                    />
                    {/* Play 버튼 오버레이 */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-16 h-16 rounded-full bg-red-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                          <path d="M8 5v14l11-7z"/>
                        </svg>
                      </div>
                    </div>
                  </div>
                  <div className="px-4 py-2.5 flex items-center gap-2">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="#FF0000"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814z"/><path d="M9.545 15.568V8.432L15.818 12z" fill="white"/></svg>
                    <span className="text-[13px] text-tx-2 group-hover:text-accent transition-colors truncate flex-1">{preview.url}</span>
                    <span className="text-[12px] text-tx-3 group-hover:text-accent">YouTube에서 보기 ↗</span>
                  </div>
                </a>
              ))}

              {/* 이미지 URL */}
              {urlPreviews.filter((p) => p.type === "image").map((preview, idx) => (
                <div key={`img-${idx}`} className="rounded-lg border border-bd overflow-hidden bg-bg-2 group">
                  <img
                    src={preview.url}
                    alt="Image"
                    className="w-full max-h-[250px] object-contain cursor-pointer"
                    onClick={() => window.open(preview.url, "_blank")}
                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                  />
                  <a href={preview.url} target="_blank" rel="noopener noreferrer" className="block px-4 py-2 text-[12px] text-tx-3 hover:text-accent truncate">
                    {preview.url} ↗
                  </a>
                </div>
              ))}

              {/* 일반 링크 */}
              {urlPreviews.filter((p) => p.type === "link").map((preview, idx) => (
                <a
                  key={`link-${idx}`}
                  href={preview.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 px-4 py-3 rounded-lg border border-bd bg-bg-2 hover:border-accent hover:bg-bg-3 transition-all group"
                >
                  <span className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center text-accent text-lg flex-shrink-0">🔗</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-medium text-tx group-hover:text-accent truncate transition-colors">{preview.url}</p>
                    <p className="text-[11px] text-tx-3 mt-0.5">새 탭에서 열기</p>
                  </div>
                  <span className="text-tx-3 group-hover:text-accent text-lg transition-colors">↗</span>
                </a>
              ))}
            </div>
          )}

          {/* 우선순위 */}
          <div>
            <label className="text-[12px] font-bold uppercase tracking-[2px] text-tx-3 mb-2 block">Priority</label>
            <div className="flex gap-2">
              {(["high", "medium", "low"] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setPriority(p)}
                  className={`flex-1 py-2 text-[13px] font-bold uppercase tracking-wider rounded transition-all ${
                    priority === p ? priorityConfig[p].color : "bg-bg-3 text-tx-3 hover:bg-bg-2"
                  }`}
                >
                  {priorityConfig[p].label}
                </button>
              ))}
            </div>
          </div>

          {/* 카테고리 */}
          <div>
            <label className="text-[12px] font-bold uppercase tracking-[2px] text-tx-3 mb-2 block">Category</label>
            <div className="flex flex-wrap gap-2">
              {TODO_CATEGORIES.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => setCategory(category === cat.value ? null : cat.value)}
                  className={`px-3 py-1.5 text-[13px] rounded-full border transition-all flex items-center gap-1.5 ${
                    category === cat.value
                      ? "bg-accent text-black border-accent font-bold"
                      : "bg-bg-2 text-tx-2 border-bd hover:border-accent hover:text-accent"
                  }`}
                >
                  <span>{cat.icon}</span>
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* 마감일 + 알림 */}
          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className="text-[12px] font-bold uppercase tracking-[2px] text-tx-3 mb-2 block">Due Date</label>
              <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="w-full bg-bg-2 border border-bd rounded px-3 py-2.5 text-[15px] text-tx outline-none focus:border-accent" />
            </div>
            <div>
              <label className="text-[12px] font-bold uppercase tracking-[2px] text-tx-3 mb-2 block">Reminder</label>
              <select value={reminder} onChange={(e) => setReminder(e.target.value)} className="w-full bg-bg-2 border border-bd rounded px-3 py-2.5 text-[15px] text-tx outline-none focus:border-accent">
                {REMINDER_OPTIONS.map((opt) => (
                  <option key={opt.id} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* 이메일 초대 */}
          <div>
            <label className="text-[12px] font-bold uppercase tracking-[2px] text-tx-3 mb-2 block">Invite People</label>
            <div className="flex gap-2">
              <input type="email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} onKeyDown={handleInviteKeyDown} placeholder="이메일 주소 입력..." className="flex-1 bg-bg-2 border border-bd rounded px-3 py-2.5 text-[15px] text-tx placeholder:text-tx-3 outline-none focus:border-accent" />
              <button onClick={handleAddInvitee} disabled={!inviteEmail.includes("@")} className="px-5 py-2.5 bg-accent text-black text-[13px] font-bold uppercase tracking-wider rounded disabled:opacity-40 hover:brightness-110 transition-all">Invite</button>
            </div>
            {invitees.length > 0 && (
              <div className="mt-3 space-y-1.5">
                {invitees.map((inv) => (
                  <div key={inv.email} className="flex items-center gap-3 px-4 py-2.5 bg-bg-2 rounded text-[14px]">
                    <span className="text-tx-2 flex-1 truncate">{inv.email}</span>
                    <span className={`text-[12px] font-semibold ${statusConfig[inv.status].color}`}>{statusConfig[inv.status].emoji} {statusConfig[inv.status].label}</span>
                    <button onClick={() => removeInvitee(inv.email)} className="text-tx-3 hover:text-red-500 transition-colors">✕</button>
                  </div>
                ))}
              </div>
            )}
            <p className="text-[12px] text-tx-3 mt-2">초대된 사람의 캘린더에 대기 상태로 일정이 추가됩니다</p>
          </div>
        </div>

        {/* 하단 */}
        <div className="sticky bottom-0 bg-card border-t border-bd px-7 py-4 flex items-center justify-between">
          <button onClick={handleDelete} className={`text-[14px] transition-all ${showDeleteConfirm ? "text-red-500 font-bold" : "text-tx-3 hover:text-red-500"}`}>
            {showDeleteConfirm ? "정말 삭제하시겠습니까?" : "Delete Task"}
          </button>
          <div className="flex gap-3">
            <button onClick={onClose} className="px-5 py-2.5 text-[14px] text-tx-3 hover:text-tx transition-all">Cancel</button>
            <button onClick={handleSave} className="px-6 py-2.5 bg-accent text-black text-[14px] font-bold uppercase tracking-wider rounded hover:brightness-110 transition-all">Save</button>
          </div>
        </div>
      </div>
    </div>
  );
}

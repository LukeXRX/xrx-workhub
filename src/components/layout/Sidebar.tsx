"use client";

import { useState, useRef, useEffect, KeyboardEvent } from "react";

export interface ProjectItem {
  id: string;
  name: string;
  icon: string;
  color: string;
  count: number;
}

const PROJECT_ICONS = ["📁", "🚀", "💡", "🎯", "🔧", "📊", "🎨", "🤖", "🧠", "🏢"];
const PROJECT_COLORS = ["#FF9800", "#4CAF50", "#2196F3", "#E91E63", "#9C27B0", "#00BCD4", "#FF5722", "#607D8B"];

interface SidebarProps {
  projects: ProjectItem[];
  activeProjectId: string;
  onProjectSelect: (id: string) => void;
  onAddProject: (name: string, icon: string, color: string) => void;
}

export default function Sidebar({
  projects,
  activeProjectId,
  onProjectSelect,
  onAddProject,
}: SidebarProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [selectedIcon, setSelectedIcon] = useState("📁");
  const [selectedColor, setSelectedColor] = useState("#FF9800");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isAdding) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isAdding]);

  const handleSubmit = () => {
    if (newName.trim()) {
      onAddProject(newName.trim(), selectedIcon, selectedColor);
      setNewName("");
      setSelectedIcon("📁");
      setSelectedColor("#FF9800");
      setIsAdding(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.nativeEvent.isComposing || e.keyCode === 229) return;
    if (e.key === "Enter") {
      e.preventDefault();
      handleSubmit();
    }
    if (e.key === "Escape") {
      setIsAdding(false);
      setNewName("");
    }
  };

  return (
    <div className="bg-sidebar border-r border-bd overflow-y-auto w-[260px]">
      {/* 헤더 */}
      <div className="px-5 py-4 flex items-center justify-between border-b border-bd sticky top-0 bg-sidebar z-5">
        <h2 className="text-[16px] font-semibold text-tx uppercase tracking-widest">
          Projects
        </h2>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className={`w-7 h-7 rounded-full flex items-center justify-center text-lg font-light cursor-pointer transition-all ${
            isAdding
              ? "bg-tx-3 text-white rotate-45"
              : "bg-accent text-black hover:brightness-110"
          }`}
        >
          +
        </button>
      </div>

      {/* 프로젝트 추가 폼 */}
      {isAdding && (
        <div className="px-4 py-3 border-b border-bd bg-bg-2">
          <input
            ref={inputRef}
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="프로젝트 이름..."
            className="w-full bg-bg-3 border border-bd rounded px-3 py-2 text-[15px] text-tx placeholder:text-tx-3 outline-none focus:border-accent"
          />
          {/* 아이콘 선택 */}
          <div className="flex gap-1 mt-2 flex-wrap">
            {PROJECT_ICONS.map((icon) => (
              <button
                key={icon}
                onClick={() => setSelectedIcon(icon)}
                className={`w-7 h-7 flex items-center justify-center text-sm rounded transition-all ${
                  selectedIcon === icon ? "bg-accent-20 ring-1 ring-accent" : "hover:bg-bg-3"
                }`}
              >
                {icon}
              </button>
            ))}
          </div>
          {/* 색상 선택 */}
          <div className="flex gap-1.5 mt-2">
            {PROJECT_COLORS.map((color) => (
              <button
                key={color}
                onClick={() => setSelectedColor(color)}
                className={`w-5 h-5 rounded-full transition-all ${
                  selectedColor === color ? "ring-2 ring-offset-1 ring-accent" : ""
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
          {/* 버튼 */}
          <div className="flex gap-2 mt-3">
            <button
              onClick={handleSubmit}
              disabled={!newName.trim()}
              className="flex-1 py-1.5 bg-accent text-black text-[13px] font-semibold uppercase tracking-wider rounded disabled:opacity-40 hover:brightness-110 transition-all"
            >
              Create
            </button>
            <button
              onClick={() => { setIsAdding(false); setNewName(""); }}
              className="px-3 py-1.5 text-xs text-tx-3 hover:text-tx transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Workspace */}
      <div className="px-5 pt-4 pb-1.5 text-[12px] font-semibold uppercase tracking-[2px] text-tx-3">
        Workspace
      </div>

      {/* All Tasks */}
      <button
        onClick={() => onProjectSelect("all")}
        className={`
          w-full px-5 py-2.5 flex items-center gap-3 cursor-pointer transition-all text-[16px]
          ${activeProjectId === "all"
            ? "bg-accent-soft border-l-[3px] border-l-accent text-accent"
            : "text-tx-2 hover:bg-accent-soft border-l-[3px] border-l-transparent"
          }
        `}
      >
        <span className={`w-8 h-8 flex items-center justify-center text-[13px] font-semibold ${activeProjectId === "all" ? "bg-accent-20 text-accent" : "bg-tx-4 text-tx-3"}`}>
          📋
        </span>
        <span>All Tasks</span>
        <span className={`ml-auto text-[13px] font-semibold px-2 py-0.5 rounded-[10px] ${activeProjectId === "all" ? "bg-accent-20 text-accent" : "bg-tx-4 text-tx-3"}`}>
          {projects.reduce((sum, p) => sum + p.count, 0)}
        </span>
      </button>

      {/* Projects */}
      <div className="px-5 pt-4 pb-1.5 text-[12px] font-semibold uppercase tracking-[2px] text-tx-3">
        Projects
      </div>

      {projects.map((project) => {
        const isActive = activeProjectId === project.id;
        return (
          <button
            key={project.id}
            onClick={() => onProjectSelect(project.id)}
            className={`
              w-full px-5 py-2.5 flex items-center gap-3 cursor-pointer transition-all text-[16px]
              ${isActive
                ? "bg-accent-soft border-l-[3px]"
                : "text-tx-2 hover:bg-accent-soft border-l-[3px] border-l-transparent"
              }
            `}
            style={isActive ? { borderLeftColor: project.color, color: project.color } : undefined}
          >
            <span
              className="w-8 h-8 flex items-center justify-center text-[13px] font-semibold"
              style={
                isActive
                  ? { backgroundColor: project.color + "20", color: project.color }
                  : undefined
              }
            >
              {project.icon}
            </span>
            <span>{project.name}</span>
            <span
              className={`ml-auto text-xs font-semibold px-2 py-0.5 rounded-[10px] ${!isActive ? "bg-tx-4 text-tx-3" : ""}`}
              style={
                isActive
                  ? { backgroundColor: project.color + "20", color: project.color }
                  : undefined
              }
            >
              {project.count}
            </span>
          </button>
        );
      })}
    </div>
  );
}

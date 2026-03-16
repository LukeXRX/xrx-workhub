"use client";

interface GWSItem {
  id: string;
  icon: string;
  label: string;
}

const gwsItems: GWSItem[] = [
  { id: "docs", icon: "📝", label: "Docs" },
  { id: "sheets", icon: "📊", label: "Sheets" },
  { id: "slides", icon: "📽️", label: "Slides" },
  { id: "meet", icon: "🎥", label: "Meet" },
  { id: "drive", icon: "💾", label: "Drive" },
];

interface GWSBarProps {
  onItemClick?: (id: string) => void;
}

export default function GWSBar({ onItemClick }: GWSBarProps) {
  return (
    <div className="flex gap-1.5 py-2.5 mb-4 border-b border-bd overflow-x-auto">
      {gwsItems.map((item) => (
        <button
          key={item.id}
          onClick={() => onItemClick?.(item.id)}
          className="flex items-center gap-1.5 px-3.5 py-1.5 border border-bd text-sm text-tx-2 cursor-pointer transition-all whitespace-nowrap bg-card hover:border-accent hover:text-accent"
        >
          <span className="text-[17px]">{item.icon}</span>
          {item.label}
        </button>
      ))}
    </div>
  );
}

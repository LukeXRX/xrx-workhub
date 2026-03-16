"use client";

interface GoogleEmbedProps {
  url: string;
  title?: string;
}

export default function GoogleEmbed({ url, title = "Google Document" }: GoogleEmbedProps) {
  return (
    <div className="w-full h-full flex flex-col">
      {/* 헤더 */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-bd bg-bg-2">
        <h3 className="text-sm font-medium text-tx truncate">{title}</h3>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[12px] text-accent hover:underline"
        >
          새 탭에서 열기 ↗
        </a>
      </div>

      {/* iframe */}
      <iframe
        src={url}
        title={title}
        className="flex-1 w-full border-none"
        sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
      />
    </div>
  );
}

"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";

interface ToastItem {
  id: string;
  type: "success" | "error" | "warning" | "info";
  message: string;
}

interface ToastContextType {
  toast: (type: ToastItem["type"], message: string) => void;
}

const ToastContext = createContext<ToastContextType>({ toast: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

const TOAST_STYLES: Record<ToastItem["type"], string> = {
  success: "bg-green-500/15 border-green-500/30 text-green-400",
  error: "bg-red-500/15 border-red-500/30 text-red-400",
  warning: "bg-amber-500/15 border-amber-500/30 text-amber-400",
  info: "bg-blue-500/15 border-blue-500/30 text-blue-400",
};

const TOAST_ICONS: Record<ToastItem["type"], string> = {
  success: "\u2713",
  error: "\u2715",
  warning: "\u26A0",
  info: "\u2139",
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const toast = useCallback((type: ToastItem["type"], message: string) => {
    const id = `toast-${Date.now()}`;
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {/* 토스트 컨테이너 */}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg backdrop-blur-sm animate-slide-up ${TOAST_STYLES[t.type]}`}
            onClick={() => removeToast(t.id)}
          >
            <span className="text-lg font-bold">{TOAST_ICONS[t.type]}</span>
            <span className="text-[14px] font-medium">{t.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

"use client";

import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  /** side パネル表示にする場合 true */
  side?: boolean;
  className?: string;
}

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  side = false,
  className,
}: ModalProps) {
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-[1px] animate-fade-in"
        onClick={onClose}
      />
      <div
        className={cn(
          "relative z-10 flex w-full flex-col bg-white shadow-soft animate-fade-in",
          side
            ? "ml-auto h-full max-w-xl border-l border-slate-200"
            : "m-auto max-h-[90vh] max-w-2xl rounded-2xl border border-slate-200",
          className
        )}
      >
        {(title || description) && (
          <div className="flex items-start justify-between gap-4 border-b border-slate-100 p-5">
            <div>
              {title && (
                <h2 className="text-lg font-semibold text-slate-800">{title}</h2>
              )}
              {description && (
                <p className="mt-0.5 text-sm text-slate-500">{description}</p>
              )}
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              aria-label="閉じる"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        )}
        <div className="flex-1 overflow-y-auto p-5">{children}</div>
        {footer && (
          <div className="flex justify-end gap-2 border-t border-slate-100 bg-slate-50 p-4">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

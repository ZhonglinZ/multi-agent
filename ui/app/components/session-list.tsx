import { Trash2 } from "lucide-react";

import { formatDate } from "../lib/format";
import type { LoadState, SessionItem } from "../types";

type SessionListProps = {
  onDelete: (sessionId: string) => void;
  onSelect: (sessionId: string) => void;
  selectedId: string | null;
  state: LoadState<SessionItem[]>;
};

export function SessionList({
  onDelete,
  onSelect,
  selectedId,
  state,
}: SessionListProps) {
  if (state.type === "loading") {
    return <div className="mt-4 text-sm text-slate-500">加载中...</div>;
  }

  if (state.type === "error") {
    return (
      <div className="mt-4 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
        {state.message}
      </div>
    );
  }

  if (state.data.length === 0) {
    return (
      <div className="mt-4 rounded-md border border-dashed border-slate-300 px-3 py-8 text-center text-sm text-slate-500">
        暂无会话
      </div>
    );
  }

  return (
    <div className="mt-3 grid gap-2">
      {state.data.map((session) => (
        <div
          className={`group flex items-center gap-2 rounded-md border px-3 py-3 transition ${
            selectedId === session.id
              ? "border-slate-950 bg-slate-50"
              : "border-slate-200 bg-white hover:border-slate-300"
          }`}
          key={session.id}
        >
          <button
            className="min-w-0 flex-1 text-left"
            onClick={() => onSelect(session.id)}
            type="button"
          >
            <div className="truncate text-sm font-medium text-slate-900">
              {session.title}
            </div>
            <div className="mt-1 text-xs text-slate-500">
              {session.status} · {formatDate(session.updated_at)}
            </div>
          </button>
          <button
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-slate-400 opacity-0 transition hover:bg-rose-50 hover:text-rose-600 group-hover:opacity-100"
            onClick={() => onDelete(session.id)}
            title="删除会话"
            type="button"
          >
            <Trash2 size={15} aria-hidden="true" />
          </button>
        </div>
      ))}
    </div>
  );
}

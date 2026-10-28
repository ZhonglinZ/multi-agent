import { LayoutDashboard } from "lucide-react";

import { StatusField } from "./status-field";
import { formatDate } from "../lib/format";
import type { SessionItem } from "../types";

export function SessionPanel({
  selectedSession,
}: {
  selectedSession: SessionItem | null;
}) {
  return (
    <div className="rounded-md border border-slate-200 bg-white p-5">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-emerald-50 text-emerald-700">
          <LayoutDashboard size={20} aria-hidden="true" />
        </div>
        <div>
          <h2 className="text-base font-semibold text-slate-950">会话详情</h2>
          <p className="mt-1 text-sm text-slate-500">本章先展示会话基础信息</p>
        </div>
      </div>

      {selectedSession ? (
        <div className="mt-5 grid grid-cols-2 gap-3 max-sm:grid-cols-1">
          <StatusField label="标题" value={selectedSession.title} />
          <StatusField label="状态" value={selectedSession.status} />
          <StatusField
            label="未读数"
            value={String(selectedSession.unread_count)}
          />
          <StatusField
            label="更新时间"
            value={formatDate(selectedSession.updated_at)}
          />
        </div>
      ) : (
        <div className="mt-5 rounded-md border border-dashed border-slate-300 px-4 py-10 text-center text-sm text-slate-500">
          创建或选择一个会话
        </div>
      )}
    </div>
  );
}

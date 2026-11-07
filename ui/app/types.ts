import type { LucideIcon } from "lucide-react";

export type ApiStatusData = {
  service: string;
  environment: string;
  status: string;
  version: string;
};

export type DatabaseStatusData = {
  status: string;
};

export type SessionItem = {
  id: string;
  title: string;
  status: string;
  unread_count: number;
  created_at: string;
  updated_at: string;
};

export type SessionListData = {
  items: SessionItem[];
};

export type ChatMessage = {
  id: string;
  session_id: string;
  role: "user" | "assistant" | "system";
  content: string;
  created_at: string;
};

export type MessageListData = {
  items: ChatMessage[];
};

export type SessionEventItem = {
  id: string;
  session_id: string;
  type: string;
  payload: Record<string, unknown>;
  created_at: string;
};

export type SessionEventListData = {
  items: SessionEventItem[];
};

export type MessageCreateData = {
  message: ChatMessage;
  event: SessionEventItem;
};

export type ApiResponse<T> = {
  code: number;
  message: string;
  data: T | null;
};

export type LoadState<T> =
  | { type: "loading" }
  | { type: "ready"; data: T }
  | { type: "error"; message: string };

export type StatusBadgeView = {
  label: string;
  className: string;
  icon: LucideIcon;
};

export type StreamEvent = {
  event: string;
  data: Record<string, unknown>;
};

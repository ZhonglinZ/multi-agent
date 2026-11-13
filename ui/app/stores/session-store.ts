import { create } from "zustand";

import {
  clearUnread,
  createSession,
  deleteSession,
  fetchEvents,
  fetchMessages,
  fetchSessions,
  streamMessage,
  stopSession,
} from "../lib/session-api";
import type {
  ChatMessage,
  LoadState,
  SessionEventItem,
  SessionItem,
  StreamEvent,
} from "../types";

type SessionState = {
  actionError: string | null;
  draft: string;
  events: LoadState<SessionEventItem[]>;
  messages: LoadState<ChatMessage[]>;
  selectedSessionId: string | null;
  clearingUnread: boolean;
  sendingMessage: boolean;
  sessions: LoadState<SessionItem[]>;
  stoppingSession: boolean;
  submitting: boolean;
  title: string;
};

type SessionActions = {
  createSession: () => Promise<void>;
  deleteSession: (sessionId: string) => Promise<void>;
  loadSessionDetail: (sessionId: string) => Promise<void>;
  refreshSessions: () => Promise<void>;
  clearUnread: () => Promise<void>;
  selectSession: (sessionId: string | null) => void;
  sendMessage: () => Promise<void>;
  stopSession: () => Promise<void>;
  setActionError: (message: string | null) => void;
  setDraft: (draft: string) => void;
  setTitle: (title: string) => void;
};

const initialDetailState = {
  messages: { type: "ready", data: [] } as LoadState<ChatMessage[]>,
  events: { type: "ready", data: [] } as LoadState<SessionEventItem[]>,
};

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "unknown error";
}

function updateSession(items: SessionItem[], nextSession: SessionItem) {
  return items.map((item) => (item.id === nextSession.id ? nextSession : item));
}

function toSessionEventItem(event: StreamEvent): SessionEventItem | null {
  if (event.event === "session_status") {
    const data = event.data as Partial<SessionItem>;
    if (!data.id || !data.status || !data.updated_at) {
      return null;
    }
    return {
      id: `${data.id}-${data.status}-${Date.now()}`,
      session_id: String(data.id),
      type: `session_status:${data.status}`,
      payload: {
        status: data.status,
      },
      created_at: String(data.updated_at),
    };
  }

  if (event.event === "message_created") {
    const data = event.data as Partial<SessionEventItem>;
    if (!data.id || !data.session_id || !data.type || !data.created_at) {
      return null;
    }
    return {
      id: String(data.id),
      session_id: String(data.session_id),
      type: String(data.type),
      payload:
        typeof data.payload === "object" && data.payload !== null
          ? (data.payload as Record<string, unknown>)
          : {},
      created_at: String(data.created_at),
    };
  }

  return null;
}

function toSessionItem(event: StreamEvent): SessionItem | null {
  if (event.event !== "session_status") {
    return null;
  }
  const data = event.data as Partial<SessionItem>;
  if (
    !data.id ||
    !data.title ||
    !data.status ||
    !data.created_at ||
    !data.updated_at ||
    data.unread_count === undefined
  ) {
    return null;
  }
  return {
    id: String(data.id),
    title: String(data.title),
    status: String(data.status),
    unread_count: Number(data.unread_count),
    created_at: String(data.created_at),
    updated_at: String(data.updated_at),
  };
}

export const useSessionStore = create<SessionState & SessionActions>(
  (set, get) => ({
    actionError: null,
    clearingUnread: false,
    draft: "",
    events: initialDetailState.events,
    messages: initialDetailState.messages,
    selectedSessionId: null,
    sendingMessage: false,
    sessions: { type: "loading" },
    stoppingSession: false,
    submitting: false,
    title: "",

    setActionError: (message) => set({ actionError: message }),
    setDraft: (draft) => set({ draft }),
    setTitle: (title) => set({ title }),

    selectSession: (sessionId) => {
      set({
        selectedSessionId: sessionId,
        ...initialDetailState,
      });
    },

    refreshSessions: async () => {
      set({ actionError: null });
      try {
        const items = await fetchSessions();
        set((state) => {
          const selectedSessionId =
            state.selectedSessionId &&
            items.some((item) => item.id === state.selectedSessionId)
              ? state.selectedSessionId
              : (items[0]?.id ?? null);

          return {
            sessions: { type: "ready", data: items },
            selectedSessionId,
          };
        });
      } catch (error) {
        set({
          actionError: getErrorMessage(error),
          sessions: { type: "error", message: getErrorMessage(error) },
        });
      }
    },

    loadSessionDetail: async (sessionId) => {
      set({
        events: { type: "loading" },
        messages: { type: "loading" },
      });
      try {
        const [messages, events] = await Promise.all([
          fetchMessages(sessionId),
          fetchEvents(sessionId),
        ]);
        set({
          events: { type: "ready", data: events },
          messages: { type: "ready", data: messages },
        });
      } catch (error) {
        const message = getErrorMessage(error);
        set({
          actionError: message,
          events: { type: "error", message },
          messages: { type: "error", message },
        });
      }
    },

    createSession: async () => {
      const cleanTitle = get().title.trim();
      if (!cleanTitle) {
        set({ actionError: "请输入会话标题" });
        return;
      }

      set({ actionError: null, submitting: true });
      try {
        const created = await createSession(cleanTitle);
        set({
          title: "",
          selectedSessionId: created.id,
        });
        await get().refreshSessions();
      } catch (error) {
        set({ actionError: getErrorMessage(error) });
      } finally {
        set({ submitting: false });
      }
    },

    deleteSession: async (sessionId) => {
      set({ actionError: null });
      try {
        await deleteSession(sessionId);
        await get().refreshSessions();
      } catch (error) {
        set({ actionError: getErrorMessage(error) });
      }
    },

    stopSession: async () => {
      const sessionId = get().selectedSessionId;
      if (!sessionId) {
        set({ actionError: "请先选择一个会话" });
        return;
      }

      set({ actionError: null, stoppingSession: true });
      try {
        const session = await stopSession(sessionId);
        set((state) => ({
          sessions:
            state.sessions.type === "ready"
              ? {
                  type: "ready",
                  data: updateSession(state.sessions.data, session),
                }
              : state.sessions,
        }));
      } catch (error) {
        set({ actionError: getErrorMessage(error) });
      } finally {
        set({ stoppingSession: false });
      }
    },

    clearUnread: async () => {
      const sessionId = get().selectedSessionId;
      if (!sessionId) {
        set({ actionError: "请先选择一个会话" });
        return;
      }

      set({ actionError: null, clearingUnread: true });
      try {
        const session = await clearUnread(sessionId);
        set((state) => ({
          sessions:
            state.sessions.type === "ready"
              ? {
                  type: "ready",
                  data: updateSession(state.sessions.data, session),
                }
              : state.sessions,
        }));
      } catch (error) {
        set({ actionError: getErrorMessage(error) });
      } finally {
        set({ clearingUnread: false });
      }
    },

    sendMessage: async () => {
      const sessionId = get().selectedSessionId;
      const content = get().draft.trim();
      if (!sessionId) {
        set({ actionError: "请先选择一个会话" });
        return;
      }
      if (!content) {
        set({ actionError: "请输入消息内容" });
        return;
      }

      set({ actionError: null, sendingMessage: true });
      try {
        await streamMessage(sessionId, content, (event) => {
          const session = toSessionItem(event);
          if (session) {
            set((state) => ({
              sessions:
                state.sessions.type === "ready"
                  ? {
                      type: "ready",
                      data: updateSession(state.sessions.data, session),
                    }
                  : state.sessions,
            }));
          }

          const sessionEvent = toSessionEventItem(event);
          if (!sessionEvent) {
            return;
          }
          set((state) => {
            const currentEvents =
              state.events.type === "ready" ? state.events.data : [];
            return {
              events: {
                type: "ready",
                data: [...currentEvents, sessionEvent],
              },
            };
          });
        });
        set({ draft: "" });
        await Promise.all([
          get().loadSessionDetail(sessionId),
          get().refreshSessions(),
        ]);
      } catch (error) {
        set({ actionError: getErrorMessage(error) });
      } finally {
        set({ sendingMessage: false });
      }
    },
  }),
);

import { requestApi } from "./api";
import type {
  ChatMessage,
  MessageCreateData,
  MessageListData,
  SessionEventItem,
  SessionEventListData,
  SessionItem,
  SessionListData,
  StreamEvent,
} from "../types";
import { readSseStream } from "./sse";

export function fetchSessions(): Promise<SessionItem[]> {
  return requestApi<SessionListData>("/api/sessions").then(
    (data) => data.items,
  );
}

export function createSession(title: string): Promise<SessionItem> {
  return requestApi<SessionItem>("/api/sessions", {
    method: "POST",
    body: JSON.stringify({ title }),
  });
}

export function deleteSession(sessionId: string): Promise<void> {
  return requestApi<void>(`/api/sessions/${sessionId}`, { method: "DELETE" });
}

export function fetchMessages(sessionId: string): Promise<ChatMessage[]> {
  return requestApi<MessageListData>(
    `/api/sessions/${sessionId}/messages`,
  ).then((data) => data.items);
}

export function fetchEvents(sessionId: string): Promise<SessionEventItem[]> {
  return requestApi<SessionEventListData>(
    `/api/sessions/${sessionId}/events`,
  ).then((data) => data.items);
}

export function sendMessage(
  sessionId: string,
  content: string,
): Promise<MessageCreateData> {
  return requestApi<MessageCreateData>(`/api/sessions/${sessionId}/messages`, {
    method: "POST",
    body: JSON.stringify({ content }),
  });
}

export async function streamMessage(
  sessionId: string,
  content: string,
  onEvent: (event: StreamEvent) => void,
) {
  const response = await fetch(`/api/sessions/${sessionId}/messages/stream`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "text/event-stream",
    },
    body: JSON.stringify({ content }),
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  await readSseStream(response, onEvent);
}

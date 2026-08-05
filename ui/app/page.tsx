"use client";

import { useEffect, useState } from "react";

type ApiStatusData = {
  service: string;
  environment: string;
  status: string;
  version: string;
};

type ApiResponse<T> = {
  code: number;
  message: string;
  data: T | null;
};

export default function Home() {
  const [status, setStatus] = useState<{
    type: "ready" | "error";
    data?: ApiStatusData;
    message?: string;
  }>({ type: "ready" });
  useEffect(() => {
    let ignore = false;

    async function loadStatus() {
      try {
        const response = await fetch("/api/status/database");
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        const payload = (await response.json()) as ApiResponse<ApiStatusData>;
        console.log(payload);
        if (!payload.data) {
          throw new Error(payload.message);
        }
        if (!ignore) {
          setStatus({ type: "ready", data: payload.data });
        }
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "unknown error";
        if (!ignore) {
          setStatus({ type: "error", message });
        }
      }
    }

    loadStatus();

    return () => {
      ignore = true;
    };
  }, []);
  return (
    <div>
      <h1>Status</h1>
      <p>{status.type}</p>
      <p>{status.message}</p>
      <p>{status.data?.status}</p>
    </div>
  );
}

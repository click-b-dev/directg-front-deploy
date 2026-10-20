import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { routeTree } from "../routeTree.gen";

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

const root = document.getElementById("root");
if (!root) throw new Error("Root element not found");

async function enableMocking() {
  // 백엔드 API 준비 전 확인용으로 VITE_ENABLE_MOCKS=true일 때만 mock을 켠다(개발 서버 포함, 운영 금지).
  if (import.meta.env.VITE_ENABLE_MOCKS !== "true") return;
  const { worker } = await import("@shared/mocks/browser");
  await worker.start({ onUnhandledRequest: "bypass" });
}

void enableMocking().then(() => {
  createRoot(root).render(
    <StrictMode>
      <RouterProvider router={router} />
    </StrictMode>,
  );
});

import { createFileRoute } from "@tanstack/react-router";

// 이관 대기 스텁 — M1-7에서 pc/_Admin_/main.php를 이관하며 교체한다.
const MainPlaceholder = () => <p>이관 대기: pc/_Admin_/main.php → /main</p>;

export const Route = createFileRoute("/")({
  component: MainPlaceholder,
});

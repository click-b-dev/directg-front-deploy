import { createFileRoute } from "@tanstack/react-router";
import { LoginScreen } from "@/renewal/screens/login";

// Figma 로그인_기본 / 로그인_데이터 입력시 / 로그인_에러 → /renewal/login (레이아웃 없는 독립 화면)
const LoginRoute = () => {
  const { redirect } = Route.useSearch();
  return <LoginScreen redirect={redirect} />;
};

export const Route = createFileRoute("/renewal/login")({
  validateSearch: (search: Record<string, unknown>): { redirect?: string } => ({
    redirect: typeof search.redirect === "string" ? search.redirect : undefined,
  }),
  component: LoginRoute,
});

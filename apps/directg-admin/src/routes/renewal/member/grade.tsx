import { createFileRoute } from "@tanstack/react-router";
import { MemberGradeScreen } from "@/renewal/screens/member-grade";

// Figma 회원_회원등급설정 → /renewal/member/grade
export const Route = createFileRoute("/renewal/member/grade")({
  component: MemberGradeScreen,
});

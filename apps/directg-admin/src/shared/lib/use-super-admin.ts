import { useAuthSession } from "@shared/lib/auth/provider";

// legacy: $_SESSION['admin']['admin_level']=="99" → 슈퍼관리자(등록/삭제 등 관리 액션 노출).
export const useSuperAdmin = (): boolean => {
  const { session } = useAuthSession();
  return session?.user?.role === "99";
};

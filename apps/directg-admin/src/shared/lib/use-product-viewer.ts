import { useAuthSession } from "@shared/lib/auth/provider";

// legacy: $_SESSION['admin']['admin_level']=="1" → $product_viewer=true (상품 열람 전용).
// product_viewer면 각 화면의 변경 액션(삭제/추가/저장/업로드 등) 버튼을 숨긴다.
export const useProductViewer = (): boolean => {
  const { session } = useAuthSession();
  return session?.user?.role === "1";
};

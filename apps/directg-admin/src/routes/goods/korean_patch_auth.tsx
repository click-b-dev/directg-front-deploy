import { createFileRoute } from "@tanstack/react-router";
import { GoodsKoreanPatchAuthScreen } from "@screens/goods-korean-patch-auth";
import type { KoreanPatchAuthSearch } from "@entities/korean-patch";

// legacy pc/_Admin_/goods/korean_patch_auth.php → /goods/korean_patch_auth
const str = (value: unknown) => (typeof value === "string" ? value : "");

const KoreanPatchAuthRoute = () => {
  const search = Route.useSearch();
  return <GoodsKoreanPatchAuthScreen {...search} />;
};

export const Route = createFileRoute("/goods/korean_patch_auth")({
  validateSearch: (search: Record<string, unknown>): KoreanPatchAuthSearch => ({
    search_m_id: str(search.search_m_id),
    search_patch_goods: str(search.search_patch_goods),
    patch_goods: str(search.patch_goods),
    prefix_text: str(search.prefix_text),
    encode_type: str(search.encode_type),
  }),
  component: KoreanPatchAuthRoute,
});

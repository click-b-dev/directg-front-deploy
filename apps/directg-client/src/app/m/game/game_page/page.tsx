import { permanentRedirect } from "next/navigation";

import { getGamePageResolve } from "@entities/game-page/api/resolve-game-page";
import type { GamePageResolve } from "@entities/game-page";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const firstParam = (value: string | string[] | undefined): string =>
  (Array.isArray(value) ? value[0] : value) ?? "";

/** legacy game_type switch → view_url (game_page.html L26~42). */
const buildViewUrl = ({ game_type, goods_sku, title_sku }: GamePageResolve): string => {
  switch (game_type) {
    case "game":
      return `/game/game_view?product_id=${title_sku}&sku=${goods_sku}`;
    case "dlc":
    case "music":
      return `/game/dlc_view?sku=${goods_sku}`;
    case "bundle":
      return `/game/bundle_view?sku=${goods_sku}`;
    case "accessories":
      return `/game/goods_item_view?product_id=${title_sku}&sku=${goods_sku}`;
  }
};

/**
 * 모바일 game_page — product_code로 상세 페이지를 찾아 영구 리다이렉트하는 헬퍼(legacy `mobile/game/game_page.html`).
 * 빈 product_code → "잘못된 접근입니다." 텍스트. 아니면 리졸브 후 view_url로 `permanentRedirect`(308≈legacy 301).
 */
export default async function MobileGamePage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const productCode = firstParam(sp.product_code);

  if (!productCode) {
    return <>잘못된 접근입니다.</>;
  }

  const resolved = await getGamePageResolve(productCode);
  permanentRedirect(buildViewUrl(resolved));
}

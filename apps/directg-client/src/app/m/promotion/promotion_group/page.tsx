import { redirect } from "next/navigation";

/**
 * legacy `mobile/promotion/promotion_group.html`는 최상단에서 `header('Location: https://m.directg.net/')`로
 * **무조건 홈 리다이렉트**(PHP 기본 302 임시)하는 dead 페이지 — 본문(배너 그리드)은 절대 렌더되지 않는다.
 * 관측 동작(홈 리다이렉트)만 재현한다. Next redirect()=307 임시(PC game_package_view의 permanentRedirect=308과 다름).
 */
export default function MobilePromotionGroupPage(): never {
  redirect("/");
}

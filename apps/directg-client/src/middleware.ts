import { NextResponse, type NextRequest } from "next/server";

/**
 * legacy `mobile/index.php`(L15) User-Agent 정규식 포팅 — 모바일 기기 판정.
 * legacy는 이 판정 시 `m.directg.net`으로 301 리다이렉트했으나, 본 앱은 단일 도메인에서
 * `/m/*` 라우트로 내부 rewrite한다(URL은 확장자 없는 정식 경로. 기존 legacy `.html`
 * 유입은 next.config의 redirects가 확장자 없는 URL로 301 보존한다).
 */
const MOBILE_UA =
  /iPhone|iPod|iPad|Android|Windows CE|BlackBerry|Symbian|Windows Phone|webOS|Opera Mni|Opera Mobi|POLARIS|IEMobile|lgtelecom|nokia|SonyEricsson|LG|SAMSUNG|Samsung/i;

/**
 * 모바일 트리(`app/m/*`)로 이관 완료된 경로 allowlist.
 * 이관 진행에 따라 확장한다. 미이관 경로는 모바일 UA라도 PC 화면으로 폴백한다
 * (파일럿 범위 — 전체 모바일 이관 완료 시 legacy `mgate.php` 전면 rewrite로 전환 예정).
 */
const MOBILE_ROUTES = new Set<string>([
  "/",
  "/game/game",
  "/game/game_thumb",
  "/game/game_list",
  "/game/game_page",
  "/game/game_preorder",
  "/game/game_package_view",
  "/game/game_platform_thumb",
  "/game/game_platform_list",
  "/game/game_genre_thumb",
  "/game/game_genre_list",
  "/game/game_search_thumb",
  "/game/game_search_list",
  "/game/game_search",
  "/game/goods_thumb",
  "/game/goods_list",
  "/game/group_thumb",
  "/game/group_list",
  "/game/holomodels_thumb",
  "/game/holomodels_list",
  "/game/publisher_2k",
  "/game/publisher_capcom",
  "/game/publisher_gmode",
  "/game/publisher_marvelous",
  "/game/publisher_neowiz",
  "/game/publisher_paradox",
  "/game/publisher_playstation",
  "/game/publisher_sega",
  "/game/publisher_2k_thumb",
  "/game/publisher_2k_list",
  "/game/publisher_505_games_thumb",
  "/game/publisher_505_games_list",
  "/game/publisher_asw_thumb",
  "/game/publisher_asw_list",
  "/game/publisher_capcom_thumb",
  "/game/publisher_capcom_list",
  "/game/publisher_clouded_leopard_thumb",
  "/game/publisher_clouded_leopard_list",
  "/game/publisher_focus_thumb",
  "/game/publisher_focus_list",
  "/game/publisher_gmode_thumb",
  "/game/publisher_gmode_list",
  "/game/publisher_hooded_horse_thumb",
  "/game/publisher_hooded_horse_list",
  "/game/publisher_marvelous_thumb",
  "/game/publisher_marvelous_list",
  "/game/publisher_neowiz_thumb",
  "/game/publisher_neowiz_list",
  "/game/publisher_paradox_thumb",
  "/game/publisher_paradox_list",
  "/game/publisher_playstation_thumb",
  "/game/publisher_playstation_list",
  "/game/publisher_sega_thumb",
  "/game/publisher_sega_list",
  "/game/publisher_square_enix_thumb",
  "/game/publisher_square_enix_list",
  "/game/publisher_thq_thumb",
  "/game/publisher_thq_list",
  "/game/game_view",
  "/board/notice",
  "/board/notice_view",
  "/board/faq",
  "/board/dataroom",
  "/customer/notice_view",
  "/main/main",
  "/main/index",
  "/game/dlc_view",
  "/game/bundle_view",
  "/game/goods_item_view",
  "/game/holomodels_view",
  "/game/holomodelsdlc_view",
  "/event/event",
  "/event/event_fm26",
  "/event/survey",
  "/promotion/promotion_ing",
  "/promotion/promotion_ing_thumb",
  "/promotion/promotion_ing_list",
  "/service/agreement",
  "/service/private",
  "/service/youthpolicy",
  "/service/refund_policy",
  "/service/service",
  "/service/guide",
  "/service/guide_step1",
  "/service/guide_step2",
  "/service/guide_steam",
  "/service/guide_steam_step1",
  "/service/guide_steam_step2",
  "/service/guide_steam_step3",
  "/service/guide_steam_step4",
  "/service/guide_steam_step5",
  "/service/guide_epic",
  "/service/guide_epic_step1",
  "/service/guide_epic_step2",
  "/service/guide_epic_step3",
  "/service/guide_epic_step4",
  "/service/guide_epic_step5",
  "/service/guide_rockstar",
  "/service/guide_rockstar_step1",
  "/service/guide_rockstar_step2",
  "/service/guide_rockstar_step3",
  "/service/guide_rockstar_step4",
  "/member/login",
  "/member/find_password",
  "/member/user_certification",
  "/member/user_certification_confirm",
  "/member/find_password_reset",
  "/member/find_password_complete",
  "/member/login_fail",
  "/member/join_step1",
  "/member/join_step2",
  "/member/join_step3",
  "/member/join_step4",
  "/mypage/mypage_main",
  "/mypage/member_level_info",
  "/mypage/mypage_point",
  "/mypage/mypage_coupon",
  "/mypage/sns_login_connect",
  "/mypage/mypage_order",
  "/mypage/mypage_cancel_request",
  "/mypage/mypage_cancel_end",
  "/mypage/mypage_order_wating",
  "/mypage/mypage_order_wating_view",
  "/mypage/account_settings",
  "/mypage/mypage_wishlist",
  "/mypage/mypage_qna",
  "/mypage/mypage_supply_content",
  "/mypage/mypage_qna_register",
  "/mypage/mypage_gift",
  "/mypage/mypage_order_view",
  "/promotion/timedeal",
  "/promotion/promotion_group",
  "/promotion/promotion_weekend",
  "/promotion/promotion_season",
  "/order/cart",
  "/order/order",
  "/order/settle",
  "/order/order_end",
  "/order/order_fail",
]);

export function middleware(request: NextRequest) {
  const userAgent = request.headers.get("user-agent") ?? "";
  const isMobile = MOBILE_UA.test(userAgent);
  const { pathname } = request.nextUrl;

  const requestHeaders = new Headers(request.headers);

  if (isMobile && MOBILE_ROUTES.has(pathname)) {
    requestHeaders.set("x-viewport", "mobile");
    const url = request.nextUrl.clone();
    url.pathname = `/m${pathname}`;
    return NextResponse.rewrite(url, { request: { headers: requestHeaders } });
  }

  requestHeaders.set("x-viewport", "desktop");
  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  // 정적 자산·내부 라우트만 제외한다(자산 prefix만 명시적으로 제외).
  // 라우트는 확장자 없는 정식 경로이며, legacy `.html` 유입은 next.config redirects가 처리한다.
  matcher: ["/((?!_next/|api/|assets/|mobile-assets/|favicon).*)"],
};

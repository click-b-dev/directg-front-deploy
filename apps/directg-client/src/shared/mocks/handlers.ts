import { http, HttpResponse } from "msw";

import { promotionGroupsFixture } from "./fixtures/promotion-groups";
import { searchRecommendationsFixture } from "./fixtures/search-recommendations";
import { mainBannersFixture } from "./fixtures/main-banners";
import { noticesFixture } from "./fixtures/notices";
import { mainRecommandsFixture } from "./fixtures/main-recommands";
import { bestTitlesFixture } from "./fixtures/best-titles";
import { newGamesFixture } from "./fixtures/new-games";
import { preorderGamesFixture } from "./fixtures/preorder-games";
import { preorderListFixture } from "./fixtures/preorder-list";
import { gamePackageDetailFixture } from "./fixtures/game-package-detail";
import { spokenKoreanGamesFixture, exclusiveKoreanGamesFixture } from "./fixtures/korean-games";
import { memberAccountsFixture, findAccountByCookie } from "./fixtures/member-accounts";
import { mypageDashboardFixture } from "./fixtures/mypage-dashboard";
import { mypageAccountFixture } from "./fixtures/mypage-account";
import { mypagePointRowsFixture, mypageEmoneyFixture } from "./fixtures/mypage-points";
import { mypageCouponRowsFixture } from "./fixtures/mypage-coupons";
import { boardNoticesFixture } from "./fixtures/board-notices";
import { buildBoardNoticeViewFixture } from "./fixtures/board-notice-view";
import { eventsFixture } from "./fixtures/events";
import { fm26StatusFixture } from "./fixtures/event-fm26";
import { surveyFixture } from "./fixtures/survey";
import { promotionIngFixture } from "./fixtures/promotion-ing";
import { gameCategoryFixture, gameCategoryTagNames } from "./fixtures/game-category";
import {
  gameGenreBestTitlesFixture,
  gameGenreFixture,
  gameGenreNames,
} from "./fixtures/game-genre";
import { gameListFixture } from "./fixtures/game-list";
import { gamePublisherNames } from "./fixtures/game-publisher";
import { gameGroupFixture, gameGroupInfo } from "./fixtures/game-group";
import { gameDetailFixture, gameDetailPlatformNames } from "./fixtures/game-detail";
import { dlcDetailFixture, holomodelsDlcDetailFixture } from "./fixtures/dlc-detail";
import { bundleDetailFixture } from "./fixtures/bundle-detail";
import { goodsItemDetailFixture } from "./fixtures/goods-item-detail";
import { holomodelsDetailFixture } from "./fixtures/holomodels-detail";
import { timedealDetailFixture } from "./fixtures/timedeal-detail";
import {
  promotionTimeDealFixture,
  promotionTimeDealSchedule,
} from "./fixtures/promotion-time-deal";
import {
  mobileTimedealEventFixture,
  mobileTimedealGoodsFixture,
} from "./fixtures/promotion-timedeal";
import { promotionWeekendConfigFixture } from "./fixtures/promotion-weekend";
import { promotionEventsFixture } from "./fixtures/promotion-events";
import { promotionWeekendBestFixture } from "./fixtures/promotion-weekend-best";
import { promotionWeekendRecommandFixture } from "./fixtures/promotion-weekend-recommand";
import { promotionWeekendGamesFixture } from "./fixtures/promotion-weekend-games";
import { promotionSeasonConfigFixture } from "./fixtures/promotion-season";
import {
  seasonRecommandFixture,
  seasonBestFixture,
  seasonMaxDiscountFixture,
  seasonAddRepayFixture,
  seasonPricesFixture,
  seasonGamesFixture,
} from "./fixtures/promotion-season-sections";
import { boardFaqsFixture } from "./fixtures/board-faqs";
import { boardDataroomFixture } from "./fixtures/board-dataroom";
import { mypageQnaFixture } from "./fixtures/mypage-qna";
import { mypageAddressFixture } from "./fixtures/mypage-address";
import { mypageGiftFixture } from "./fixtures/mypage-gift";
import { mypageWishlistFixture } from "./fixtures/mypage-wishlist";
import { mypageOrderViewFixture } from "./fixtures/mypage-order-view";
import { cartFixture } from "./fixtures/cart";
import { orderCheckoutFixture } from "./fixtures/order-checkout";
import { orderCompleteFixture } from "./fixtures/order-complete";
import { settleInitFixture } from "./fixtures/settle-init";
import { mypageOrdersFixture } from "./fixtures/mypage-orders";
import { mypageOrdersWaitingFixture } from "./fixtures/mypage-orders-waiting";
import { mypageCancelRequestsFixture } from "./fixtures/mypage-cancel-requests";
import { mypageRefundsFixture } from "./fixtures/mypage-refunds";
import { mypageCancelEndFixture } from "./fixtures/mypage-cancel-end";
import { mypageCancelViewFixture } from "./fixtures/mypage-cancel-view";
import { mypageRetailOrdersFixture } from "./fixtures/mypage-retail-orders";
import { mypageRetailOrderViewFixture } from "./fixtures/mypage-retail-order-view";
import { mypageRetailRefundsFixture } from "./fixtures/mypage-retail-refunds";
import { mypageSupplyContentFixture } from "./fixtures/mypage-supply-content";
import { mypageSnsLoginFixture } from "./fixtures/mypage-sns-login";

/**
 * 백엔드 부재 구간 mock. origin 와일드카드로 SSR 절대 URL·브라우저 상대 URL 모두 가로챈다.
 * 각 계약은 docs/migration/storefront/ 분석 문서 참조.
 */
export const handlers = [
  // 공통 레이아웃 — header 할인프로모션 드롭다운
  http.get("*/api/promotion/groups", () => HttpResponse.json({ groups: promotionGroupsFixture })),
  // 공통 레이아웃 — header 추천 검색어
  http.get("*/api/search/recommendations", () =>
    HttpResponse.json({ keywords: searchRecommendationsFixture }),
  ),
  // 메인 — 배너
  http.get("*/api/main/banners", () => HttpResponse.json({ banners: mainBannersFixture })),
  // 메인 — 공지 (limit 지원)
  http.get("*/api/main/notices", ({ request }) => {
    const limit = Number(new URL(request.url).searchParams.get("limit") ?? 5);
    return HttpResponse.json({ notices: noticesFixture.slice(0, limit) });
  }),
  // 메인 — 추천·특집
  http.get("*/api/main/recommendations", () =>
    HttpResponse.json({ recommendations: mainRecommandsFixture }),
  ),
  // 메인 — 인기게임 (limit 지원)
  http.get("*/api/main/best-titles", ({ request }) => {
    const limit = Number(new URL(request.url).searchParams.get("limit") ?? 12);
    return HttpResponse.json({ titles: bestTitlesFixture.slice(0, limit) });
  }),
  // 메인 — 신규게임 (limit 지원)
  http.get("*/api/main/new-games", ({ request }) => {
    const limit = Number(new URL(request.url).searchParams.get("limit") ?? 8);
    return HttpResponse.json({ games: newGamesFixture.slice(0, limit) });
  }),
  // 메인 — 예약구매 (limit 지원)
  http.get("*/api/main/preorder-games", ({ request }) => {
    const limit = Number(new URL(request.url).searchParams.get("limit") ?? 30);
    return HttpResponse.json({ games: preorderGamesFixture.slice(0, limit) });
  }),
  // 메인 — 음성 한국어지원 (limit 지원)
  http.get("*/api/main/spoken-korean", ({ request }) => {
    const limit = Number(new URL(request.url).searchParams.get("limit") ?? 5);
    return HttpResponse.json({ games: spokenKoreanGamesFixture.slice(0, limit) });
  }),
  // 메인 — 독점 한국어지원 (limit 지원)
  http.get("*/api/main/exclusive-korean", ({ request }) => {
    const limit = Number(new URL(request.url).searchParams.get("limit") ?? 5);
    return HttpResponse.json({ games: exclusiveKoreanGamesFixture.slice(0, limit) });
  }),
  // 회원 — 이메일/비번 로그인. hCaptcha는 개발 단계 stub(검증 우회). 실제 secret 검증·geoIP·세션 발급은 백엔드.
  // mock 계정(member-accounts) 자격증명 일치 시에만 성공. 성공 시 `dg_member=<m_no>` 쿠키 set.
  http.post("*/api/member/login", async ({ request }) => {
    const body = (await request.json().catch(() => ({}))) as {
      m_id?: string;
      m_pwd?: string;
    };
    const account = memberAccountsFixture.find(
      (a) => a.m_id === body.m_id && a.m_pwd === body.m_pwd,
    );
    if (!account) {
      return HttpResponse.json({ error_code: "1", error_msg: "아이디 또는 비밀번호 오류입니다." });
    }
    return HttpResponse.json(
      { error_code: "0", error_msg: "OK" },
      { headers: { "Set-Cookie": `dg_member=${account.member.m_no}; Path=/; SameSite=Lax` } },
    );
  }),
  // 회원 — SNS 간편로그인 OAuth 인가 URL(공급자별). 실제 state/redirect_uri 구성은 백엔드.
  http.post("*/api/member/sns/:provider/login-url", ({ params }) =>
    HttpResponse.json({ url: `https://directg.net/mock-oauth/${params.provider}` }),
  ),
  // 회원가입 — 아이디 중복확인(legacy join_proc idChk). 개발 편의: "dup@directg.net" → 이미 가입.
  http.post("*/api/member/check-id", async ({ request }) => {
    const body = (await request.json().catch(() => ({}))) as { m_id?: string };
    if (body.m_id === "dup@directg.net") {
      return HttpResponse.json({ error_code: "1", msg: "이미 가입된 아이디입니다" });
    }
    return HttpResponse.json({ error_code: "0", msg: "ok" });
  }),
  // 회원가입 — 가입 처리(legacy join_proc join). hCaptcha·geoIP·회원생성·인증메일은 백엔드. 여기선 성공 stub.
  http.post("*/api/member/join", () =>
    HttpResponse.json({ error_code: "0", msg: "회원가입 성공" }),
  ),
  // 회원 — 비밀번호 찾기 가입여부확인(legacy join_proc findpassword). OTP 저장·메일발송은 백엔드.
  // 개발 편의: "missing@directg.net" → 미가입, 그 외 성공.
  http.post("*/api/member/find-password", async ({ request }) => {
    const body = (await request.json().catch(() => ({}))) as { email?: string };
    if (body.email === "missing@directg.net") {
      return HttpResponse.json({
        error_code: "1",
        msg: "일치하는 회원이 존재하지 않습니다.",
      });
    }
    return HttpResponse.json({
      error_code: "0",
      m_id: body.email ?? "",
      token: "mock-password-token",
      otp: "123456",
      msg: "인증번호가 전송되었습니다.",
    });
  }),
  // 회원 — 인증번호 확인(legacy join_proc authConfirm). tbl_otp token/otp 대조·auth='1' 갱신은 백엔드.
  // 개발 편의: auth_code "123456" → 성공(find-password mock otp와 일치), 그 외 실패(msg 끝에 token 접미 quirk).
  http.post("*/api/member/auth-confirm", async ({ request }) => {
    const body = (await request.json().catch(() => ({}))) as {
      email?: string;
      token?: string;
      auth_code?: string;
    };
    if (body.auth_code === "123456") {
      return HttpResponse.json({
        error_code: "0",
        auth_code: body.auth_code,
        token: body.token ?? "",
        msg: "인증에 성공하였습니다.",
      });
    }
    return HttpResponse.json({
      error_code: "1",
      msg: `인증정보가 일치하지 않습니다.${body.token ?? ""}`,
    });
  }),
  // 회원 — 존재 확인(legacy isMemberChk2, status='0' 활성). 개발 편의: "missing@directg.net" → 미존재.
  http.get("*/api/member/exists", ({ request }) => {
    const mId = new URL(request.url).searchParams.get("m_id") ?? "";
    return HttpResponse.json({ exists: mId !== "" && mId !== "missing@directg.net" });
  }),
  // 회원 — 비밀번호 찾기 OTP 발송(legacy 모바일 directsend authEmail). OTP 생성·메일 발송은 백엔드.
  http.post("*/api/member/otp/send", () =>
    HttpResponse.json({ msg: "인증번호가 발송되었습니다.", token: "mock-password-token" }),
  ),
  // 회원 — 비밀번호 찾기 OTP 검증(legacy 모바일 authConfirm). token·otp 대조는 백엔드.
  // 개발 편의: auth_code "123456" → ok, 그 외 error.
  http.post("*/api/member/otp/verify", async ({ request }) => {
    const body = (await request.json().catch(() => ({}))) as { auth_code?: string };
    if (body.auth_code === "123456") {
      return HttpResponse.json({ code: "ok", message: "인증 성공" });
    }
    return HttpResponse.json({
      code: "error",
      message: "잘못된 인증번호 입니다. 다시 입력해 주세요.",
    });
  }),
  // 회원 — 비밀번호 재설정(legacy 모바일 memberPwdReset). tbl_member.m_pwd 갱신은 백엔드.
  http.post("*/api/member/password/reset", () =>
    HttpResponse.json({ code: "ok", message: "비밀번호 재설정이 완료되었습니다." }),
  ),
  // 회원 — 비밀번호 재설정 진입 가드용 OTP 상태(legacy getOtp 축소). 실제 조회는 백엔드.
  // 개발 편의: "unauth@directg.net" → 미인증(auth "0", 비정상적인 접근), 빈 m_id → row 없음, 그 외 인증완료.
  http.get("*/api/member/otp-status", ({ request }) => {
    const mId = new URL(request.url).searchParams.get("m_id") ?? "";
    if (!mId) return HttpResponse.json({ auth: "", exists: false });
    if (mId === "unauth@directg.net") return HttpResponse.json({ auth: "0", exists: true });
    return HttpResponse.json({ auth: "1", exists: true });
  }),
  // 회원 — 비밀번호 재설정(legacy join_proc resetpassword). tbl_member.m_pwd 갱신은 백엔드.
  http.post("*/api/member/reset-password", async ({ request }) => {
    const body = (await request.json().catch(() => ({}))) as {
      m_pwd?: string;
      m_pwd_re?: string;
    };
    if (body.m_pwd !== body.m_pwd_re) {
      return HttpResponse.json({
        error_code: "1",
        msg: "새 비밀번호와 새 비밀번호 확인이 다릅니다.",
      });
    }
    return HttpResponse.json({ error_code: "0", msg: "비밀번호 변경이 완료되었습니다." });
  }),
  // 회원 — SSR 세션 판독. 쿠키 게이트: `dg_member=<m_no>`로 로그인 계정 판독, 없으면 null. 실제 판독은 백엔드.
  http.get("*/api/member/session", ({ request }) => {
    const account = findAccountByCookie(request.headers.get("cookie") ?? "");
    return HttpResponse.json({ member: account?.member ?? null });
  }),
  // 마이페이지 — 대시보드 집계/목록(legacy mypage_main). 실제 m_no별 조회는 백엔드. 여기선 fixture.
  http.get("*/api/mypage/dashboard", () => HttpResponse.json(mypageDashboardFixture)),
  // 마이페이지 — 계정 정보(legacy getMemberInfo). 실제 조회는 백엔드.
  http.get("*/api/mypage/account", () => HttpResponse.json(mypageAccountFixture)),
  // 마이페이지 — 포인트 내역(legacy getPointList, 페이지네이션). 실제 조회는 백엔드. totalPages는 pagination 확인용.
  http.get("*/api/mypage/points", ({ request }) => {
    const page = Number(new URL(request.url).searchParams.get("page") ?? 1);
    return HttpResponse.json({
      member_emoney: mypageEmoneyFixture,
      list: mypagePointRowsFixture,
      page,
      totalPages: 3,
    });
  }),
  // 마이페이지 — 쿠폰 내역(legacy getCouponList, 페이지네이션). 실제 조회는 백엔드.
  http.get("*/api/mypage/coupons", ({ request }) => {
    const page = Number(new URL(request.url).searchParams.get("page") ?? 1);
    return HttpResponse.json({ list: mypageCouponRowsFixture, page, totalPages: 2 });
  }),
  // 마이페이지 — 쿠폰 등록(legacy mypage_coupon_proc). 실제 검증·지급은 백엔드. mock 성공.
  http.post("*/api/mypage/coupon", () => HttpResponse.json({ result: "성공" })),
  // 이벤트 — 목록(legacy Board::getEvenBoardtList, 리뉴얼 DB tbl_event). 진행중 필터·정렬·Parsedown은 백엔드.
  http.get("*/api/events", () => HttpResponse.json({ list: eventsFixture })),
  // 이벤트 — FM26 상태조회(legacy PurchaseEvent::chkEventOrderGoods_v2/chkEventMemberLog). 하드코딩 m_no는 백엔드 verbatim.
  http.get("*/api/events/fm26/status", () => HttpResponse.json(fm26StatusFixture)),
  // 이벤트 — FM26 응모(legacy event_fm26_ps.php). event_no 38=포인트 지급, 39=구글폼. 대상/중복 확인은 백엔드.
  http.post("*/api/events/fm26/apply", async ({ request }) => {
    const body = (await request.json()) as { event_no: number };
    if (body.event_no === 39) {
      return HttpResponse.json({
        result_code: "request",
        result_url: "https://forms.gle/LbkSuoDVhRyD7XFM7",
      });
    }
    return HttpResponse.json({
      result_code: "success",
      result_msg:
        "포인트 지급이 완료되었습니다. [마이페이지 - 포인트] 메뉴에서 확인하실 수 있습니다",
    });
  }),
  // 이벤트 — 설문 조회(legacy Board::getSurveyInfo/getUserAnswerInfo). 조건판정·미리보기·참여이력은 백엔드.
  http.get("*/api/surveys/:idx", () => HttpResponse.json(surveyFixture)),
  // 이벤트 — 설문 제출(legacy survey_ps.php). 로그인/조건/중복 확인·insert·포인트 지급은 백엔드.
  http.post("*/api/surveys/:idx/answer", () =>
    HttpResponse.json({ result: "success", message: "참여 완료되었습니다. 감사합니다." }),
  ),
  // 프로모션 — 할인진행중 목록(legacy Goods::getGoodsList2 + is_promotion='Y', 60건/page). 필터/정렬은 백엔드(mock은 무시).
  http.get("*/api/promotion/ing", ({ request }) => {
    const page = Number(new URL(request.url).searchParams.get("page") ?? 1);
    return HttpResponse.json({
      list: promotionIngFixture,
      page,
      totalPages: 1,
      total: promotionIngFixture.length,
    });
  }),
  // 프로모션 — 주말특가 설정(legacy Promotion::getPromotionWeekend). 기간/IP 접근제한은 백엔드(mock은 isActive=true).
  http.get("*/api/promotion/weekend/config", () =>
    HttpResponse.json(promotionWeekendConfigFixture),
  ),
  // 프로모션 — 시즌 설정(legacy Promotion::getPromotionSeason). 기간/IP 접근제한은 백엔드(mock은 isActive=true).
  http.get("*/api/promotion/season/config", () => HttpResponse.json(promotionSeasonConfigFixture)),
  // 프로모션 — 시즌 섹션(legacy promotion_season_recommand/best/max_discount/add_repay/price/game2 파생). 파생·필터는 백엔드.
  http.get("*/api/promotion/season/recommand", () =>
    HttpResponse.json({ list: seasonRecommandFixture }),
  ),
  http.get("*/api/promotion/season/best", () => HttpResponse.json(seasonBestFixture)),
  http.get("*/api/promotion/season/max-discount", () =>
    HttpResponse.json(seasonMaxDiscountFixture),
  ),
  http.get("*/api/promotion/season/add-repay", () => HttpResponse.json(seasonAddRepayFixture)),
  http.get("*/api/promotion/season/prices", () => HttpResponse.json(seasonPricesFixture)),
  http.get("*/api/promotion/season/games", () => HttpResponse.json({ list: seasonGamesFixture })),
  // 프로모션 — 진행중 이벤트(legacy Promotion::getPromotionEventList, show_promotion='Y'). 필터·정렬·Parsedown은 백엔드.
  http.get("*/api/promotion/events", () => HttpResponse.json({ list: promotionEventsFixture })),
  // 프로모션 — 주말특가 인기게임(legacy promotion_week_best 파생). top4=thumbList/나머지=gridList. 파생은 백엔드.
  http.get("*/api/promotion/weekend/best", () => HttpResponse.json(promotionWeekendBestFixture)),
  // 프로모션 — 주말특가 DG 추천게임(legacy promotion_week_recommand 파생). 4열 커스텀 카드. 파생은 백엔드.
  http.get("*/api/promotion/weekend/recommand", () =>
    HttpResponse.json({ list: promotionWeekendRecommandFixture }),
  ),
  // 프로모션 — 주말특가 게임 목록(legacy getPromotionIng 주말특가 기간, game+basic, release desc, 30개). 필터는 백엔드.
  http.get("*/api/promotion/weekend/games", () =>
    HttpResponse.json({ list: promotionWeekendGamesFixture }),
  ),
  // 게임 — 카테고리별 목록(legacy Goods::getGoodsList2 + category_code, getTagName). 필터/정렬은 백엔드(mock은 무시).
  http.get("*/api/game/category", ({ request }) => {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get("page") ?? 1);
    const categoryCode = url.searchParams.get("category_code") ?? "C0001001";
    return HttpResponse.json({
      list: gameCategoryFixture,
      page,
      totalPages: 1,
      total: gameCategoryFixture.length,
      tagName: gameCategoryTagNames[categoryCode] ?? "카테고리",
    });
  }),
  // 게임 — 장르별 목록(legacy Goods::getGoodsList2 + genre_code FULLTEXT, getPrimaryGenreName, getGenreBestTitle). 필터/정렬은 백엔드.
  http.get("*/api/game/genre", ({ request }) => {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get("page") ?? 1);
    const genreCode = url.searchParams.get("genre_code") ?? "G0001";
    return HttpResponse.json({
      list: gameGenreFixture,
      page,
      totalPages: 1,
      total: gameGenreFixture.length,
      genreName: gameGenreNames[genreCode] ?? "장르",
      bestTitles: gameGenreBestTitlesFixture,
    });
  }),
  // 게임 — 전체 목록(legacy Goods::getGoodsList2, category/genre/q 없음). 필터/정렬은 백엔드(mock은 무시).
  http.get("*/api/game/list", ({ request }) => {
    const page = Number(new URL(request.url).searchParams.get("page") ?? 1);
    return HttpResponse.json({
      list: gameListFixture,
      page,
      totalPages: 1,
      total: gameListFixture.length,
    });
  }),
  // 게임 — game_page 리졸브(legacy getGoodsItemDetail + getGoodsOptionTitleInfo). product_code → game_type/goods_sku/title_sku.
  // mock: game 타입으로 고정 응답(백엔드가 실제 판정). 빈 product_code는 route에서 사전 차단.
  http.get("*/api/game/page-resolve", ({ request }) => {
    const productCode = new URL(request.url).searchParams.get("product_code") ?? "";
    return HttpResponse.json({
      game_type: "game",
      goods_sku: `${productCode}-001`,
      title_sku: productCode,
    });
  }),
  // 게임 — 퍼블리셔 랜딩(legacy publisher_<brand>.html: getPublisherGoodsSearch). supplier_code+필터+sort는 백엔드(mock 무시).
  http.get("*/api/game/publisher-landing", ({ request }) => {
    const page = Number(new URL(request.url).searchParams.get("page") ?? 1);
    return HttpResponse.json({
      list: gameListFixture,
      page,
      totalPages: 1,
      total: gameListFixture.length,
    });
  }),
  // 게임 — 패키지 옵션 상세(legacy game_package_view.html: getGoodsItemDetailSku + getTitleDetail + description + package info).
  http.get("*/api/game/package-detail", () => {
    return HttpResponse.json(gamePackageDetailFixture);
  }),
  // 게임 — 통합검색(legacy getGoodsSearch/getGoodsPromotionSearch, MATCH BOOLEAN). 검색/정렬/필터는 백엔드(mock은 무시).
  http.get("*/api/game/search", ({ request }) => {
    const page = Number(new URL(request.url).searchParams.get("page") ?? 1);
    return HttpResponse.json({
      list: gameListFixture,
      page,
      totalPages: 1,
      total: gameListFixture.length,
    });
  }),
  // 게임 — 예약구매 목록(legacy Goods::getGoodsOptionPreOrderM, release_date>오늘). 타이틀 단위 + 옵션 병합.
  http.get("*/api/game/preorder", ({ request }) => {
    const page = Number(new URL(request.url).searchParams.get("page") ?? 1);
    return HttpResponse.json({
      list: preorderListFixture,
      page,
      totalPages: 1,
      total: preorderListFixture.length,
    });
  }),
  // 게임 — 퍼블리셔별 목록(legacy Goods::getGoodsList2 + supplier_code, getPublisher). 필터/정렬은 백엔드.
  http.get("*/api/game/publisher", ({ request }) => {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get("page") ?? 1);
    const publisherCode = url.searchParams.get("publisher_code") ?? "";
    return HttpResponse.json({
      list: gameListFixture,
      page,
      totalPages: 1,
      total: gameListFixture.length,
      publisherName: gamePublisherNames[publisherCode] ?? "퍼블리셔",
    });
  }),
  // 게임 — 번들/그룹 목록(legacy tbl_group + getGoodsGroupList). 접근 판정(use_flag/기간/관리자세션)은 백엔드.
  // mock: idx 있으면 access=ok, 없으면 invalid(legacy: idx 없음 → 잘못된 접근 redirect).
  http.get("*/api/game/group", ({ request }) => {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get("page") ?? 1);
    const idx = url.searchParams.get("idx") ?? "";
    if (!idx) {
      return HttpResponse.json({
        access: "invalid",
        subject: "",
        banner: "",
        bannerDomain: "",
        list: [],
        page,
        totalPages: 0,
        total: 0,
      });
    }
    return HttpResponse.json({
      access: "ok",
      subject: gameGroupInfo.subject,
      banner: gameGroupInfo.banner,
      bannerDomain: gameGroupInfo.bannerDomain,
      list: gameGroupFixture,
      page,
      totalPages: 1,
      total: gameGroupFixture.length,
    });
  }),
  // 게임 — 상세(legacy pc/game/game_view.html — Goods/Promotion/Mypage2 조립, setTitleHit 부수효과).
  // platform 빈 값이면 타이틀 첫 플랫폼으로 고정. is_login/wishlist_chk는 세션(쿠키) 판정 — mock은 비로그인.
  http.get("*/api/game/detail", ({ request }) => {
    const platformParam = new URL(request.url).searchParams.get("platform") ?? "";
    const platform = platformParam || gameDetailFixture.platform;
    return HttpResponse.json({
      ...gameDetailFixture,
      platform,
      platform_name: gameDetailPlatformNames[platform] ?? "",
    });
  }),
  // 게임 — 홀로모델 상세(legacy pc/game/holomodels_view.html). game-detail 동형(holomodels 옵션).
  http.get("*/api/game/holomodels-detail", () => HttpResponse.json(holomodelsDetailFixture)),
  // 게임 — DLC 상세(legacy pc/game/dlc_view.html). 단일 옵션(sku), wishlist_chk는 세션(쿠키) — mock 비로그인.
  http.get("*/api/game/dlc-detail", () => HttpResponse.json(dlcDetailFixture)),
  // 게임 — 홀로모델 DLC 상세(legacy pc/game/holomodelsdlc_view.html). 데이터 계약은 dlc-detail 동형.
  http.get("*/api/game/holomodelsdlc-detail", () => HttpResponse.json(holomodelsDlcDetailFixture)),
  // 게임 — 번들 상세(legacy pc/game/bundle_view.html). package steam JSON 해소는 백엔드.
  http.get("*/api/game/bundle-detail", () => HttpResponse.json(bundleDetailFixture)),
  // 게임 — 액세서리/실물 상품 상세(legacy pc/game/goods_item_view.html). attribute/steam JSON은 백엔드.
  http.get("*/api/game/goods-item-detail", () => HttpResponse.json(goodsItemDetailFixture)),
  // 게임 — 타임딜 상세(legacy pc/game/timedeal_view.html). 타임딜가/스팀정보는 백엔드.
  http.get("*/api/game/timedeal-detail", () => HttpResponse.json(timedealDetailFixture)),
  // 프로모션 — 타임딜 랜딩(legacy pc/promotion/time_deal.html, product_code 하드코딩). is_view/스케줄은 백엔드.
  http.get("*/api/promotion/time-deal", () =>
    HttpResponse.json({
      ...promotionTimeDealFixture,
      timedeal: {
        ...promotionTimeDealSchedule,
        // 카운트다운 표시용: now + 8시간(unix seconds).
        timedeal_end: Math.floor(Date.now() / 1000) + 8 * 60 * 60,
      },
    }),
  ),
  // 모바일 타임딜(legacy mobile timedeal.html, DGKR tbl_event timedeal='Y'). end_dt는 now+8h로 주입.
  http.get("*/api/promotion/timedeal", () => {
    const end = new Date(Date.now() + 8 * 60 * 60 * 1000);
    const p = (n: number) => String(n).padStart(2, "0");
    const endDt = `${end.getFullYear()}-${p(end.getMonth() + 1)}-${p(end.getDate())} ${p(end.getHours())}:${p(end.getMinutes())}:${p(end.getSeconds())}`;
    return HttpResponse.json({
      active: true,
      event: { ...mobileTimedealEventFixture, end_dt: endDt },
      goods: mobileTimedealGoodsFixture,
    });
  }),
  // 게시판 — 공지사항 목록(legacy Board::getNoticeList, 20건/page, 제목검색). 필터·정렬·페이징은 백엔드.
  http.get("*/api/board/notices", ({ request }) => {
    const page = Number(new URL(request.url).searchParams.get("page") ?? 1);
    return HttpResponse.json({ list: boardNoticesFixture, page, totalPages: 2 });
  }),
  // 게시판 — 공지사항 상세(legacy Board::getNoticeView). 조회 시 hit++·마크다운 렌더는 백엔드.
  http.get("*/api/board/notices/:idx", ({ params }) => {
    const idx = Number(params.idx);
    return HttpResponse.json(buildBoardNoticeViewFixture(idx));
  }),
  // 게시판 — FAQ 목록(legacy Board::getFaqList, faq_type asc, 20건/page, 질문검색). 검색·정렬·마크다운은 백엔드.
  http.get("*/api/board/faqs", ({ request }) => {
    const page = Number(new URL(request.url).searchParams.get("page") ?? 1);
    return HttpResponse.json({ list: boardFaqsFixture, page, totalPages: 1 });
  }),
  // 게시판 — 자료실 목록(legacy Dataroom::getDataroomList, is_free/is_view, reg_date DESC). 정렬·필터는 백엔드.
  http.get("*/api/board/dataroom", () => HttpResponse.json({ list: boardDataroomFixture })),
  // 게시판 — 자료실 다운로드(legacy dataroom_ps.php). 로그인 필수, 성공 시 file_url + 다운로드 로그(백엔드).
  http.post("*/api/board/dataroom/download", async ({ request }) => {
    const account = findAccountByCookie(request.headers.get("cookie") ?? "");
    const body = (await request.json()) as { idx: number; file_url: string };
    if (!account) {
      return HttpResponse.json({ status: "error", error_msg: "로그인 이후에 이용가능합니다." });
    }
    return HttpResponse.json({ status: "success", m_id: account.m_id, file_url: body.file_url });
  }),
  // 마이페이지 — 문의 내역(legacy Mypage::getqnaList, reg_date DESC, 20건/page). 세션·정렬·마크다운은 백엔드.
  http.get("*/api/mypage/qna", ({ request }) => {
    const page = Number(new URL(request.url).searchParams.get("page") ?? 1);
    return HttpResponse.json({ list: mypageQnaFixture, page, totalPages: 1 });
  }),
  // 마이페이지 — 답변 조회 로그(legacy mode=view → replyStatus=1). fire-and-forget.
  http.post("*/api/mypage/qna/view", () => HttpResponse.json({ result: "ok" })),
  // 마이페이지 — 문의 등록(legacy mode=register, multipart). 저장·첨부검증·gubun5 메일은 백엔드. mock 성공.
  http.post("*/api/mypage/qna", () =>
    HttpResponse.json({ error_code: "OK", error_msg: "성공적으로 등록되었습니다." }),
  ),
  // 마이페이지 — 배송지 조회(legacy getMemberAddress). 실제 조회는 백엔드.
  http.get("*/api/mypage/address", () => HttpResponse.json(mypageAddressFixture)),
  // 마이페이지 — 배송지 저장(legacy address_proc setaddress, upsert). 세션 만료 시 NG.
  http.post("*/api/mypage/address", ({ request }) => {
    const account = findAccountByCookie(request.headers.get("cookie") ?? "");
    if (!account) {
      return HttpResponse.json({ error_code: "NG", error_msg: "세션이 만료되었습니다." });
    }
    return HttpResponse.json({ error_code: "OK", error_msg: "주소를 수정했습니다." });
  }),
  // 마이페이지 — 사은품 내역(legacy Mypage::getGiftList, dgkr DB). 실제 조회는 백엔드.
  http.get("*/api/mypage/gift", () => HttpResponse.json({ list: mypageGiftFixture })),
  // 마이페이지 — 사은품 신청(legacy gift_proc, is_delivery 분기). 키예약·캐시·메일은 백엔드.
  http.post("*/api/mypage/gift/claim", async ({ request }) => {
    const body = (await request.json()) as { is_delivery?: string };
    const msg =
      body.is_delivery === "Y"
        ? "사은품 발송신청이 완료되었습니다."
        : "사은품 지급이 완료되었습니다.";
    return HttpResponse.json({ msg });
  }),
  // 마이페이지 — 사은품 제품키 조회(legacy licence_activate getGiftView). 실제 키는 백엔드 Asset.
  http.post("*/api/mypage/gift/licence", () =>
    HttpResponse.json({
      error_code: "0",
      error_msg: "<div class='p-3'>제품 코드(키): <strong>MOCK-GIFT-KEY-1234-5678</strong></div>",
    }),
  ),
  // 마이페이지 — 주문 상세(legacy Mypage::getOrderV2/getOrderItemV2 + PG bill URL). 실제 조회는 백엔드.
  http.get("*/api/mypage/orders/view", () => HttpResponse.json(mypageOrderViewFixture)),
  // 마이페이지 — 제품키 확인(legacy licence_activate getXxxLicence). 실제 키는 백엔드 order_system.
  http.post("*/api/mypage/orders/licence", () =>
    HttpResponse.json({
      html: "<div class='p-3 text-dark'>제품 코드(키): <strong>MOCK-ORDER-KEY-1234-5678</strong></div>",
    }),
  ),
  // 마이페이지 — 제품키 활성화(legacy licence_activate setXxxActivate). error_code 99=실패.
  http.post("*/api/mypage/orders/activate", () =>
    HttpResponse.json({ error_code: "OK", error_msg: "제품 코드(키)가 활성화되었습니다." }),
  ),
  // 마이페이지 — 주문취소요청(legacy order_cancel_proc). PG취소·환불은 후속 운영.
  http.post("*/api/mypage/orders/cancel", () =>
    HttpResponse.json({ error_code: "OK", error_msg: "취소 요청이 접수되었습니다." }),
  ),
  // 마이페이지 — 위시리스트(legacy Mypage2::getWishlist + enrich). 프로모션가·title_sku는 백엔드.
  http.get("*/api/mypage/wishlist", ({ request }) => {
    const page = Number(new URL(request.url).searchParams.get("page") ?? 1);
    return HttpResponse.json({ list: mypageWishlistFixture, page, totalPages: 1 });
  }),
  // 마이페이지 — 위시리스트 액션(legacy wishlist_proc delete/select_delete/cart_move). 실제 처리는 백엔드.
  http.post("*/api/mypage/wishlist", async ({ request }) => {
    const body = (await request.json()) as { mode?: string };
    const msg = body.mode === "cart_move" ? "이동되었습니다." : "삭제 완료";
    return HttpResponse.json({ error_code: "OK", error_msg: msg });
  }),
  // 주문 — 장바구니 목록(legacy Order::getCartList + 프로모션/title_sku enrich). 세션 m_no·enrich는 백엔드.
  http.get("*/api/order/cart", () => HttpResponse.json({ list: cartFixture })),
  // 주문 — 장바구니 액션(legacy cart_proc: cart_item_select/deselect·del_cart·select_del_cart). 실제 처리는 백엔드.
  http.post("*/api/order/cart", async () =>
    HttpResponse.json({ error_code: "OK", error_msg: "OK" }),
  ),
  // 주문 — 주문서 데이터(legacy getOrderItemList(선택) + getMemberEmoney(dgkr) + getMemberAddress). enrich·세션은 백엔드.
  http.get("*/api/order/checkout", () => HttpResponse.json(orderCheckoutFixture)),
  // 주문 — 주문완료(legacy getOrder+getOrderItem+getGoodsItemDetail, kcp면 getKcpLog). 세션 소유검증은 백엔드.
  http.get("*/api/order/complete", () => HttpResponse.json(orderCompleteFixture)),
  // 주문 — 결제하기 초기 데이터(legacy getSettleNo+getOrderItemList+emoney). 세션·시퀀스는 백엔드.
  http.get("*/api/order/settle-init", () => HttpResponse.json(settleInitFixture)),
  // 주문 — KCP 예약(legacy kcp_reserve.php). mock은 일반결제(code 0)로 응답(가상계좌=1/NG/NG_POINT는 백엔드).
  http.post("*/api/order/kcp/reserve", () => HttpResponse.json({ code: "0" })),
  // 주문 — 0원 전액할인(legacy order_full_discount.php). order_end로 이동 URL 반환.
  http.post("*/api/order/full-discount", () =>
    HttpResponse.json({ url: "/order/order_end?settle_no=DGMOCK" }),
  ),
  // 마이페이지 — 주문완료 내역(legacy Mypage2::getOrderList_v2 + Goods/Order enrich). 기간계산·where 3분기·enrich는 백엔드.
  http.get("*/api/mypage/orders", ({ request }) => {
    const params = new URL(request.url).searchParams;
    const page = Number(params.get("page") ?? 1);
    const keyword = params.get("search_product_name") ?? "";
    const list = keyword
      ? mypageOrdersFixture.filter((item) => item.product_name.includes(keyword))
      : mypageOrdersFixture;
    return HttpResponse.json({ list, page, totalPages: 1 });
  }),
  // 마이페이지 — 입금대기 내역(legacy Mypage2::getOrderList_vbank + settle_no 그룹핑). provider 해석·va_date 정규화·deposit_status는 백엔드.
  http.get("*/api/mypage/orders/waiting", ({ request }) => {
    const params = new URL(request.url).searchParams;
    const page = Number(params.get("page") ?? 1);
    const keyword = params.get("search_product_name") ?? "";
    const list = keyword
      ? mypageOrdersWaitingFixture.filter((order) =>
          order.items.some((item) => item.product_name.includes(keyword)),
        )
      : mypageOrdersWaitingFixture;
    return HttpResponse.json({ list, page, totalPages: 1 });
  }),
  // 마이페이지 — 취소요청 내역(legacy Mypage2::getOrderList_v2 status 7·8). 기간·shipment enrich는 백엔드.
  http.get("*/api/mypage/orders/cancel-requests", ({ request }) => {
    const page = Number(new URL(request.url).searchParams.get("page") ?? 1);
    return HttpResponse.json({ list: mypageCancelRequestsFixture, page, totalPages: 1 });
  }),
  // 마이페이지 — 취소요청 철회(legacy mypage_proc requestReturn). 실제 status 8→2 UPDATE·로그는 백엔드.
  http.post("*/api/mypage/orders/request-return", async ({ request }) => {
    const body = (await request.json()) as { settle_no?: string; ordno?: string };
    return HttpResponse.json({
      success: true,
      message: `취소 요청이 철회되었습니다. (${body.ordno ?? ""})`,
    });
  }),
  // 마이페이지 — 실물 상품 주문 내역(legacy Mypage::getRetailOrderList, **별도 DGKR DB** retail_order). 기간은 백엔드.
  http.get("*/api/mypage/retail-orders", ({ request }) => {
    const page = Number(new URL(request.url).searchParams.get("page") ?? 1);
    return HttpResponse.json({ list: mypageRetailOrdersFixture, page, totalPages: 1 });
  }),
  // 마이페이지 — 실물주문 상세(legacy Mypage::getRetailOrder + PG 로그). ⚠️ 백엔드 m_no=1023882 하드코딩(legacy verbatim).
  http.get("*/api/mypage/retail-orders/view", () =>
    HttpResponse.json(mypageRetailOrderViewFixture),
  ),
  // 마이페이지 — 실물 상품 취소 내역(legacy Mypage::getRetailOrderList, **별도 DGKR DB** retail_order, step IN 8·9·11·12·13·14). 기간·step 필터는 백엔드.
  http.get("*/api/mypage/retail-refunds", ({ request }) => {
    const page = Number(new URL(request.url).searchParams.get("page") ?? 1);
    return HttpResponse.json({ list: mypageRetailRefundsFixture, page, totalPages: 1 });
  }),
  // 마이페이지 — 취소완료 상세(legacy Mypage::getOrderV2/getOrderItemV2 + getOrderAddress, 리뉴얼 DB). m_no 소유확인은 백엔드.
  http.get("*/api/mypage/orders/cancel-view", () => HttpResponse.json(mypageCancelViewFixture)),
  // 마이페이지 — 취소완료 내역(legacy Mypage2::getOrderList_v2 status 9, 날짜/상품명 필터 없음). shipment enrich는 백엔드.
  http.get("*/api/mypage/orders/cancel-end", ({ request }) => {
    const page = Number(new URL(request.url).searchParams.get("page") ?? 1);
    return HttpResponse.json({ list: mypageCancelEndFixture, page, totalPages: 1 });
  }),
  // 마이페이지 — 환불(취소) 내역(legacy Mypage::getOrderList, **별도 DGKR DB** step 8·9·99). 기간·item_name 집계는 백엔드.
  http.get("*/api/mypage/refunds", ({ request }) => {
    const page = Number(new URL(request.url).searchParams.get("page") ?? 1);
    return HttpResponse.json({ list: mypageRefundsFixture, page, totalPages: 1 });
  }),
  // 마이페이지 — 제공콘텐츠(legacy sp_supply_* merge/dedup + patchEncDataMember). 프로시저·인코딩은 백엔드.
  http.get("*/api/mypage/supply-content", () =>
    HttpResponse.json({ list: mypageSupplyContentFixture }),
  ),
  // 마이페이지 — 제공콘텐츠 다운로드 로그(legacy mypage_supply_content_log). fire-and-forget.
  http.post("*/api/mypage/supply-content/log", () => HttpResponse.json({ result: "ok" })),
  // 마이페이지 — 간편로그인 연결정보(legacy Member::getMemberSnsLogin). 실제 조회는 세션 m_no 기준 백엔드.
  http.get("*/api/mypage/sns-login", () => HttpResponse.json({ list: mypageSnsLoginFixture })),
  // 마이페이지 — 간편로그인 계정연결 OAuth URL. 실제 state/redirect_uri 구성은 백엔드.
  http.post("*/api/mypage/sns/:provider/connect-url", ({ params }) =>
    HttpResponse.json({ url: `https://directg.net/mock-oauth/connect/${params.provider}` }),
  ),
  // 마이페이지 — PAYCO 연결해제. legacy raw "0" 성공을 JSON으로 감싼 mock.
  http.post("*/api/mypage/sns/payco/disconnect", () => HttpResponse.json({ result: "0" })),
  // 마이페이지 — KAKAO/NAVER 연결해제. legacy JSON {code,msg}.
  http.post("*/api/mypage/sns/:provider/disconnect", ({ params }) =>
    HttpResponse.json({
      code: "0",
      msg: `${String(params.provider).toUpperCase()} 연결해제 되었습니다.`,
    }),
  ),
  // 마이페이지 — 계정 뮤테이션(legacy account_proc). error_msg 문구는 백엔드 정의, 여기선 placeholder.
  http.post("*/api/mypage/account/mailling", () =>
    HttpResponse.json({ error_msg: "메일수신 설정이 변경되었습니다." }),
  ),
  http.post("*/api/mypage/account/email", () =>
    HttpResponse.json({ error_msg: "수신 메일주소가 변경되었습니다." }),
  ),
  http.post("*/api/mypage/account/password", () =>
    HttpResponse.json({ error_msg: "비밀번호가 변경되었습니다." }),
  ),
  http.post("*/api/mypage/account/leave", () => HttpResponse.json({ error_msg: "" })),
  // 마이페이지 — KCP 본인인증 거래등록(legacy cert_reg.php). 실제 KCP 연동은 백엔드+외부. mock call_url.
  http.post("*/api/mypage/cert-reg", () =>
    HttpResponse.json({
      res_cd: "0000",
      res_msg: "",
      call_url: "https://directg.net/mock-kcp-cert",
      reg_cert_key: "mockregkey123",
    }),
  ),
  // 회원가입 — 이메일 인증 랜딩(legacy join_confirm). 실제 auth_key 검증·approvalMember은 백엔드.
  // 개발 편의: m_no·auth_key·m_id 모두 있으면 승인 성공, 아니면 실패.
  http.post("*/api/member/join-confirm", async ({ request }) => {
    const body = (await request.json().catch(() => ({}))) as {
      m_no?: string;
      auth_key?: string;
      m_id?: string;
    };
    if (body.m_no && body.auth_key && body.m_id) {
      return HttpResponse.json({ error_code: "0", msg: "가입승인이 완료되었습니다." });
    }
    return HttpResponse.json({ error_code: "1", msg: "잘못된 페이지 접근입니다." });
  }),
];

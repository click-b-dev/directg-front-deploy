import type { PromotionGroup } from "@entities/promotion-group";
import type { SearchRecommendation } from "@entities/search-recommendation";
import type { MemberSession } from "@entities/member-auth";

interface SiteHeaderProps {
  promotionGroups: PromotionGroup[];
  searchRecommendations: SearchRecommendation[];
  /** 검색 결과 페이지에서 주입되는 현재 검색어. 공통 레이아웃 기본값은 빈 문자열. */
  q?: string;
  /** 로그인 세션(legacy `$_SESSION['member']`). null이면 비로그인 헤더. */
  member?: MemberSession | null;
}

/** 기획 고정 배너 노출 구간 (legacy 하드코딩: 2026-06-25 16:00 ~ 2026-07-09 16:00). */
const isSeasonBannerOpen = (now: Date) =>
  now >= new Date("2026-06-25T16:00:00") && now < new Date("2026-07-09T16:00:00");

/**
 * 스토어프론트 공통 헤더. legacy `pc/inc/header.html`.
 * 로그인/비로그인 분기는 인증 방식 미정으로 비로그인 UI 고정(보류) — 첫 인증 단위에서 연결.
 */
export function SiteHeader({
  promotionGroups,
  searchRecommendations,
  q = "",
  member = null,
}: SiteHeaderProps) {
  const showSeasonBanner = isSeasonBannerOpen(new Date());

  return (
    <>
      {/* 기획 고정 배너 */}
      {showSeasonBanner && (
        <div
          className="container-fluid p-0 d-flex justify-content-center"
          style={{ maxWidth: "100%", height: "60px", overflow: "hidden" }}
        >
          <a href="/promotion/promotion_season">
            <img
              src="https://image.directg.net/f8a5Yy5qu0"
              className="d-block"
              alt="다이렉트 게임즈 2026 여름 프로모션"
            />
          </a>
        </div>
      )}

      <header className="text-header">
        <div className="container">
          <div className="row align-items-center p-2">
            <div className="col-2">
              <a href="/index.php" className="brand-wrap">
                <img src="/assets/images/logo/H2_DG_logo_160x45_v2.png" alt="" />
              </a>
            </div>
            <div className="col-6" itemScope itemType="https://schema.org/WebSite">
              <form
                id="searchFrm"
                name="searchFrm"
                action="/game/game_search_thumb"
                method="GET"
                className="search-header mb-0 "
                itemProp="potentialAction"
                itemScope
                itemType="https://schema.org/SearchAction"
              >
                <link itemProp="url" href="https://directg.net/" />
                <meta
                  itemProp="target"
                  content="https://directg.net/game/game_search_thumb?q={q}"
                />
                <div className="input-group border-searchinput rounded-pill">
                  <input
                    type="text"
                    className="form-control form-control-lg border-0 rounded-pill shadow-none bg-none"
                    id="q"
                    name="q"
                    defaultValue={q}
                    placeholder="게임명 검색"
                    minLength={2}
                    required
                    itemProp="query-input"
                  />
                  {q && (
                    <button
                      className="btn btn-white border-0 fs-4"
                      type="button"
                      id="btn_search_reset"
                    >
                      <i className="fa-regular fa-circle-xmark"></i>
                    </button>
                  )}
                  <div className="input-group-append">
                    <button className="btn btn-lg shadow-none" type="submit">
                      <i className="fa fa-search"></i>
                    </button>
                  </div>
                </div>
              </form>
              <div className="mt-2 font-14">
                <div className="ps-2 py-2">
                  <strong className="font-12" style={{ color: "#CED4DA" }}>
                    추천 검색어:{" "}
                  </strong>
                  {searchRecommendations.map((sr) => (
                    <a
                      key={sr.idx}
                      href={`/game/search_recommand_click.php?idx=${sr.idx}`}
                      className="font-12 mx-1 text-info text-decoration-underline"
                      title={sr.keyword}
                    >
                      {sr.keyword}
                    </a>
                  ))}
                </div>
              </div>
            </div>
            <div className="col-4">
              <div className="d-flex flex-row justify-content-end font-14">
                {/* legacy header.html 65~71: 세션에 따라 로그아웃/마이페이지 ↔ 로그인/회원가입 */}
                {member ? (
                  <>
                    <div className="px-2">
                      <a
                        href="/member/logout"
                        className="text-body-secondary link-underline link-underline-opacity-0 d-inline-flex align-items-center"
                      >
                        <img src="/assets/images/icon/logout-icon.svg" className="me-2" /> 로그아웃
                      </a>
                    </div>
                    <div className="px-2">
                      <a
                        href="/mypage/mypage_main"
                        className="text-body-secondary link-underline link-underline-opacity-0"
                      >
                        <i className="fa-solid fa-user me-2"></i>마이페이지
                      </a>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="px-2">
                      <a
                        href="/member/login"
                        className="text-body-secondary link-underline link-underline-opacity-0 d-inline-flex align-items-center"
                      >
                        <img src="/assets/images/icon/login-icon.svg" className="me-2" />
                        로그인
                      </a>
                    </div>
                    <div className="px-2">
                      <a
                        href="/member/join_step1"
                        className="text-body-secondary link-underline link-underline-opacity-0"
                      >
                        <i className="fa-solid fa-user-plus me-2"></i>회원가입
                      </a>
                    </div>
                  </>
                )}
                <div className="px-2">
                  <a
                    href="/mypage/mypage_wishlist"
                    className="text-danger link-underline link-underline-opacity-0"
                  >
                    <i className="fa-solid fa-heart me-2"></i>위시리스트
                  </a>
                </div>
                <div className="px-2">
                  <a
                    href="/order/cart"
                    className="text-info link-underline link-underline-opacity-0 d-inline-flex align-items-center"
                  >
                    <img src="/assets/images/icon/basket-icon.svg" className="me-2" />
                    장바구니
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
        <nav className="border-nav">
          <div className="container">
            <ul
              className="nav d-flex flex-wrap justify-content-between align-items-center"
              id="top_bar"
            >
              <li className="nav-item text-center col-2 border-top-0 border-bottom-0 border-start-0 border-end py-2">
                <a
                  href="/service/service"
                  className="btn btn-link fw-600 font-16 text-decoration-none w-100"
                >
                  서비스소개
                </a>
              </li>
              <li className="nav-item text-center col-2 border-top-0 border-bottom-0 border-start-0 border-end py-2">
                <div className="dropdown">
                  <button
                    className="btn btn-link fw-600 font-16 text-decoration-none dropdown-toggle w-100"
                    type="button"
                    id="topnav-promotion"
                    role="button"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    할인프로모션
                  </button>
                  <ul
                    className="dropdown-menu rounded-0 font-14 bg-menu border-top-white"
                    aria-labelledby="topnav-promotion"
                  >
                    <li className="px-2 py-1">
                      <a
                        href="/promotion/promotion_ing_thumb?is_promotion=Y"
                        className="dropdown-item"
                      >
                        할인진행중
                      </a>
                    </li>
                    {showSeasonBanner && (
                      <li className="px-2 py-1">
                        <a href="/promotion/promotion_season" className="dropdown-item">
                          2026 여름 프로모션
                        </a>
                      </li>
                    )}
                    <li className="px-2 py-1">
                      <a href="/promotion/promotion_weekend" className="dropdown-item">
                        주말특가 프로모션
                      </a>
                    </li>
                    {promotionGroups.map((group) => (
                      <li key={group.idx} className="px-2 py-1">
                        <a href={`/game/group_thumb?idx=${group.idx}`} className="dropdown-item">
                          {group.subject}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </li>
              <li className="nav-item text-center col-2 border-top-0 border-bottom-0 border-start-0 border-end py-2">
                <a
                  href="/event/event"
                  className="btn btn-link fw-600 font-16 text-decoration-none w-100"
                >
                  이벤트
                </a>
              </li>
              <li className="nav-item text-center col-2 border-top-0 border-bottom-0 border-start-0 border-end py-2">
                <a
                  href="/board/notice"
                  className="btn btn-link fw-600 font-16 text-decoration-none w-100"
                >
                  공지사항
                </a>
              </li>
              <li className="nav-item text-center col-2 border-top-0 border-bottom-0 border-start-0 border-end py-2">
                <div className="dropdown-center">
                  <button
                    className="btn btn-link fw-600 font-16 text-decoration-none dropdown-toggle w-100"
                    type="button"
                    id="topnav-guide"
                    role="button"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    이용안내
                  </button>
                  <ul
                    className="dropdown-menu rounded-0 font-14 w-100 bg-menu border-top-white"
                    aria-labelledby="topnav-guide"
                  >
                    <li className="px-2 py-1">
                      <a href="/service/guide" className="dropdown-item">
                        다이렉트 게임즈
                      </a>
                    </li>
                    <li className="px-2 py-1">
                      <a href="/service/guide_steam" className="dropdown-item">
                        스팀
                      </a>
                    </li>
                    <li className="px-2 py-1">
                      <a href="/service/guide_epic" className="dropdown-item">
                        에픽 게임즈
                      </a>
                    </li>
                    <li className="px-2 py-1">
                      <a href="/service/guide_rockstar" className="dropdown-item">
                        락스타 게임즈
                      </a>
                    </li>
                    <li className="px-2 py-1">
                      <a
                        href="https://xr-marketplace.com/ko/holomodels/play/ar"
                        className="dropdown-item"
                        target="_blank"
                      >
                        홀로 모델
                      </a>
                    </li>
                  </ul>
                </div>
              </li>
              <li className="nav-item  text-center col-2 border-top-0 border-bottom-0 border-start-0 py-2">
                <div className="dropdown-center">
                  <button
                    className="btn btn-link fw-600 font-16 text-decoration-none dropdown-toggle w-100"
                    type="button"
                    id="topnav-support"
                    role="button"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    고객지원
                  </button>
                  <ul
                    className="dropdown-menu rounded-0 font-14 w-100 bg-menu border-top-white"
                    aria-labelledby="topnav-support"
                  >
                    <li className="px-2 py-1">
                      <a href="/board/faq" className="dropdown-item">
                        자주묻는질문
                      </a>
                    </li>
                    <li className="px-2 py-1">
                      <a href="/mypage/mypage_qna_register" className="dropdown-item">
                        문의하기
                      </a>
                    </li>
                    <li className="px-2 py-1">
                      <a href="/board/dataroom" className="dropdown-item">
                        자료실
                      </a>
                    </li>
                  </ul>
                </div>
              </li>
            </ul>
          </div>
        </nav>
      </header>
      <nav className="navbar navbar-expand-lg navbar-dark py-0" id="navbar">
        <div className="container">
          <div className="collapse navbar-collapse" id="navbarsExample06">
            <ul className="navbar-nav me-auto mb-2 mb-xl-0 w-100 text-nowrap text-center">
              <li className="nav-item border-top-0 border-bottom-0 border-start-0 p-2 col-1">
                <a className="nav-link font-14 px-3" href="/game/game_thumb">
                  모든게임
                </a>
              </li>
              <li className="nav-item border-top-0 border-bottom-0 border-start-0 p-2 col-1">
                <a className="nav-link font-14 px-3" href="/game/goods_thumb">
                  PS액세서리
                </a>
              </li>
              <li className="nav-item border-top-0 border-bottom-0 border-start-0 p-2 col-1">
                <a className="nav-link font-14 px-3" href="/game/holomodels_thumb">
                  홀로 모델
                </a>
              </li>
              <li className="nav-item border-top-0 border-bottom-0 border-start-0 p-2 dropdown col-1">
                <a
                  className="nav-link font-14 px-3 dropdown-toggle"
                  href="#"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                  aria-haspopup="true"
                >
                  플랫폼별
                </a>
                <ul className="dropdown-menu rounded-0 border-top-blue bg-sub-menu">
                  <li>
                    <a
                      className="dropdown-item font-14"
                      href="/game/game_platform_thumb?platform=1"
                    >
                      Steam
                    </a>
                  </li>
                  <li>
                    <a
                      className="dropdown-item font-14"
                      href="/game/game_platform_thumb?platform=34"
                    >
                      Epic Games
                    </a>
                  </li>
                  <li>
                    <a
                      className="dropdown-item font-14"
                      href="/game/game_platform_thumb?platform=35"
                    >
                      Rockstar Games
                    </a>
                  </li>
                </ul>
              </li>
              <li className="nav-item border-top-0 border-bottom-0 border-start-0 p-2 dropdown col-1">
                <a
                  className="nav-link font-14 px-3 dropdown-toggle"
                  href="#"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                  aria-haspopup="true"
                >
                  장르별
                </a>
                <ul className="dropdown-menu rounded-0 border-top-blue bg-sub-menu">
                  <li>
                    <a
                      className="dropdown-item font-14"
                      href="/game/game_genre_thumb?genre_code=G0001"
                    >
                      액션
                    </a>
                  </li>
                  <li>
                    <a
                      className="dropdown-item font-14"
                      href="/game/game_genre_thumb?genre_code=G0002"
                    >
                      어드벤처
                    </a>
                  </li>
                  <li>
                    <a
                      className="dropdown-item font-14"
                      href="/game/game_genre_thumb?genre_code=G0003"
                    >
                      RPG
                    </a>
                  </li>
                  <li>
                    <a
                      className="dropdown-item font-14"
                      href="/game/game_genre_thumb?genre_code=G0004"
                    >
                      전략
                    </a>
                  </li>
                  <li>
                    <a
                      className="dropdown-item font-14"
                      href="/game/game_genre_thumb?genre_code=G0005"
                    >
                      시뮬레이션
                    </a>
                  </li>
                  <li>
                    <a
                      className="dropdown-item font-14"
                      href="/game/game_genre_thumb?genre_code=G0006"
                    >
                      스포츠
                    </a>
                  </li>
                  <li>
                    <a
                      className="dropdown-item font-14"
                      href="/game/game_genre_thumb?genre_code=G0010"
                    >
                      레이싱
                    </a>
                  </li>
                  <li>
                    <a
                      className="dropdown-item font-14"
                      href="/game/game_genre_thumb?genre_code=G0007"
                    >
                      캐주얼
                    </a>
                  </li>
                  <li>
                    <a
                      className="dropdown-item font-14"
                      href="/game/game_genre_thumb?genre_code=G0008"
                    >
                      인디
                    </a>
                  </li>
                  <li>
                    <a
                      className="dropdown-item font-14"
                      href="/game/game_genre_thumb?genre_code=G0009"
                    >
                      앞서 해보기
                    </a>
                  </li>
                </ul>
              </li>
              <li className="nav-item border-top-0 border-bottom-0 border-start-0 p-2 dropdown dropdown-fullwidth col-1">
                <a
                  className="nav-link font-14 px-3 dropdown-toggle"
                  href="#"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                  aria-haspopup="true"
                  role="button"
                >
                  카테고리별
                </a>
                <div className="dropdown-menu w-100 rounded-0 border-top-blue bg-sub-menu">
                  <div className="row g-0 d-flex flex-row">
                    <div className="col-3 border-end border-menu">
                      <div className="nav-group mb-2">
                        <strong className="navbar-text text-white font-14 ps-3 mb-2">
                          플레이어 수
                        </strong>
                        <ul className="nav flex-column ps-3 mb-2">
                          <li className="nav-item border-0">
                            <a
                              className="dropdown-item font-14"
                              href="/game/game_category_thumb?category_code=C0001001"
                            >
                              싱글 플레이어
                            </a>
                          </li>
                          <li className="nav-item border-0">
                            <a
                              className="dropdown-item font-14"
                              href="/game/game_category_thumb?category_code=C0001002"
                            >
                              멀티 플레이어
                            </a>
                          </li>
                          <li className="nav-item border-0">
                            <a
                              className="dropdown-item font-14"
                              href="/game/game_category_thumb?category_code=C0001003"
                            >
                              온라인 PvP
                            </a>
                          </li>
                          <li className="nav-item border-0">
                            <a
                              className="dropdown-item font-14"
                              href="/game/game_category_thumb?category_code=C0001004"
                            >
                              온라인 협동
                            </a>
                          </li>
                          <li className="nav-item border-0">
                            <a
                              className="dropdown-item font-14"
                              href="/game/game_category_thumb?category_code=C0001005"
                            >
                              LAN PvP
                            </a>
                          </li>
                          <li className="nav-item border-0">
                            <a
                              className="dropdown-item font-14"
                              href="/game/game_category_thumb?category_code=C0001006"
                            >
                              LAN 협동
                            </a>
                          </li>
                          <li className="nav-item border-0">
                            <a
                              className="dropdown-item font-14"
                              href="/game/game_category_thumb?category_code=C0001007"
                            >
                              협동
                            </a>
                          </li>
                          <li className="nav-item border-0">
                            <a
                              className="dropdown-item font-14"
                              href="/game/game_category_thumb?category_code=C0001008"
                            >
                              MMO
                            </a>
                          </li>
                          <li className="nav-item border-0">
                            <a
                              className="dropdown-item font-14"
                              href="/game/game_category_thumb?category_code=C0001009"
                            >
                              플랫폼간 멀티플레이어
                            </a>
                          </li>
                          <li className="nav-item border-0">
                            <a
                              className="dropdown-item font-14"
                              href="/game/game_category_thumb?category_code=C0001011"
                            >
                              4인 로컬 플레이
                            </a>
                          </li>
                          <li className="nav-item border-0">
                            <a
                              className="dropdown-item font-14"
                              href="/game/game_category_thumb?category_code=C0001012"
                            >
                              로컬 멀티플레이어
                            </a>
                          </li>
                          <li className="nav-item border-0">
                            <a
                              className="dropdown-item font-14"
                              href="/game/game_category_thumb?category_code=C0001013"
                            >
                              비동기 멀티플레이어
                            </a>
                          </li>
                          <li className="nav-item border-0">
                            <a
                              className="dropdown-item font-14"
                              href="/game/game_category_thumb?category_code=C0001014"
                            >
                              대규모 멀티플레이어
                            </a>
                          </li>
                        </ul>
                      </div>
                    </div>
                    <div className="col-3 border-end border-menu">
                      <div className="nav-group">
                        <strong className="navbar-text text-white font-14 ps-3">
                          화면 및 디스플레이
                        </strong>
                        <ul className="nav flex-column ps-3 mb-2">
                          <li className="nav-item border-0">
                            <a
                              className="dropdown-item font-14"
                              href="/game/game_category_thumb?category_code=C0002001"
                            >
                              HDR 사용 가능
                            </a>
                          </li>
                          <li className="nav-item border-0">
                            <a
                              className="dropdown-item font-14"
                              href="/game/game_category_thumb?category_code=C0002002"
                            >
                              스크린 공유 및 분할 PvP
                            </a>
                          </li>
                          <li className="nav-item border-0">
                            <a
                              className="dropdown-item font-14"
                              href="/game/game_category_thumb?category_code=C0002003"
                            >
                              스크린 공유 및 분할 협동
                            </a>
                          </li>
                          <li className="nav-item border-0">
                            <a
                              className="dropdown-item font-14"
                              href="/game/game_category_thumb?category_code=C0002004"
                            >
                              공유/분할 화면
                            </a>
                          </li>
                        </ul>
                      </div>
                      <div className="nav-group">
                        <strong className="navbar-text text-white font-14 ps-3">
                          VR 및 컨트롤러 지원
                        </strong>
                        <ul className="nav flex-column ps-3 mb-2">
                          <li className="nav-item border-0">
                            <a
                              className="dropdown-item font-14"
                              href="/game/game_category_thumb?category_code=C0003001"
                            >
                              VR 전용
                            </a>
                          </li>
                          <li className="nav-item border-0">
                            <a
                              className="dropdown-item font-14"
                              href="/game/game_category_thumb?category_code=C0003002"
                            >
                              VR 지원
                            </a>
                          </li>
                          <li className="nav-item border-0">
                            <a
                              className="dropdown-item font-14"
                              href="/game/game_category_thumb?category_code=C0003003"
                            >
                              추적되는 컨트롤러 지원
                            </a>
                          </li>
                          <li className="nav-item border-0">
                            <a
                              className="dropdown-item font-14"
                              href="/game/game_category_thumb?category_code=C0003004"
                            >
                              컨트롤러 완벽 지원
                            </a>
                          </li>
                          <li className="nav-item border-0">
                            <a
                              className="dropdown-item font-14"
                              href="/game/game_category_thumb?category_code=C0003005"
                            >
                              컨트롤러 일부 지원
                            </a>
                          </li>
                        </ul>
                      </div>
                    </div>
                    <div className="col-3 border-end border-menu">
                      <div className="nav-group">
                        <strong className="navbar-text text-white font-14 ps-3">
                          게임 서비스 및 기능
                        </strong>
                        <ul className="nav flex-column ps-3 mb-2">
                          <li className="nav-item border-0">
                            <a
                              className="dropdown-item font-14"
                              href="/game/game_category_thumb?category_code=C0004001"
                            >
                              코멘터리 제공
                            </a>
                          </li>
                          <li className="nav-item border-0">
                            <a
                              className="dropdown-item font-14"
                              href="/game/game_category_thumb?category_code=C0004002"
                            >
                              추가적인 고품질 오디오
                            </a>
                          </li>
                          <li className="nav-item border-0">
                            <a
                              className="dropdown-item font-14"
                              href="/game/game_category_thumb?category_code=C0004003"
                            >
                              레벨 에디터 포함
                            </a>
                          </li>
                          <li className="nav-item border-0">
                            <a
                              className="dropdown-item font-14"
                              href="/game/game_category_thumb?category_code=C0004004"
                            >
                              다운로드 가능한 콘텐츠
                            </a>
                          </li>
                        </ul>
                      </div>
                    </div>
                    <div className="col-3 border-end border-menu">
                      <div className="nav-group">
                        <strong className="navbar-text text-white font-14 ps-3">
                          플레이스테이션 액세서리
                        </strong>
                        <ul className="nav flex-column ps-3 mb-2">
                          <li className="nav-item border-0">
                            <a
                              className="dropdown-item font-14"
                              href="/game/goods_category_thumb?category_code=P0003001"
                            >
                              무선 컨트롤러
                            </a>
                          </li>
                          <li className="nav-item border-0">
                            <a
                              className="dropdown-item font-14"
                              href="/game/goods_category_thumb?category_code=P0003002"
                            >
                              고급 컨트롤러
                            </a>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
              <li className="nav-item border-top-0 border-bottom-0 border-start-0 p-2 dropdown col-1">
                <a
                  className="nav-link font-14 px-3 dropdown-toggle"
                  href="#"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                  aria-haspopup="true"
                >
                  퍼블리셔별
                </a>
                <ul className="dropdown-menu rounded-0 border-top-blue bg-sub-menu">
                  <li>
                    <a className="dropdown-item font-14" href="/game/publisher_2k_thumb">
                      2K
                    </a>
                  </li>
                  <li>
                    <a className="dropdown-item font-14" href="/game/publisher_sega_thumb">
                      SEGA
                    </a>
                  </li>
                  <li>
                    <a className="dropdown-item font-14" href="/game/publisher_capcom_thumb">
                      CAPCOM
                    </a>
                  </li>
                  <li>
                    <a className="dropdown-item font-14" href="/game/publisher_paradox_thumb">
                      Paradox Interactive
                    </a>
                  </li>
                  <li>
                    <a className="dropdown-item font-14" href="/game/publisher_playstation_thumb">
                      PlayStation Publishing LLC
                    </a>
                  </li>
                  <li>
                    <a className="dropdown-item font-14" href="/game/publisher_neowiz_thumb">
                      NEOWIZ
                    </a>
                  </li>
                  <li>
                    <a className="dropdown-item font-14" href="/game/publisher_asw_thumb">
                      Arc System Works
                    </a>
                  </li>
                  <li>
                    <a className="dropdown-item font-14" href="/game/publisher_thq_thumb">
                      THQ Nordic
                    </a>
                  </li>
                  <li>
                    <a className="dropdown-item font-14" href="/game/publisher_505_games_thumb">
                      505 Games
                    </a>
                  </li>
                  <li>
                    <a className="dropdown-item font-14" href="/game/publisher_focus_thumb">
                      Focus Entertainment
                    </a>
                  </li>
                  <li>
                    <a className="dropdown-item font-14" href="/game/publisher_hooded_horse_thumb">
                      Hooded Horse
                    </a>
                  </li>
                  <li>
                    <a
                      className="dropdown-item font-14"
                      href="/game/publisher_clouded_leopard_thumb"
                    >
                      Clouded Leopard Entertainment
                    </a>
                  </li>
                </ul>
              </li>
              <li className="nav-item border-top-0 border-bottom-0 border-start-0 p-2 dropdown col-1">
                <a
                  className="nav-link font-14 px-3 dropdown-toggle"
                  href="#"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                  aria-haspopup="true"
                >
                  한국어지원
                </a>
                <ul className="dropdown-menu rounded-0 border-top-blue bg-sub-menu">
                  <li>
                    <a
                      className="dropdown-item font-14"
                      href="/game/game_search_thumb?interface_korean=Y"
                    >
                      자막 한국어지원
                    </a>
                  </li>
                  <li>
                    <a
                      className="dropdown-item font-14"
                      href="/game/game_search_thumb?spoken_korean=Y"
                    >
                      음성 한국어지원
                    </a>
                  </li>
                  <li>
                    <a
                      className="dropdown-item font-14"
                      href="/game/game_search_thumb?exclusive_korean=Y"
                    >
                      독점 한국어지원
                    </a>
                  </li>
                </ul>
              </li>
              <li className="nav-item border-top-0 border-bottom-0 border-start-0 p-2 col-1">
                <a className="nav-link font-14 px-3" href="/game/game_thumb?is_preorder=Y">
                  예약구매
                </a>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </>
  );
}

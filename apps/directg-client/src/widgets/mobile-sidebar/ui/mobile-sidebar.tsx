import type { PromotionGroup } from "@entities/promotion-group";

interface MobileSidebarProps {
  isLoggedIn: boolean;
  memberName?: string;
  promotionGroups: PromotionGroup[];
}

/** 시즌 프로모션 링크 노출 구간 (legacy 하드코딩: 2026-06-25 16:00 ~ 2026-07-09 16:00). */
const isSeasonLinkOpen = (now: Date) =>
  now >= new Date("2026-06-25T16:00:00") && now < new Date("2026-07-09T16:00:00");

/**
 * 모바일 사이드바 offcanvas(#sidebarPanel) — legacy `mobile/inc/sidebar.html` 재현.
 * 메인헤더/하단 메뉴의 메뉴 버튼(data-bs-target="#sidebarPanel")이 여는 공유 chrome.
 * 세션분기(프로필/로그인·로그아웃) + 할인프로모션 아코디언(동적 group) + 정적 메뉴/아코디언 6종.
 * 아코디언·모달은 Bootstrap 네이티브(레이아웃이 bootstrap.min.js 로드).
 */
export function MobileSidebar({ isLoggedIn, memberName, promotionGroups }: MobileSidebarProps) {
  const showSeasonLink = isSeasonLinkOpen(new Date());

  return (
    <div
      className="modal fade panelbox panelbox-left"
      id="sidebarPanel"
      tabIndex={-1}
      role="dialog"
    >
      <div className="modal-dialog" role="document">
        <div className="modal-content">
          <div className="modal-body p-0 border-0 mb-5 pb-2">
            <div className="profileBox">
              <div className="in d-flex">
                {isLoggedIn ? (
                  <div className="d-flex flex-column justify-content-center">
                    <div className="">
                      <strong>[{memberName}]님</strong>
                    </div>
                  </div>
                ) : (
                  <a href="/member/login">
                    <span className="text-white">로그인을 해주세요.</span>
                  </a>
                )}
              </div>
              <a href="#" className="close-sidebar-button" data-bs-dismiss="modal">
                <span className="material-icons">close</span>
              </a>
            </div>

            <div className="section full side-button">
              <div
                className="d-flex flex-column justify-content-around"
                style={{ height: "6.5rem" }}
              >
                <div className="d-flex justify-content-center text-center">
                  {isLoggedIn ? (
                    <div className="col-6 icon icon-top">
                      <a href="/member/logout" className="btn btn-outline-login w-100">
                        <img src="/mobile-assets/img/icon/logout-icon.svg" /> 로그아웃
                      </a>
                    </div>
                  ) : (
                    <div className="col-6 icon icon-top">
                      <a href="/member/login" className="btn btn-outline-login w-100">
                        <img src="/mobile-assets/img/icon/login-icon.svg" /> 로그인
                      </a>
                    </div>
                  )}
                  <div className="col-6 icon">
                    <a href="/mypage/mypage_main" className="btn btn-cprimary w-100">
                      <img src="/mobile-assets/images/icon/user-icon_white.svg" /> 마이페이지
                    </a>
                  </div>
                </div>
                <div className="d-flex justify-content-center text-center">
                  <div className="col-6 icon">
                    <a href="/mypage/mypage_wishlist" className="btn btn-outline-cdanger w-100">
                      <img src="/mobile-assets/img/icon/wishlist-icon_y.svg" /> 위시리스트
                    </a>
                  </div>
                  <div className="col-6 icon">
                    <a href="/order/cart" className="btn btn-cinfo w-100">
                      <img src="/mobile-assets/img/icon/basket-icon-white.svg" /> 장바구니
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <div className="listview text-white border-0">
              <ul className="listview link-listview border-top-0 border-bottom-0">
                <li className="">
                  <a href="/index.php" className="item">
                    <div className="in d-flex align-item-center">
                      <span className="font-16 text-white">홈</span>
                    </div>
                  </a>
                </li>
              </ul>
            </div>

            <div className="listview text-white border-0">
              <ul className="listview link-listview border-top-0 border-bottom-0">
                <li className="">
                  <a href="/service/service" className="item">
                    <div className="in">
                      <span className="font-16">서비스소개</span>
                    </div>
                  </a>
                </li>
              </ul>
            </div>

            <div className="listview text-white border-0">
              <div className="accordion border-0" id="accordionExample3">
                <div className="accordion-item border-0">
                  <h2 className="accordion-header border-0">
                    <button
                      className="accordion-button collapsed font-16 border-0"
                      type="button"
                      data-bs-toggle="collapse"
                      data-bs-target="#accordion07"
                      aria-expanded="false"
                    >
                      할인프로모션
                    </button>
                  </h2>
                  <div
                    id="accordion07"
                    className="accordion-collapse collapse border-0"
                    data-bs-parent="#accordionExample3"
                  >
                    <div className="accordion-body p-0">
                      <ul className="listview link-listview">
                        <li className="ps-1">
                          <a href="/promotion/promotion_ing_thumb" className="item">
                            할인진행중
                          </a>
                        </li>
                        <li className="ps-1">
                          <a href="/promotion/promotion_weekend" className="item">
                            주말특가 프로모션
                          </a>
                        </li>
                        {showSeasonLink && (
                          <li className="ps-1">
                            <a href="/promotion/promotion_season" className="item">
                              2026 여름 프로모션
                            </a>
                          </li>
                        )}
                        {promotionGroups.map((group) => (
                          <li className="ps-1" key={group.idx}>
                            <a href={`/game/group_thumb?idx=${group.idx}`} className="item">
                              {group.subject}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="listview text-white border-0">
              <ul className="listview link-listview border-top-0 border-bottom-0">
                <li className="">
                  <a href="/event/event" className="item">
                    <div className="in">
                      <span className="font-16">이벤트</span>
                    </div>
                  </a>
                </li>
              </ul>
            </div>
            <div className="listview text-white border-0">
              <ul className="listview link-listview border-top-0 border-bottom-0">
                <li className="">
                  <a href="/board/notice" className="item">
                    <div className="in">
                      <span className="font-16">공지사항</span>
                    </div>
                  </a>
                </li>
              </ul>
            </div>

            <div className="listview text-white border-0">
              <ul className="listview link-listview border-top-0 border-bottom-0">
                <li className="border-0">
                  <a href="/game/game_thumb" className="item">
                    <div className="in">
                      <span className="font-16">모든게임</span>
                    </div>
                  </a>
                </li>
              </ul>
            </div>

            <div className="listview text-white border-0">
              <ul className="listview link-listview border-top-0 border-bottom-0">
                <li className="border-0">
                  <a href="/game/goods_thumb" className="item">
                    <div className="in">
                      <span className="font-16">PS액세서리</span>
                    </div>
                  </a>
                </li>
              </ul>
            </div>

            <div className="listview text-white border-0">
              <ul className="listview link-listview border-top-0 border-bottom-0">
                <li className="border-0">
                  <a href="/game/holomodels_thumb" className="item">
                    <div className="in">
                      <span className="font-16">홀로 모델</span>
                    </div>
                  </a>
                </li>
              </ul>
            </div>

            <div className="listview text-white border-0">
              <ul className="listview link-listview border-top-0 border-bottom-0">
                <li className="border-0">
                  <a href="/game/game_thumb?is_preorder=Y" className="item">
                    <div className="in">
                      <span className="font-16">예약구매</span>
                    </div>
                  </a>
                </li>
              </ul>
            </div>

            <div className="section full mt-0 mb-2">
              <div className="accordion border-0" id="accordionExample2">
                <div className="accordion-item border-0">
                  <h2 className="accordion-header border-0">
                    <button
                      className="accordion-button collapsed font-16 border-0"
                      type="button"
                      data-bs-toggle="collapse"
                      data-bs-target="#accordion01"
                      aria-expanded="false"
                    >
                      플랫폼별
                    </button>
                  </h2>
                  <div
                    id="accordion01"
                    className="accordion-collapse collapse border-0"
                    data-bs-parent="#accordionExample2"
                  >
                    <div className="accordion-body p-0">
                      <ul className="listview link-listview">
                        <li className="ps-1">
                          <a href="/game/game_platform_thumb?platform=1" className="item">
                            Steam
                          </a>
                        </li>
                        <li className="ps-1">
                          <a href="/game/game_platform_thumb?platform=34" className="item">
                            Epic Games
                          </a>
                        </li>
                        <li className="ps-1">
                          <a href="/game/game_platform_thumb?platform=35" className="item">
                            Rockstar Games
                          </a>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
                <div className="accordion-item">
                  <h2 className="accordion-header">
                    <button
                      className="accordion-button collapsed font-16"
                      type="button"
                      data-bs-toggle="collapse"
                      data-bs-target="#accordion02"
                      aria-expanded="false"
                    >
                      장르별
                    </button>
                  </h2>
                  <div
                    id="accordion02"
                    className="accordion-collapse collapse"
                    data-bs-parent="#accordionExample2"
                  >
                    <div className="accordion-body p-0">
                      <ul className="listview link-listview">
                        <li className="ps-1">
                          <a href="/game/game_genre_thumb?genre_code=G0001" className="item">
                            액션
                          </a>
                        </li>
                        <li className="ps-1">
                          <a href="/game/game_genre_thumb?genre_code=G0002" className="item">
                            어드벤처
                          </a>
                        </li>
                        <li className="ps-1">
                          <a href="/game/game_genre_thumb?genre_code=G0003" className="item">
                            RPG
                          </a>
                        </li>
                        <li className="ps-1">
                          <a href="/game/game_genre_thumb?genre_code=G0004" className="item">
                            전략
                          </a>
                        </li>
                        <li className="ps-1">
                          <a href="/game/game_genre_thumb?genre_code=G0005" className="item">
                            시뮬레이션
                          </a>
                        </li>
                        <li className="ps-1">
                          <a href="/game/game_genre_thumb?genre_code=G0006" className="item">
                            스포츠
                          </a>
                        </li>
                        <li className="ps-1">
                          <a href="/game/game_genre_thumb?genre_code=G0010" className="item">
                            레이싱
                          </a>
                        </li>
                        <li className="ps-1">
                          <a href="/game/game_genre_thumb?genre_code=G0007" className="item">
                            캐주얼
                          </a>
                        </li>
                        <li className="ps-1">
                          <a href="/game/game_genre_thumb?genre_code=G0008" className="item">
                            인디
                          </a>
                        </li>
                        <li className="ps-1">
                          <a href="/game/game_genre_thumb?genre_code=G0009" className="item">
                            앞서 해보기
                          </a>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
                <div className="accordion-item">
                  <h2 className="accordion-header">
                    <button
                      className="accordion-button collapsed font-16"
                      type="button"
                      data-bs-toggle="collapse"
                      data-bs-target="#accordion03"
                      aria-expanded="false"
                    >
                      퍼블리셔별
                    </button>
                  </h2>
                  <div
                    id="accordion03"
                    className="accordion-collapse collapse"
                    data-bs-parent="#accordionExample2"
                  >
                    <div className="accordion-body p-0">
                      <ul className="listview link-listview">
                        <li className="ps-1">
                          <a href="/game/publisher_2k_thumb" className="item" title="2K">
                            2K
                          </a>
                        </li>
                        <li className="ps-1">
                          <a href="/game/publisher_sega_thumb" className="item" title="SEGA">
                            SEGA
                          </a>
                        </li>
                        <li className="ps-1">
                          <a href="/game/publisher_capcom_thumb" className="item" title="CAPCOM">
                            CAPCOM
                          </a>
                        </li>
                        <li className="ps-1">
                          <a
                            href="/game/publisher_paradox_thumb"
                            className="item"
                            title="Paradox Interactive"
                          >
                            Paradox Interactive
                          </a>
                        </li>
                        <li className="ps-1">
                          <a
                            href="/game/publisher_playstation_thumb"
                            className="item"
                            title="PlayStation PC LLC"
                          >
                            PlayStation PC LLC
                          </a>
                        </li>
                        <li className="ps-1">
                          <a href="/game/publisher_neowiz_thumb" className="item" title="NEOWIZ">
                            NEOWIZ
                          </a>
                        </li>
                        <li className="ps-1">
                          <a
                            href="/game/publisher_asw_thumb"
                            className="item"
                            title="Arc System Works"
                          >
                            Arc System Works
                          </a>
                        </li>
                        <li className="ps-1">
                          <a href="/game/publisher_thq_thumb" className="item" title="THQ Nordic">
                            THQ Nordic
                          </a>
                        </li>
                        <li className="ps-1">
                          <a
                            href="/game/publisher_505_games_thumb"
                            className="item"
                            title="505 Games"
                          >
                            505 Games
                          </a>
                        </li>
                        <li className="ps-1">
                          <a
                            href="/game/publisher_focus_thumb"
                            className="item"
                            title="Focus Entertainment"
                          >
                            Focus Entertainment
                          </a>
                        </li>
                        <li className="ps-1">
                          <a
                            href="/game/publisher_hooded_horse_thumb"
                            className="item"
                            title="Hooded Horse"
                          >
                            Hooded Horse
                          </a>
                        </li>
                        <li className="ps-1">
                          <a
                            href="/game/publisher_clouded_leopard_thumb"
                            className="item"
                            title="Clouded Leopard Entertainment"
                          >
                            Clouded Leopard Entertainment
                          </a>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
                <div className="accordion-item">
                  <h2 className="accordion-header">
                    <button
                      className="accordion-button collapsed font-16"
                      type="button"
                      data-bs-toggle="collapse"
                      data-bs-target="#accordion04"
                      aria-expanded="false"
                    >
                      한국어지원
                    </button>
                  </h2>
                  <div
                    id="accordion04"
                    className="accordion-collapse collapse"
                    data-bs-parent="#accordionExample2"
                  >
                    <div className="accordion-body p-0">
                      <ul className="listview link-listview">
                        <li className="ps-1">
                          <a href="/game/game_thumb?interface_korean=Y" className="item">
                            자막 한국어지원
                          </a>
                        </li>
                        <li className="ps-1">
                          <a href="/game/game_thumb?spoken_korean=Y" className="item">
                            음성 한국어지원
                          </a>
                        </li>
                        <li className="ps-1">
                          <a href="/game/game_thumb?exclusive_korean=Y" className="item">
                            독점 한국어지원
                          </a>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
                <div className="accordion-item">
                  <h2 className="accordion-header">
                    <button
                      className="accordion-button collapsed font-16"
                      type="button"
                      data-bs-toggle="collapse"
                      data-bs-target="#accordion05"
                      aria-expanded="false"
                    >
                      이용안내
                    </button>
                  </h2>
                  <div
                    id="accordion05"
                    className="accordion-collapse collapse"
                    data-bs-parent="#accordionExample2"
                  >
                    <div className="accordion-body p-0 border-0">
                      <ul className="listview link-listview border-top-0 border-bottom-1">
                        <li className="ps-1">
                          <a href="/service/guide_steam" className="item">
                            <span className="font-16">스팀</span>
                          </a>
                        </li>
                        <li className="ps-1">
                          <a href="/service/guide_epic" className="item">
                            <span className="font-16">에픽 게임즈</span>
                          </a>
                        </li>
                        <li className="ps-1">
                          <a href="/service/guide_rockstar" className="item">
                            <span className="font-16">락스타 게임즈</span>
                          </a>
                        </li>
                        <li className="ps-1">
                          <a
                            href="https://xr-marketplace.com/ko/holomodels/play/ar"
                            className="item"
                          >
                            <span className="font-16">홀로 모델</span>
                          </a>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
                <div className="accordion-item">
                  <h2 className="accordion-header">
                    <button
                      className="accordion-button collapsed font-16"
                      type="button"
                      data-bs-toggle="collapse"
                      data-bs-target="#accordion06"
                      aria-expanded="false"
                    >
                      고객지원
                    </button>
                  </h2>
                  <div
                    id="accordion06"
                    className="accordion-collapse collapse"
                    data-bs-parent="#accordionExample2"
                  >
                    <div className="accordion-body p-0">
                      <ul className="listview link-listview border-top-0 border-bottom-0">
                        <li className="ps-1">
                          <a href="/board/faq" className="item">
                            <div className="in">
                              <span className="font-16">자주묻는질문</span>
                            </div>
                          </a>
                        </li>
                        <li className="ps-1">
                          <a href="/mypage/mypage_qna_register" className="item">
                            <div className="in">
                              <span className="font-16">문의하기</span>
                            </div>
                          </a>
                        </li>
                        <li className="ps-1">
                          <a href="/board/dataroom" className="item">
                            <div className="in">
                              <span className="font-16">자료실</span>
                            </div>
                          </a>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

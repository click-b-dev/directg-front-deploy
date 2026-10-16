/**
 * 모바일 하단 고정 메뉴 — legacy `mobile/inc/sub_bottom_menu.html` 재현.
 * 메뉴(사이드바 offcanvas)/할인진행중/모든게임/PS액세서리 + 로그인 분기(마이페이지 vs 회원가입).
 * (사이드바 offcanvas 본체는 후속 단위 — 메뉴 버튼 마크업만 legacy 동일 유지.)
 */
export function MobileBottomNav({ isLoggedIn }: { isLoggedIn: boolean }) {
  return (
    <div className="section full mt-2">
      <div className="appBottomMenu border-top-0">
        <a
          href="#"
          className="headerButton item"
          data-bs-toggle="modal"
          data-bs-target="#sidebarPanel"
        >
          <div className="col">
            <img src="/mobile-assets/images/icon/menu_icon_white.svg" alt="메뉴" />
            <strong className="font-10 text-nowrap">메뉴</strong>
          </div>
        </a>
        <a href="/promotion/promotion_ing_thumb" className="item">
          <div className="col">
            <img src="/mobile-assets/images/icon/discount_icon_white.svg" alt="할인진행중" />
            <strong className="font-10 text-nowrap">할인진행중</strong>
          </div>
        </a>
        <a href="/game/game_thumb" className="item">
          <div className="col">
            <img src="/mobile-assets/images/icon/allgames_icon_white.svg" alt="모든게임" />
            <strong className="font-10 text-nowrap">모든게임</strong>
          </div>
        </a>
        <a href="/game/goods_thumb" className="item">
          <div className="col">
            <img src="/mobile-assets/images/icon/ps_icon_white.svg" alt="PS액세서리" />
            <strong className="font-10 text-nowrap">PS액세서리</strong>
          </div>
        </a>
        {isLoggedIn ? (
          <a href="/mypage/mypage_main" className="item">
            <div className="col">
              <img src="/mobile-assets/images/icon/user-icon_white.svg" alt="마이페이지" />
              <strong className="font-10 text-nowrap">마이페이지</strong>
            </div>
          </a>
        ) : (
          <a href="/member/join_step1" className="item">
            <div className="col">
              <img src="/mobile-assets/images/icon/user-add_icon_white.svg" alt="회원가입" />
              <strong className="font-10 text-nowrap">회원가입</strong>
            </div>
          </a>
        )}
      </div>
    </div>
  );
}

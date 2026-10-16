import { MobileGuideFooter } from "@widgets/mobile-guide-footer";

import { MobileGuidePurchaseCarousel } from "./mobile-guide-purchase-carousel";

/**
 * 모바일 이용가이드 step2 — 구매방법 (legacy `mobile/service/guide_step2.html`).
 * 커스텀 투명 헤더(닫기→/index.html, sub_header 아님) + `#appCapsule`(Sub 아님) + 9슬라이드 캐러셀 + footer.
 * bottom_menu/sidebar 없음(page style로 하단바 숨김).
 */
export function MobileServiceGuideStep2Screen() {
  return (
    <>
      <div className="appHeader no-border transparent mt-0">
        <div className="left"></div>
        <div className="pageTitle">다이렉트 게임즈 구매방법</div>
        <div className="right">
          <a href="/index" className="headerButton text-secondary">
            <ion-icon name="close"></ion-icon>
          </a>
        </div>
      </div>
      <div id="appCapsule" className="mt-0">
        <MobileGuidePurchaseCarousel />
        <MobileGuideFooter />
      </div>
    </>
  );
}

import { MobileSubHeader } from "@widgets/mobile-sub-header";
import { MobileGuideFooter } from "@widgets/mobile-guide-footer";

/**
 * 모바일 이용가이드 step1 — 회원가입 (legacy `mobile/service/guide_step1.html`).
 * legacy는 `#carousel-slider.splide`에 슬라이드 구조 없이 텍스트 "회원가입 안내"만 → Splide 마운트 불가(스텁).
 * 텍스트만 표시(useSplide 미적용, 캐러셀 no-op 재현). bottom_menu/sidebar 없음(page style로 하단바 숨김).
 */
export function MobileServiceGuideStep1Screen() {
  return (
    <>
      <MobileSubHeader pageTitle="회원가입" />
      <div id="appCapsuleSub" className="mt-0">
        {/* carousel slider */}
        <div className="carousel-slider splide" id="carousel-slider">
          회원가입 안내
        </div>
        {/* * carousel slider */}
        <MobileGuideFooter />
      </div>
    </>
  );
}

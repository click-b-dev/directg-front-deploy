import { MobileGuideCarouselShell } from "@widgets/mobile-guide-carousel";
import { MobileGuideFooter } from "@widgets/mobile-guide-footer";

import type { RockstarGuideStep } from "../model/steps";

/**
 * 모바일 Rockstar 이용가이드 step 공통 화면 (legacy `guide_rockstar_step1~4.html`).
 * 헤더 `appHeader no-border bg-primary`(닫기→step별 href, 대부분 guide_rockstar.html·step2만 guide_epic 복붙 버그).
 * `#appCapsule` + 캐러셀(JSX 슬라이드, ul.text-start) + footer(platform=35). bottom_menu 없음(라우트 style로 하단바 숨김).
 */
export function MobileServiceGuideRockstarStepScreen({ step }: { step: RockstarGuideStep }) {
  return (
    <>
      <div className={step.headerClassName}>
        <div className="left"></div>
        <div className="pageTitle">{step.pageTitle}</div>
        <div className="right">
          <a href={step.closeHref} className="close-button text-white">
            <ion-icon name="close"></ion-icon>
          </a>
        </div>
      </div>
      <div id="appCapsule" className={step.capsuleClassName}>
        <MobileGuideCarouselShell ulClassName="text-start">{step.slides}</MobileGuideCarouselShell>
        <MobileGuideFooter
          backLabel="뒤로 가기"
          gameHref="/game/game_platform_list?platform=35"
          gameLabel={step.gameLabel}
          buttonClassName={step.footerButtonClassName}
        />
      </div>
    </>
  );
}

import { MobileGuideFooter } from "@widgets/mobile-guide-footer";

import type { EpicGuideStep } from "../model/steps";
import { MobileGuideEpicCarousel } from "./mobile-guide-epic-carousel";

/**
 * 모바일 Epic 이용가이드 step 공통 화면 (legacy `guide_epic_step1~5.html`).
 * 헤더는 `appHeader no-border bg-primary`(닫기→`/service/guide_epic.html`, Steam의 transparent/index와 다름).
 * `#appCapsule` + epic 캐러셀(JSX 슬라이드) + footer. bottom_menu/sidebar 없음(라우트 page style로 하단바 숨김).
 */
export function MobileServiceGuideEpicStepScreen({ step }: { step: EpicGuideStep }) {
  return (
    <>
      <div className={step.headerClassName}>
        <div className="left"></div>
        <div className="pageTitle">{step.pageTitle}</div>
        <div className="right">
          <a href="/service/guide_epic" className={step.closeClassName}>
            <ion-icon name="close"></ion-icon>
          </a>
        </div>
      </div>
      <div id="appCapsule" className={step.capsuleClassName}>
        <MobileGuideEpicCarousel>{step.slides}</MobileGuideEpicCarousel>
        <MobileGuideFooter
          backLabel="뒤로 가기"
          gameHref="/game/game_platform_list?platform=34"
          gameLabel="Epic 목록"
          buttonClassName={step.footerButtonClassName}
        />
      </div>
    </>
  );
}

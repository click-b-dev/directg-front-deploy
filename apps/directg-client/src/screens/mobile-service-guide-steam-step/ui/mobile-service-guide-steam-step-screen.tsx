import { MobileGuideCarousel } from "@widgets/mobile-guide-carousel";
import { MobileGuideFooter } from "@widgets/mobile-guide-footer";

import type { SteamGuideStep } from "../model/steps";

/**
 * 모바일 Steam 이용가이드 step 공통 화면 (legacy `guide_steam_step1~5.html`).
 * 커스텀 투명 헤더(닫기→/index.html, sub_header 아님) + `#appCapsule`(Sub 아님) + 캐러셀 + footer.
 * bottom_menu/sidebar 없음(라우트 page style로 하단바 숨김). step별 데이터는 `SteamGuideStep`.
 */
export function MobileServiceGuideSteamStepScreen({ step }: { step: SteamGuideStep }) {
  return (
    <>
      <div className="appHeader no-border transparent mt-0">
        <div className="left"></div>
        <div className="pageTitle">{step.pageTitle}</div>
        <div className="right">
          <a href="/index" className="headerButton text-secondary">
            <ion-icon name="close"></ion-icon>
          </a>
        </div>
      </div>
      <div id="appCapsule" className="mt-0">
        <MobileGuideCarousel slides={step.slides} />
        <MobileGuideFooter
          backLabel="뒤로 가기"
          gameHref="/game/game_platform_list?platform=1"
          gameLabel={step.gameLabel}
          buttonClassName={step.buttonClassName}
        />
      </div>
    </>
  );
}
